import { eq, and, desc, asc, sql } from "drizzle-orm";
import { db } from "../db/index";
import * as schema from "../shared/developer-portal-schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export interface IDeveloperPortalStorage {
  // Portal Admin Management
  getPortalAdmin: (id: number) => Promise<schema.PortalAdmin | undefined>;
  getPortalAdminByEmail: (email: string) => Promise<schema.PortalAdmin | undefined>;
  createPortalAdmin: (admin: schema.InsertPortalAdmin) => Promise<schema.PortalAdmin>;
  updatePortalAdmin: (id: number, updates: Partial<schema.InsertPortalAdmin>) => Promise<schema.PortalAdmin>;
  
  // School Instance Management
  getSchoolInstance: (id: number) => Promise<schema.SchoolInstance | undefined>;
  getSchoolInstanceBySchoolId: (schoolId: string) => Promise<schema.SchoolInstance | undefined>;
  getSchoolInstanceBySubdomain: (subdomain: string) => Promise<schema.SchoolInstance | undefined>;
  getSchoolInstanceByApiKey: (apiKey: string) => Promise<schema.SchoolInstance | undefined>;
  getAllSchoolInstances: () => Promise<schema.SchoolInstance[]>;
  createSchoolInstance: (school: schema.InsertSchoolInstance) => Promise<schema.SchoolInstance>;
  updateSchoolInstance: (id: number, updates: Partial<schema.InsertSchoolInstance>) => Promise<schema.SchoolInstance>;
  deleteSchoolInstance: (id: number) => Promise<void>;
  
  // Credit Management
  getSchoolCredits: (schoolInstanceId: number) => Promise<schema.SchoolCredit | undefined>;
  updateSchoolCredits: (schoolInstanceId: number, credits: Partial<schema.InsertSchoolCredit>) => Promise<schema.SchoolCredit>;
  addCreditTransaction: (transaction: schema.InsertCreditTransaction) => Promise<schema.CreditTransaction>;
  getCreditTransactions: (schoolInstanceId: number) => Promise<schema.CreditTransaction[]>;
  
  // Template Management
  getDocumentTemplates: () => Promise<schema.DocumentTemplate[]>;
  getDocumentTemplate: (id: number) => Promise<schema.DocumentTemplate | undefined>;
  createDocumentTemplate: (template: schema.InsertDocumentTemplate) => Promise<schema.DocumentTemplate>;
  updateDocumentTemplate: (id: number, updates: Partial<schema.InsertDocumentTemplate>) => Promise<schema.DocumentTemplate>;
  deleteDocumentTemplate: (id: number) => Promise<void>;
  
  // School Template Access
  getSchoolTemplateAccess: (schoolInstanceId: number) => Promise<schema.SchoolTemplateAccess[]>;
  grantTemplateAccess: (access: schema.InsertSchoolTemplateAccess) => Promise<schema.SchoolTemplateAccess>;
  revokeTemplateAccess: (schoolInstanceId: number, templateId: number) => Promise<void>;
  
  // API Key Management
  getApiKeys: (schoolInstanceId: number) => Promise<schema.ApiKey[]>;
  createApiKey: (apiKey: schema.InsertApiKey) => Promise<schema.ApiKey>;
  updateApiKey: (id: number, updates: Partial<schema.InsertApiKey>) => Promise<schema.ApiKey>;
  deleteApiKey: (id: number) => Promise<void>;
  
  // Analytics and Logging
  addUsageAnalytics: (analytics: schema.InsertUsageAnalytics) => Promise<schema.UsageAnalytics>;
  getUsageAnalytics: (schoolInstanceId: number, startDate?: Date, endDate?: Date) => Promise<schema.UsageAnalytics[]>;
  addAuditLog: (log: schema.InsertAuditLog) => Promise<schema.AuditLog>;
  getAuditLogs: (schoolInstanceId?: number, limit?: number) => Promise<schema.AuditLog[]>;
  
  // Feature Management
  getFeatureFlags: () => Promise<schema.FeatureFlag[]>;
  createFeatureFlag: (flag: schema.InsertFeatureFlag) => Promise<schema.FeatureFlag>;
  getSchoolFeatureSettings: (schoolInstanceId: number) => Promise<schema.SchoolFeatureSetting[]>;
  updateSchoolFeatureSetting: (setting: schema.InsertSchoolFeatureSetting) => Promise<schema.SchoolFeatureSetting>;
  
  // Billing
  getBillingInfo: (schoolInstanceId: number) => Promise<schema.BillingInfo | undefined>;
  updateBillingInfo: (schoolInstanceId: number, billing: Partial<schema.InsertBillingInfo>) => Promise<schema.BillingInfo>;
}

