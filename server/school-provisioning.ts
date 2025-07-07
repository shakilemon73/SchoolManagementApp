import { Express, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { db } from './db';
import { schoolInstances } from '../shared/developer-portal-schema';
import { SubscriptionManager } from './subscription-manager';
import { multiSupabaseManager } from './multi-supabase-manager';
import { SupabaseSchemaManager } from './supabase-schema-manager';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

interface SchoolOnboardingData {
  schoolName: string;
  schoolNameBn: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  planId: string;
  customDomain?: string;
  supabaseUrl?: string;
  supabaseProjectId?: string;
}

export class SchoolProvisioningService {
  
  // Complete automated onboarding process
  static async onboardNewSchool(data: SchoolOnboardingData) {
    try {
      console.log(`Starting onboarding process for ${data.schoolName}...`);
      
      // Step 1: Generate unique identifiers
      const schoolId = `school_${nanoid(10)}`;
      const subdomain = data.schoolName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 20) + `-${nanoid(6)}`;
      
      const apiKey = `sk_${nanoid(32)}`;
      const secretKey = `sk_secret_${nanoid(48)}`;

      // Step 2: Create school instance record
      const schoolInstance = await db.insert(schoolInstances).values({
        schoolId,
        name: data.schoolName,
        subdomain,
        customDomain: data.customDomain,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        planType: data.planId as 'basic' | 'pro' | 'enterprise',
        status: 'trial',
        supabaseProjectId: data.supabaseProjectId,
        supabaseUrl: data.supabaseUrl,
        apiKey,
        secretKey,
        trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
      }).returning();

      const school = schoolInstance[0];
      console.log(`✓ School instance created with ID: ${schoolId}`);

      // Step 3: Setup Supabase instance if provided
      let supabaseSetup = null;
      if (data.supabaseUrl && data.supabaseProjectId) {
        try {
          supabaseSetup = await this.setupSchoolSupabase(school.id, {
            supabaseUrl: data.supabaseUrl,
            supabaseProjectId: data.supabaseProjectId
          });
          console.log(`✓ Supabase instance configured for ${schoolId}`);
        } catch (error) {
          console.warn(`⚠ Supabase setup failed for ${schoolId}:`, error);
        }
      }

      // Step 4: Create subscription
      const subscription = await SubscriptionManager.createSubscription(
        school.id, 
        data.planId, 
        14 // 14 days trial
      );
      console.log(`✓ Subscription created for plan: ${data.planId}`);

      // Step 5: Create admin user account in school's system
      let adminUser = null;
      if (supabaseSetup?.success) {
        try {
          adminUser = await this.createSchoolAdminUser(schoolId, {
            email: data.principalEmail,
            name: data.principalName,
            phone: data.principalPhone
          });
          console.log(`✓ Admin user created for ${data.principalEmail}`);
        } catch (error) {
          console.warn(`⚠ Admin user creation failed:`, error);
        }
      }

      // Step 6: Send welcome email (placeholder for now)
      await this.sendWelcomeEmail(data.contactEmail, {
        schoolName: data.schoolName,
        schoolId,
        subdomain,
        apiKey,
        loginUrl: supabaseSetup?.success ? `https://${subdomain}.yourdomain.com` : null,
        adminEmail: data.principalEmail,
        trialDays: 14
      });

      console.log(`✓ Onboarding completed for ${data.schoolName}`);

      return {
        success: true,
        schoolId,
        subdomain,
        apiKey,
        secretKey,
        subscription,
        supabaseSetup,
        adminUser,
        accessUrl: `https://${subdomain}.yourdomain.com`,
        trialExpiresAt: school.trialExpiresAt
      };

    } catch (error) {
      console.error('School onboarding failed:', error);
      throw error;
    }
  }

  // Setup Supabase instance for school
  static async setupSchoolSupabase(schoolInstanceId: number, config: {
    supabaseUrl: string;
    supabaseProjectId: string;
  }) {
    try {
      // Update school instance with Supabase config
      await db.update(schoolInstances)
        .set({
          supabaseUrl: config.supabaseUrl,
          supabaseProjectId: config.supabaseProjectId,
          databaseUrl: `postgresql://postgres:[password]@db.${config.supabaseProjectId}.supabase.co:5432/postgres`
        })
        .where({ id: schoolInstanceId });

      // Get updated school instance
      const school = await db.select().from(schoolInstances)
        .where({ id: schoolInstanceId })
        .limit(1);

      if (school.length === 0) {
        throw new Error('School not found');
      }

      // Register with multi-Supabase manager
      const managerConfig = await multiSupabaseManager.registerSchoolSupabase(school[0]);
      
      if (!managerConfig) {
        throw new Error('Failed to register with Supabase manager');
      }

      // Setup complete schema
      const adminClient = await multiSupabaseManager.getSchoolAdminClient(school[0].schoolId);
      let schemaDetails = null;

      if (adminClient) {
        schemaDetails = await SupabaseSchemaManager.setupCompleteSchema(adminClient);
      }

      return {
        success: true,
        config: managerConfig,
        schema: schemaDetails
      };

    } catch (error) {
      console.error('Supabase setup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create admin user in school's Supabase
  static async createSchoolAdminUser(schoolId: string, userData: {
    email: string;
    name: string;
    phone: string;
  }) {
    try {
      const client = await multiSupabaseManager.getSchoolClient(schoolId);
      
      if (!client) {
        throw new Error('School Supabase client not available');
      }

      // Generate temporary password
      const tempPassword = nanoid(12);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create user in school's database
      const { data, error } = await client
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name,
          phone_number: userData.phone,
          role: 'admin',
          password: hashedPassword,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }

      return {
        userId: data.id,
        email: userData.email,
        tempPassword,
        message: 'Admin user created successfully'
      };

    } catch (error) {
      console.error('Admin user creation failed:', error);
      throw error;
    }
  }

  // Send welcome email to new school
  static async sendWelcomeEmail(email: string, data: {
    schoolName: string;
    schoolId: string;
    subdomain: string;
    apiKey: string;
    loginUrl: string | null;
    adminEmail: string;
    trialDays: number;
  }) {
    // Placeholder for email service integration
    console.log(`Sending welcome email to ${email}:`, {
      subject: `Welcome to School Management System - ${data.schoolName}`,
      content: {
        schoolName: data.schoolName,
        schoolId: data.schoolId,
        subdomain: data.subdomain,
        trialDays: data.trialDays,
        loginUrl: data.loginUrl,
        apiKey: data.apiKey.substring(0, 10) + '...' // Masked for security
      }
    });

    // TODO: Integrate with SendGrid or similar email service
    return true;
  }

  // Suspend school access
  static async suspendSchool(schoolId: string, reason: string) {
    try {
      await db.update(schoolInstances)
        .set({ 
          status: 'suspended',
          updatedAt: new Date()
        })
        .where({ schoolId });

      console.log(`School ${schoolId} suspended. Reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('Failed to suspend school:', error);
      throw error;
    }
  }

  // Reactivate school
  static async reactivateSchool(schoolId: string) {
    try {
      await db.update(schoolInstances)
        .set({ 
          status: 'active',
          updatedAt: new Date()
        })
        .where({ schoolId });

      console.log(`School ${schoolId} reactivated`);
      return true;
    } catch (error) {
      console.error('Failed to reactivate school:', error);
      throw error;
    }
  }

  // Delete school and all data
  static async deleteSchool(schoolId: string) {
    try {
      // This is a destructive operation - implement with extreme caution
      console.warn(`Attempting to delete school: ${schoolId}`);
      
      // TODO: Implement data deletion from Supabase
      // TODO: Cancel subscriptions
      // TODO: Remove from multi-Supabase manager
      
      await db.delete(schoolInstances)
        .where({ schoolId });

      console.log(`School ${schoolId} deleted`);
      return true;
    } catch (error) {
      console.error('Failed to delete school:', error);
      throw error;
    }
  }
}

// API Routes for school provisioning
export function registerProvisioningRoutes(app: Express) {
  
  // Onboard new school
  app.post('/api/provisioning/onboard', async (req: Request, res: Response) => {
    try {
      const onboardingData: SchoolOnboardingData = req.body;
      
      // Validate required fields
      const required = ['schoolName', 'contactEmail', 'principalName', 'principalEmail', 'planId'];
      for (const field of required) {
        if (!onboardingData[field]) {
          return res.status(400).json({ 
            error: `Missing required field: ${field}` 
          });
        }
      }

      const result = await SchoolProvisioningService.onboardNewSchool(onboardingData);
      
      res.json(result);
    } catch (error) {
      console.error('Onboarding error:', error);
      res.status(500).json({ 
        error: 'Failed to onboard school',
        details: error.message
      });
    }
  });

  // Setup Supabase for existing school
  app.post('/api/provisioning/setup-supabase/:schoolId', async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { supabaseUrl, supabaseProjectId } = req.body;

      if (!supabaseUrl || !supabaseProjectId) {
        return res.status(400).json({ 
          error: 'Supabase URL and Project ID are required' 
        });
      }

      const school = await db.select().from(schoolInstances)
        .where({ schoolId })
        .limit(1);

      if (school.length === 0) {
        return res.status(404).json({ error: 'School not found' });
      }

      const result = await SchoolProvisioningService.setupSchoolSupabase(
        school[0].id, 
        { supabaseUrl, supabaseProjectId }
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to setup Supabase',
        details: error.message
      });
    }
  });

  // Suspend school
  app.post('/api/provisioning/suspend/:schoolId', async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { reason } = req.body;

      await SchoolProvisioningService.suspendSchool(schoolId, reason || 'Administrative action');
      
      res.json({ success: true, message: 'School suspended successfully' });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to suspend school',
        details: error.message
      });
    }
  });

  // Reactivate school
  app.post('/api/provisioning/reactivate/:schoolId', async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;

      await SchoolProvisioningService.reactivateSchool(schoolId);
      
      res.json({ success: true, message: 'School reactivated successfully' });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to reactivate school',
        details: error.message
      });
    }
  });

  // Get onboarding status
  app.get('/api/provisioning/status/:schoolId', async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;

      const school = await db.select().from(schoolInstances)
        .where({ schoolId })
        .limit(1);

      if (school.length === 0) {
        return res.status(404).json({ error: 'School not found' });
      }

      const schoolData = school[0];
      const hasSupabase = !!(schoolData.supabaseUrl && schoolData.supabaseProjectId);
      
      let supabaseStatus = 'not_configured';
      if (hasSupabase) {
        try {
          const client = await multiSupabaseManager.getSchoolClient(schoolId);
          supabaseStatus = client ? 'connected' : 'connection_failed';
        } catch {
          supabaseStatus = 'connection_failed';
        }
      }

      res.json({
        schoolId,
        name: schoolData.name,
        status: schoolData.status,
        hasSupabase,
        supabaseStatus,
        trialExpiresAt: schoolData.trialExpiresAt,
        createdAt: schoolData.createdAt
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get status',
        details: error.message
      });
    }
  });
}