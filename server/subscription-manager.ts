import { Express, Request, Response } from 'express';
import { db } from './db';
import { 
  subscriptionPlans, 
  schoolSubscriptions, 
  billingInvoices, 
  usageTracking,
  featurePermissions 
} from '../shared/business-schema';
import { schoolInstances } from '../shared/developer-portal-schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Default subscription plans
const defaultPlans = [
  {
    planId: 'basic',
    name: 'Basic Plan',
    nameBn: 'বেসিক প্ল্যান',
    description: 'Perfect for small schools starting their digital journey',
    descriptionBn: 'ছোট স্কুলের ডিজিটাল যাত্রা শুরুর জন্য আদর্শ',
    price: '2500.00',
    currency: 'BDT',
    billingCycle: 'monthly' as const,
    maxStudents: 200,
    maxTeachers: 15,
    maxStorage: 10,
    features: {
      studentManagement: true,
      teacherManagement: true,
      documentGeneration: true,
      basicReports: true,
      smsNotifications: false,
      customBranding: false,
      apiAccess: false,
      advancedAnalytics: false,
      whiteLabel: false
    },
    supportLevel: 'basic' as const,
    isActive: true,
    trialDays: 14
  },
  {
    planId: 'premium',
    name: 'Premium Plan',
    nameBn: 'প্রিমিয়াম প্ল্যান',
    description: 'Advanced features for growing educational institutions',
    descriptionBn: 'বর্ধনশীল শিক্ষা প্রতিষ্ঠানের জন্য উন্নত বৈশিষ্ট্য',
    price: '5500.00',
    currency: 'BDT',
    billingCycle: 'monthly' as const,
    maxStudents: 1000,
    maxTeachers: 50,
    maxStorage: 50,
    features: {
      studentManagement: true,
      teacherManagement: true,
      documentGeneration: true,
      basicReports: true,
      smsNotifications: true,
      customBranding: true,
      apiAccess: true,
      advancedAnalytics: true,
      whiteLabel: false,
      parentPortal: true,
      libraryManagement: true,
      transportManagement: true
    },
    supportLevel: 'premium' as const,
    isActive: true,
    trialDays: 14
  },
  {
    planId: 'enterprise',
    name: 'Enterprise Plan',
    nameBn: 'এন্টারপ্রাইজ প্ল্যান',
    description: 'Complete solution with unlimited features and dedicated support',
    descriptionBn: 'সীমাহীন বৈশিষ্ট্য এবং ডেডিকেটেড সাপোর্ট সহ সম্পূর্ণ সমাধান',
    price: '12000.00',
    currency: 'BDT',
    billingCycle: 'monthly' as const,
    maxStudents: 5000,
    maxTeachers: 200,
    maxStorage: 200,
    features: {
      studentManagement: true,
      teacherManagement: true,
      documentGeneration: true,
      basicReports: true,
      smsNotifications: true,
      customBranding: true,
      apiAccess: true,
      advancedAnalytics: true,
      whiteLabel: true,
      parentPortal: true,
      libraryManagement: true,
      transportManagement: true,
      inventoryManagement: true,
      financialManagement: true,
      dedicatedSupport: true,
      customIntegrations: true
    },
    supportLevel: 'enterprise' as const,
    isActive: true,
    trialDays: 30
  }
];

export class SubscriptionManager {
  
  // Initialize default plans if they don't exist
  static async initializeDefaultPlans() {
    try {
      const { supabaseDb } = await import('./supabase-direct-db');
      await supabaseDb.initializeDefaultPlans();
      console.log('✓ Default subscription plans initialized');
    } catch (error) {
      console.log('⚠ Skipping subscription plans initialization due to database connection issue');
    }
  }

