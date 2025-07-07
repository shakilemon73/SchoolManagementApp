import { pgTable, text, serial, integer, timestamp, decimal, boolean, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Portal Admin Users - for managing the developer portal
export const portalAdmins = pgTable("portal_admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ['super_admin', 'admin', 'support'] }).default('admin').notNull(),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const portalAdminInsertSchema = createInsertSchema(portalAdmins).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPortalAdmin = z.infer<typeof portalAdminInsertSchema>;
export type PortalAdmin = typeof portalAdmins.$inferSelect;

// School Instances - Each registered school
export const schoolInstances = pgTable("school_instances", {
  id: serial("id").primaryKey(),
  schoolId: text("school_id").notNull().unique(), // Unique identifier like "school123"
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(), // e.g., "school123"
  customDomain: text("custom_domain"), // Optional custom domain
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  address: text("address"),
  planType: text("plan_type", { enum: ['basic', 'pro', 'enterprise'] }).default('basic').notNull(),
  status: text("status", { enum: ['active', 'suspended', 'trial', 'expired'] }).default('trial').notNull(),
  supabaseProjectId: text("supabase_project_id"), // Their dedicated Supabase project
  supabaseUrl: text("supabase_url"),
  databaseUrl: text("database_url"),
  apiKey: text("api_key").notNull().unique(), // For API access
  secretKey: text("secret_key").notNull(), // For secure operations
  maxStudents: integer("max_students").default(100),
  maxTeachers: integer("max_teachers").default(10),
  maxDocuments: integer("max_documents").default(1000),
  usedDocuments: integer("used_documents").default(0),
  features: json("features").default({}), // Feature toggles
  metadata: json("metadata").default({}),
  trialExpiresAt: timestamp("trial_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schoolInstanceInsertSchema = createInsertSchema(schoolInstances).omit({ 
  id: true, 
  schoolId: true, 
  subdomain: true, 
  apiKey: true, 
  secretKey: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertSchoolInstance = z.infer<typeof schoolInstanceInsertSchema>;
export type SchoolInstance = typeof schoolInstances.$inferSelect;

// Credit System for Schools
export const schoolCredits = pgTable("school_credits", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").references(() => schoolInstances.id).notNull(),
  totalCredits: integer("total_credits").default(0),
  usedCredits: integer("used_credits").default(0),
  availableCredits: integer("available_credits").default(0),
  lastResetDate: timestamp("last_reset_date"),
  resetInterval: text("reset_interval", { enum: ['monthly', 'yearly', 'never'] }).default('monthly'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schoolCreditInsertSchema = createInsertSchema(schoolCredits).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSchoolCredit = z.infer<typeof schoolCreditInsertSchema>;
export type SchoolCredit = typeof schoolCredits.$inferSelect;

// Credit Transactions for billing
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").references(() => schoolInstances.id).notNull(),
  type: text("type", { enum: ['purchase', 'usage', 'refund', 'bonus'] }).notNull(),
  amount: integer("amount").notNull(), // Credits amount
  description: text("description").notNull(),
  reference: text("reference"), // Invoice ID, usage reference, etc.
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditTransactionInsertSchema = createInsertSchema(creditTransactions).omit({ id: true, createdAt: true });
export type InsertCreditTransaction = z.infer<typeof creditTransactionInsertSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

// Document Templates for schools
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // admit-card, fee-receipt, id-card, certificate, etc.
  category: text("category").notNull(), // academic, administrative, financial
  description: text("description"),
  template: json("template").notNull(), // Template structure/config
  preview: text("preview"), // Preview image URL
  isGlobal: boolean("is_global").default(false), // Available to all schools
  requiredCredits: integer("required_credits").default(1),
  isActive: boolean("is_active").default(true),
  version: text("version").default("1.0"),
  createdBy: integer("created_by").references(() => portalAdmins.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentTemplateInsertSchema = createInsertSchema(documentTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDocumentTemplate = z.infer<typeof documentTemplateInsertSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;

// School Template Access - Which templates each school can use
export const schoolTemplateAccess = pgTable("school_template_access", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").references(() => schoolInstances.id).notNull(),
  templateId: integer("template_id").references(() => documentTemplates.id).notNull(),
  isEnabled: boolean("is_enabled").default(true),
  customConfig: json("custom_config").default({}), // School-specific template customizations
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  grantedBy: integer("granted_by").references(() => portalAdmins.id),
});

export const schoolTemplateAccessInsertSchema = createInsertSchema(schoolTemplateAccess).omit({ id: true, grantedAt: true });
export type InsertSchoolTemplateAccess = z.infer<typeof schoolTemplateAccessInsertSchema>;
export type SchoolTemplateAccess = typeof schoolTemplateAccess.$inferSelect;

// API Keys for external integrations
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").references(() => schoolInstances.id).notNull(),
  keyName: text("key_name").notNull(),
  keyValue: text("key_value").notNull().unique(),
  permissions: json("permissions").default([]), // Array of allowed endpoints/actions
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0),
  rateLimit: integer("rate_limit").default(1000), // Requests per hour
  createdBy: integer("created_by").references(() => portalAdmins.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeyInsertSchema = createInsertSchema(apiKeys).omit({ id: true, keyValue: true, createdAt: true });
export type InsertApiKey = z.infer<typeof apiKeyInsertSchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// Usage Analytics
export const usageAnalytics = pgTable("usage_analytics", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").references(() => schoolInstances.id).notNull(),
  date: timestamp("date").notNull(),
  metric: text("metric").notNull(), // documents_generated, students_added, api_calls, etc.
  value: integer("value").notNull(),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usageAnalyticsInsertSchema = createInsertSchema(usageAnalytics).omit({ id: true, createdAt: true });
export type InsertUsageAnalytics = z.infer<typeof usageAnalyticsInsertSchema>;
export type UsageAnalytics = typeof usageAnalytics.$inferSelect;

// Audit Logs for security and compliance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").references(() => schoolInstances.id),
  adminId: integer("admin_id").references(() => portalAdmins.id),
  action: text("action").notNull(), // create_school, delete_template, etc.
  resource: text("resource").notNull(), // schools, templates, users, etc.
  resourceId: text("resource_id"),
  details: json("details").default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogInsertSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof auditLogInsertSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Billing Information
export const billingInfo = pgTable("billing_info", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").references(() => schoolInstances.id).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planId: text("plan_id"),
  status: text("status", { enum: ['active', 'past_due', 'canceled', 'unpaid'] }).default('active'),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  billingEmail: text("billing_email"),
  billingAddress: json("billing_address").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const billingInfoInsertSchema = createInsertSchema(billingInfo).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBillingInfo = z.infer<typeof billingInfoInsertSchema>;
export type BillingInfo = typeof billingInfo.$inferSelect;

// Feature Flags for toggling features per school
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isGlobal: boolean("is_global").default(false), // If true, applies to all schools
  defaultValue: boolean("default_value").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const featureFlagInsertSchema = createInsertSchema(featureFlags).omit({ id: true, createdAt: true });
export type InsertFeatureFlag = z.infer<typeof featureFlagInsertSchema>;
export type FeatureFlag = typeof featureFlags.$inferSelect;

// School Feature Settings
export const schoolFeatureSettings = pgTable("school_feature_settings", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").references(() => schoolInstances.id).notNull(),
  featureFlagId: integer("feature_flag_id").references(() => featureFlags.id).notNull(),
  isEnabled: boolean("is_enabled").notNull(),
  config: json("config").default({}), // Feature-specific configuration
  updatedBy: integer("updated_by").references(() => portalAdmins.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schoolFeatureSettingInsertSchema = createInsertSchema(schoolFeatureSettings).omit({ id: true, updatedAt: true });
export type InsertSchoolFeatureSetting = z.infer<typeof schoolFeatureSettingInsertSchema>;
export type SchoolFeatureSetting = typeof schoolFeatureSettings.$inferSelect;

// Relations
export const schoolInstancesRelations = relations(schoolInstances, ({ one, many }) => ({
  credits: one(schoolCredits),
  creditTransactions: many(creditTransactions),
  templateAccess: many(schoolTemplateAccess),
  apiKeys: many(apiKeys),
  usageAnalytics: many(usageAnalytics),
  auditLogs: many(auditLogs),
  billingInfo: one(billingInfo),
  featureSettings: many(schoolFeatureSettings),
}));

export const schoolCreditsRelations = relations(schoolCredits, ({ one }) => ({
  school: one(schoolInstances, {
    fields: [schoolCredits.schoolInstanceId],
    references: [schoolInstances.id]
  })
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  school: one(schoolInstances, {
    fields: [creditTransactions.schoolInstanceId],
    references: [schoolInstances.id]
  })
}));

export const documentTemplatesRelations = relations(documentTemplates, ({ one, many }) => ({
  createdBy: one(portalAdmins, {
    fields: [documentTemplates.createdBy],
    references: [portalAdmins.id]
  }),
  schoolAccess: many(schoolTemplateAccess)
}));

export const schoolTemplateAccessRelations = relations(schoolTemplateAccess, ({ one }) => ({
  school: one(schoolInstances, {
    fields: [schoolTemplateAccess.schoolInstanceId],
    references: [schoolInstances.id]
  }),
  template: one(documentTemplates, {
    fields: [schoolTemplateAccess.templateId],
    references: [documentTemplates.id]
  }),
  grantedBy: one(portalAdmins, {
    fields: [schoolTemplateAccess.grantedBy],
    references: [portalAdmins.id]
  })
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  school: one(schoolInstances, {
    fields: [apiKeys.schoolInstanceId],
    references: [schoolInstances.id]
  }),
  createdBy: one(portalAdmins, {
    fields: [apiKeys.createdBy],
    references: [portalAdmins.id]
  })
}));

export const usageAnalyticsRelations = relations(usageAnalytics, ({ one }) => ({
  school: one(schoolInstances, {
    fields: [usageAnalytics.schoolInstanceId],
    references: [schoolInstances.id]
  })
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  school: one(schoolInstances, {
    fields: [auditLogs.schoolInstanceId],
    references: [schoolInstances.id]
  }),
  admin: one(portalAdmins, {
    fields: [auditLogs.adminId],
    references: [portalAdmins.id]
  })
}));

export const billingInfoRelations = relations(billingInfo, ({ one }) => ({
  school: one(schoolInstances, {
    fields: [billingInfo.schoolInstanceId],
    references: [schoolInstances.id]
  })
}));

export const featureFlagsRelations = relations(featureFlags, ({ many }) => ({
  schoolSettings: many(schoolFeatureSettings)
}));

export const schoolFeatureSettingsRelations = relations(schoolFeatureSettings, ({ one }) => ({
  school: one(schoolInstances, {
    fields: [schoolFeatureSettings.schoolInstanceId],
    references: [schoolInstances.id]
  }),
  featureFlag: one(featureFlags, {
    fields: [schoolFeatureSettings.featureFlagId],
    references: [featureFlags.id]
  }),
  updatedBy: one(portalAdmins, {
    fields: [schoolFeatureSettings.updatedBy],
    references: [portalAdmins.id]
  })
}));

export const portalAdminsRelations = relations(portalAdmins, ({ many }) => ({
  createdTemplates: many(documentTemplates),
  grantedAccess: many(schoolTemplateAccess),
  createdApiKeys: many(apiKeys),
  auditLogs: many(auditLogs),
  featureUpdates: many(schoolFeatureSettings)
}));