export class DeveloperPortalStorage implements IDeveloperPortalStorage {
  
  // Portal Admin Methods
  async getPortalAdmin(id: number): Promise<schema.PortalAdmin | undefined> {
    const result = await db.select().from(schema.portalAdmins).where(eq(schema.portalAdmins.id, id));
    return result[0];
  }

  async getPortalAdminByEmail(email: string): Promise<schema.PortalAdmin | undefined> {
    const result = await db.select().from(schema.portalAdmins).where(eq(schema.portalAdmins.email, email));
    return result[0];
  }

  async createPortalAdmin(admin: schema.InsertPortalAdmin): Promise<schema.PortalAdmin> {
    const hashedPassword = await bcrypt.hash(admin.password, 12);
    const result = await db.insert(schema.portalAdmins).values({
      ...admin,
      password: hashedPassword
    }).returning();
    return result[0];
  }

  async updatePortalAdmin(id: number, updates: Partial<schema.InsertPortalAdmin>): Promise<schema.PortalAdmin> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }
    const result = await db.update(schema.portalAdmins)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.portalAdmins.id, id))
      .returning();
    return result[0];
  }

  // School Instance Methods
  async getSchoolInstance(id: number): Promise<schema.SchoolInstance | undefined> {
    const result = await db.select().from(schema.schoolInstances).where(eq(schema.schoolInstances.id, id));
    return result[0];
  }

  async getSchoolInstanceBySchoolId(schoolId: string): Promise<schema.SchoolInstance | undefined> {
    try {
      const result = await db.select().from(schema.schoolInstances).where(eq(schema.schoolInstances.schoolId, schoolId));
      return result[0];
    } catch (error: any) {
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        // Silently return undefined instead of logging warning repeatedly
        return undefined;
      }
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        // Table doesn't exist yet
        return undefined;
      }
      throw error;
    }
  }

  async getSchoolInstanceBySubdomain(subdomain: string): Promise<schema.SchoolInstance | undefined> {
    try {
      const result = await db.select().from(schema.schoolInstances).where(eq(schema.schoolInstances.subdomain, subdomain));
      return result[0];
    } catch (error: any) {
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        return undefined;
      }
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return undefined;
      }
      throw error;
    }
  }

  async getSchoolInstanceByApiKey(apiKey: string): Promise<schema.SchoolInstance | undefined> {
    try {
      const result = await db.select().from(schema.schoolInstances).where(eq(schema.schoolInstances.apiKey, apiKey));
      return result[0];
    } catch (error: any) {
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        return undefined;
      }
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return undefined;
      }
      throw error;
    }
  }

  async getAllSchoolInstances(): Promise<schema.SchoolInstance[]> {
    try {
      return await db.select().from(schema.schoolInstances).orderBy(desc(schema.schoolInstances.createdAt));
    } catch (error: any) {
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        return [];
      }
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return [];
      }
      throw error;
    }
  }

  async createSchoolInstance(school: schema.InsertSchoolInstance): Promise<schema.SchoolInstance> {
    const schoolId = `school_${nanoid(8)}`;
    const subdomain = schoolId.toLowerCase().replace('_', '');
    const apiKey = `pk_${nanoid(32)}`;
    const secretKey = `sk_${nanoid(48)}`;

    const result = await db.insert(schema.schoolInstances).values({
      ...school,
      schoolId,
      subdomain,
      apiKey,
      secretKey,
      trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
    }).returning();

    // Create initial credit allocation
    await db.insert(schema.schoolCredits).values({
      schoolInstanceId: result[0].id,
      totalCredits: 1000, // Free trial credits
      availableCredits: 1000
    });

    return result[0];
  }

  async updateSchoolInstance(id: number, updates: Partial<schema.InsertSchoolInstance>): Promise<schema.SchoolInstance> {
    const result = await db.update(schema.schoolInstances)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.schoolInstances.id, id))
      .returning();
    return result[0];
  }

  async deleteSchoolInstance(id: number): Promise<void> {
    await db.delete(schema.schoolInstances).where(eq(schema.schoolInstances.id, id));
  }

  // Credit Management Methods
  async getSchoolCredits(schoolInstanceId: number): Promise<schema.SchoolCredit | undefined> {
    const result = await db.select().from(schema.schoolCredits).where(eq(schema.schoolCredits.schoolInstanceId, schoolInstanceId));
    return result[0];
  }

  async updateSchoolCredits(schoolInstanceId: number, credits: Partial<schema.InsertSchoolCredit>): Promise<schema.SchoolCredit> {
    const result = await db.update(schema.schoolCredits)
      .set({ ...credits, updatedAt: new Date() })
      .where(eq(schema.schoolCredits.schoolInstanceId, schoolInstanceId))
      .returning();
    return result[0];
  }

  async addCreditTransaction(transaction: schema.InsertCreditTransaction): Promise<schema.CreditTransaction> {
    const result = await db.insert(schema.creditTransactions).values(transaction).returning();
    
    // Update school credits based on transaction type
    const currentCredits = await this.getSchoolCredits(transaction.schoolInstanceId);
    if (currentCredits) {
      let newCredits = currentCredits.availableCredits || 0;
      if (transaction.type === 'purchase' || transaction.type === 'bonus') {
        newCredits += transaction.amount;
      } else if (transaction.type === 'usage' && newCredits >= transaction.amount) {
        newCredits -= transaction.amount;
      }
      
      await this.updateSchoolCredits(transaction.schoolInstanceId, {
        availableCredits: newCredits,
        usedCredits: transaction.type === 'usage' ? (currentCredits.usedCredits || 0) + transaction.amount : (currentCredits.usedCredits || 0)
      });
    }

    return result[0];
  }

  async getCreditTransactions(schoolInstanceId: number): Promise<schema.CreditTransaction[]> {
    return await db.select().from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.schoolInstanceId, schoolInstanceId))
      .orderBy(desc(schema.creditTransactions.createdAt));
  }

  // Template Management Methods
  async getDocumentTemplates(): Promise<schema.DocumentTemplate[]> {
    return await db.select().from(schema.documentTemplates)
      .where(eq(schema.documentTemplates.isActive, true))
      .orderBy(asc(schema.documentTemplates.category), asc(schema.documentTemplates.name));
  }

  async getDocumentTemplate(id: number): Promise<schema.DocumentTemplate | undefined> {
    const result = await db.select().from(schema.documentTemplates).where(eq(schema.documentTemplates.id, id));
    return result[0];
  }

  async createDocumentTemplate(template: schema.InsertDocumentTemplate): Promise<schema.DocumentTemplate> {
    const result = await db.insert(schema.documentTemplates).values(template).returning();
    return result[0];
  }

  async updateDocumentTemplate(id: number, updates: Partial<schema.InsertDocumentTemplate>): Promise<schema.DocumentTemplate> {
    const result = await db.update(schema.documentTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.documentTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteDocumentTemplate(id: number): Promise<void> {
    await db.delete(schema.documentTemplates).where(eq(schema.documentTemplates.id, id));
  }

  // School Template Access Methods
  async getSchoolTemplateAccess(schoolInstanceId: number): Promise<schema.SchoolTemplateAccess[]> {
    return await db.select().from(schema.schoolTemplateAccess)
      .where(eq(schema.schoolTemplateAccess.schoolInstanceId, schoolInstanceId));
  }

  async grantTemplateAccess(access: schema.InsertSchoolTemplateAccess): Promise<schema.SchoolTemplateAccess> {
    const result = await db.insert(schema.schoolTemplateAccess).values(access).returning();
    return result[0];
  }

  async revokeTemplateAccess(schoolInstanceId: number, templateId: number): Promise<void> {
    await db.delete(schema.schoolTemplateAccess)
      .where(and(
        eq(schema.schoolTemplateAccess.schoolInstanceId, schoolInstanceId),
        eq(schema.schoolTemplateAccess.templateId, templateId)
      ));
  }

  // API Key Methods
  async getApiKeys(schoolInstanceId: number): Promise<schema.ApiKey[]> {
    return await db.select().from(schema.apiKeys)
      .where(eq(schema.apiKeys.schoolInstanceId, schoolInstanceId))
      .orderBy(desc(schema.apiKeys.createdAt));
  }

  async createApiKey(apiKey: schema.InsertApiKey): Promise<schema.ApiKey> {
    const keyValue = `api_${nanoid(32)}`;
    const result = await db.insert(schema.apiKeys).values({
      ...apiKey,
      keyValue
    }).returning();
    return result[0];
  }

  async updateApiKey(id: number, updates: Partial<schema.InsertApiKey>): Promise<schema.ApiKey> {
    const result = await db.update(schema.apiKeys)
      .set(updates)
      .where(eq(schema.apiKeys.id, id))
      .returning();
    return result[0];
  }

  async deleteApiKey(id: number): Promise<void> {
    await db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, id));
  }

  // Analytics Methods
  async addUsageAnalytics(analytics: schema.InsertUsageAnalytics): Promise<schema.UsageAnalytics> {
    const result = await db.insert(schema.usageAnalytics).values(analytics).returning();
    return result[0];
  }

  async getUsageAnalytics(schoolInstanceId: number, startDate?: Date, endDate?: Date): Promise<schema.UsageAnalytics[]> {
    let query = db.select().from(schema.usageAnalytics)
      .where(eq(schema.usageAnalytics.schoolInstanceId, schoolInstanceId));
    
    if (startDate && endDate) {
      query = query.where(and(
        eq(schema.usageAnalytics.schoolInstanceId, schoolInstanceId),
        sql`${schema.usageAnalytics.date} BETWEEN ${startDate} AND ${endDate}`
      ));
    }
    
    return await query.orderBy(desc(schema.usageAnalytics.date));
  }

  async addAuditLog(log: schema.InsertAuditLog): Promise<schema.AuditLog> {
    const result = await db.insert(schema.auditLogs).values(log).returning();
    return result[0];
  }

  async getAuditLogs(schoolInstanceId?: number, limit: number = 100): Promise<schema.AuditLog[]> {
    let query = db.select().from(schema.auditLogs);
    
    if (schoolInstanceId) {
      query = query.where(eq(schema.auditLogs.schoolInstanceId, schoolInstanceId));
    }
    
    return await query.orderBy(desc(schema.auditLogs.createdAt)).limit(limit);
  }

  // Feature Management Methods
  async getFeatureFlags(): Promise<schema.FeatureFlag[]> {
    return await db.select().from(schema.featureFlags).orderBy(asc(schema.featureFlags.name));
  }

  async createFeatureFlag(flag: schema.InsertFeatureFlag): Promise<schema.FeatureFlag> {
    const result = await db.insert(schema.featureFlags).values(flag).returning();
    return result[0];
  }

  async getSchoolFeatureSettings(schoolInstanceId: number): Promise<schema.SchoolFeatureSetting[]> {
    return await db.select().from(schema.schoolFeatureSettings)
      .where(eq(schema.schoolFeatureSettings.schoolInstanceId, schoolInstanceId));
  }

  async updateSchoolFeatureSetting(setting: schema.InsertSchoolFeatureSetting): Promise<schema.SchoolFeatureSetting> {
    const existing = await db.select().from(schema.schoolFeatureSettings)
      .where(and(
        eq(schema.schoolFeatureSettings.schoolInstanceId, setting.schoolInstanceId),
        eq(schema.schoolFeatureSettings.featureFlagId, setting.featureFlagId)
      ));

    if (existing.length > 0) {
      const result = await db.update(schema.schoolFeatureSettings)
        .set({ ...setting, updatedAt: new Date() })
        .where(eq(schema.schoolFeatureSettings.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(schema.schoolFeatureSettings).values(setting).returning();
      return result[0];
    }
  }

  // Billing Methods
  async getBillingInfo(schoolInstanceId: number): Promise<schema.BillingInfo | undefined> {
    const result = await db.select().from(schema.billingInfo)
      .where(eq(schema.billingInfo.schoolInstanceId, schoolInstanceId));
    return result[0];
  }

  async updateBillingInfo(schoolInstanceId: number, billing: Partial<schema.InsertBillingInfo>): Promise<schema.BillingInfo> {
    const existing = await this.getBillingInfo(schoolInstanceId);
    
    if (existing) {
      const result = await db.update(schema.billingInfo)
        .set({ ...billing, updatedAt: new Date() })
        .where(eq(schema.billingInfo.schoolInstanceId, schoolInstanceId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(schema.billingInfo).values({
        schoolInstanceId,
        ...billing
      }).returning();
      return result[0];
    }
  }
}

export const developerPortalStorage = new DeveloperPortalStorage();