  // Create subscription for a school
  static async createSubscription(schoolInstanceId: number, planId: string, trialDays?: number) {
    try {
      const plan = await db.select().from(subscriptionPlans)
        .where(eq(subscriptionPlans.planId, planId))
        .limit(1);

      if (plan.length === 0) {
        throw new Error(`Plan ${planId} not found`);
      }

      const planData = plan[0];
      const now = new Date();
      const trialEnd = new Date(now.getTime() + (trialDays || planData.trialDays) * 24 * 60 * 60 * 1000);
      const currentPeriodEnd = new Date(trialEnd.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after trial

      const subscription = await db.insert(schoolSubscriptions).values({
        schoolInstanceId,
        planId,
        status: 'trial',
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEnd,
        cancelAtPeriodEnd: false
      }).returning();

      return subscription[0];
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  // Check if school has access to a feature
  static async hasFeatureAccess(schoolId: string, featureKey: string): Promise<boolean> {
    try {
      // Get school's current subscription
      const schoolInstance = await db.select().from(schoolInstances)
        .where(eq(schoolInstances.schoolId, schoolId))
        .limit(1);

      if (schoolInstance.length === 0) return false;

      const subscription = await db.select({
        planId: schoolSubscriptions.planId,
        status: schoolSubscriptions.status,
        currentPeriodEnd: schoolSubscriptions.currentPeriodEnd
      })
      .from(schoolSubscriptions)
      .where(eq(schoolSubscriptions.schoolInstanceId, schoolInstance[0].id))
      .limit(1);

      if (subscription.length === 0) return false;

      // Check if subscription is active
      const sub = subscription[0];
      if (sub.status !== 'active' && sub.status !== 'trial') return false;
      if (new Date() > sub.currentPeriodEnd) return false;

      // Get plan features
      const plan = await db.select().from(subscriptionPlans)
        .where(eq(subscriptionPlans.planId, sub.planId))
        .limit(1);

      if (plan.length === 0) return false;

      const features = plan[0].features as Record<string, boolean>;
      return features[featureKey] === true;
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false;
    }
  }

  // Track usage for a school
  static async trackUsage(schoolInstanceId: number, metric: string, value: number, metadata?: any) {
    try {
      await db.insert(usageTracking).values({
        schoolInstanceId,
        metric,
        value,
        metadata: metadata || {}
      });
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }

  // Check usage limits
  static async checkUsageLimits(schoolId: string): Promise<{
    students: { current: number; limit: number; exceeded: boolean };
    teachers: { current: number; limit: number; exceeded: boolean };
    storage: { current: number; limit: number; exceeded: boolean };
  }> {
    try {
      const schoolInstance = await db.select().from(schoolInstances)
        .where(eq(schoolInstances.schoolId, schoolId))
        .limit(1);

      if (schoolInstance.length === 0) {
        throw new Error('School not found');
      }

      const subscription = await db.select({
        planId: schoolSubscriptions.planId
      })
      .from(schoolSubscriptions)
      .where(eq(schoolSubscriptions.schoolInstanceId, schoolInstance[0].id))
      .limit(1);

      if (subscription.length === 0) {
        throw new Error('No subscription found');
      }

      const plan = await db.select().from(subscriptionPlans)
        .where(eq(subscriptionPlans.planId, subscription[0].planId))
        .limit(1);

      if (plan.length === 0) {
        throw new Error('Plan not found');
      }

      const planData = plan[0];
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get current usage
      const usage = await db.select().from(usageTracking)
        .where(and(
          eq(usageTracking.schoolInstanceId, schoolInstance[0].id),
          gte(usageTracking.date, startOfMonth)
        ));

      const studentsUsage = usage.filter(u => u.metric === 'students').reduce((sum, u) => Math.max(sum, u.value), 0);
      const teachersUsage = usage.filter(u => u.metric === 'teachers').reduce((sum, u) => Math.max(sum, u.value), 0);
      const storageUsage = usage.filter(u => u.metric === 'storage').reduce((sum, u) => Math.max(sum, u.value), 0);

      return {
        students: {
          current: studentsUsage,
          limit: planData.maxStudents,
          exceeded: studentsUsage > planData.maxStudents
        },
        teachers: {
          current: teachersUsage,
          limit: planData.maxTeachers,
          exceeded: teachersUsage > planData.maxTeachers
        },
        storage: {
          current: storageUsage,
          limit: planData.maxStorage,
          exceeded: storageUsage > planData.maxStorage
        }
      };
    } catch (error) {
      console.error('Failed to check usage limits:', error);
      throw error;
    }
  }

  // Generate invoice for subscription
  static async generateInvoice(subscriptionId: number) {
    try {
      const subscription = await db.select().from(schoolSubscriptions)
        .where(eq(schoolSubscriptions.id, subscriptionId))
        .limit(1);

      if (subscription.length === 0) {
        throw new Error('Subscription not found');
      }

      const sub = subscription[0];
      const plan = await db.select().from(subscriptionPlans)
        .where(eq(subscriptionPlans.planId, sub.planId))
        .limit(1);

      if (plan.length === 0) {
        throw new Error('Plan not found');
      }

      const planData = plan[0];
      const invoiceNumber = `INV-${Date.now()}-${nanoid(6)}`;
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const invoice = await db.insert(billingInvoices).values({
        schoolInstanceId: sub.schoolInstanceId,
        subscriptionId: sub.id,
        invoiceNumber,
        amount: planData.price,
        currency: planData.currency,
        status: 'pending',
        dueDate
      }).returning();

      return invoice[0];
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  }

  // Process automatic billing for all active subscriptions
  static async processAutomaticBilling() {
    try {
      const now = new Date();
      const upcomingRenewals = await db.select()
        .from(schoolSubscriptions)
        .where(and(
          eq(schoolSubscriptions.status, 'active'),
          lte(schoolSubscriptions.currentPeriodEnd, new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)) // 3 days before
        ));

      console.log(`Processing ${upcomingRenewals.length} upcoming renewals...`);

      for (const subscription of upcomingRenewals) {
        try {
          await this.generateInvoice(subscription.id);
          console.log(`Generated invoice for subscription ${subscription.id}`);
        } catch (error) {
          console.error(`Failed to generate invoice for subscription ${subscription.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to process automatic billing:', error);
    }
  }
}

// API Routes for subscription management
export function registerSubscriptionRoutes(app: Express) {
  
  // Get all plans
  app.get('/api/subscription/plans', async (req: Request, res: Response) => {
    try {
      const plans = await db.select().from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, true));
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  });

  // Get school's current subscription
  app.get('/api/subscription/current/:schoolId', async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      const schoolInstance = await db.select().from(schoolInstances)
        .where(eq(schoolInstances.schoolId, schoolId))
        .limit(1);

      if (schoolInstance.length === 0) {
        return res.status(404).json({ error: 'School not found' });
      }

      const subscription = await db.select()
        .from(schoolSubscriptions)
        .where(eq(schoolSubscriptions.schoolInstanceId, schoolInstance[0].id))
        .limit(1);

      if (subscription.length === 0) {
        return res.status(404).json({ error: 'No subscription found' });
      }

      res.json(subscription[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Create new subscription
  app.post('/api/subscription/create', async (req: Request, res: Response) => {
    try {
      const { schoolInstanceId, planId, trialDays } = req.body;
      
      const subscription = await SubscriptionManager.createSubscription(
        schoolInstanceId, 
        planId, 
        trialDays
      );
      
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Check feature access
  app.get('/api/subscription/feature-access/:schoolId/:feature', async (req: Request, res: Response) => {
    try {
      const { schoolId, feature } = req.params;
      
      const hasAccess = await SubscriptionManager.hasFeatureAccess(schoolId, feature);
      
      res.json({ hasAccess });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check feature access' });
    }
  });

  // Get usage limits
  app.get('/api/subscription/usage/:schoolId', async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      const usage = await SubscriptionManager.checkUsageLimits(schoolId);
      
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get usage limits' });
    }
  });

  // Track usage
  app.post('/api/subscription/track-usage', async (req: Request, res: Response) => {
    try {
      const { schoolInstanceId, metric, value, metadata } = req.body;
      
      await SubscriptionManager.trackUsage(schoolInstanceId, metric, value, metadata);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to track usage' });
    }
  });

  // Get billing history
  app.get('/api/subscription/billing/:schoolId', async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      const schoolInstance = await db.select().from(schoolInstances)
        .where(eq(schoolInstances.schoolId, schoolId))
        .limit(1);

      if (schoolInstance.length === 0) {
        return res.status(404).json({ error: 'School not found' });
      }

      const invoices = await db.select().from(billingInvoices)
        .where(eq(billingInvoices.schoolInstanceId, schoolInstance[0].id));

      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch billing history' });
    }
  });
}