import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/developer-portal-schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const db = drizzle(pool, { schema });

async function migrateDeveloperPortal() {
  try {
    console.log('🔄 Creating Developer Portal database tables...');

    // Create tables using SQL to avoid Drizzle migration complexity
    await pool.query(`
      -- Portal Admins
      CREATE TABLE IF NOT EXISTS portal_admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'support')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- School Instances
      CREATE TABLE IF NOT EXISTS school_instances (
        id SERIAL PRIMARY KEY,
        school_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        subdomain TEXT NOT NULL UNIQUE,
        custom_domain TEXT,
        contact_email TEXT NOT NULL,
        contact_phone TEXT,
        address TEXT,
        plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
        status TEXT DEFAULT 'trial' CHECK (status IN ('active', 'suspended', 'trial', 'expired')),
        supabase_project_id TEXT,
        supabase_url TEXT,
        database_url TEXT,
        api_key TEXT NOT NULL UNIQUE,
        secret_key TEXT NOT NULL,
        max_students INTEGER DEFAULT 100,
        max_teachers INTEGER DEFAULT 10,
        max_documents INTEGER DEFAULT 1000,
        used_documents INTEGER DEFAULT 0,
        features JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        trial_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- School Credits
      CREATE TABLE IF NOT EXISTS school_credits (
        id SERIAL PRIMARY KEY,
        school_instance_id INTEGER REFERENCES school_instances(id) NOT NULL,
        total_credits INTEGER DEFAULT 0,
        used_credits INTEGER DEFAULT 0,
        available_credits INTEGER DEFAULT 0,
        last_reset_date TIMESTAMP,
        reset_interval TEXT DEFAULT 'monthly' CHECK (reset_interval IN ('monthly', 'yearly', 'never')),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Credit Transactions
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id SERIAL PRIMARY KEY,
        school_instance_id INTEGER REFERENCES school_instances(id) NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
        amount INTEGER NOT NULL,
        description TEXT NOT NULL,
        reference TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Document Templates
      CREATE TABLE IF NOT EXISTS document_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        template JSONB NOT NULL,
        preview TEXT,
        is_global BOOLEAN DEFAULT false,
        required_credits INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        version TEXT DEFAULT '1.0',
        created_by INTEGER REFERENCES portal_admins(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- School Template Access
      CREATE TABLE IF NOT EXISTS school_template_access (
        id SERIAL PRIMARY KEY,
        school_instance_id INTEGER REFERENCES school_instances(id) NOT NULL,
        template_id INTEGER REFERENCES document_templates(id) NOT NULL,
        is_enabled BOOLEAN DEFAULT true,
        custom_config JSONB DEFAULT '{}',
        granted_at TIMESTAMP DEFAULT NOW() NOT NULL,
        granted_by INTEGER REFERENCES portal_admins(id)
      );

      -- API Keys
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        school_instance_id INTEGER REFERENCES school_instances(id) NOT NULL,
        key_name TEXT NOT NULL,
        key_value TEXT NOT NULL UNIQUE,
        permissions JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        last_used TIMESTAMP,
        usage_count INTEGER DEFAULT 0,
        rate_limit INTEGER DEFAULT 1000,
        created_by INTEGER REFERENCES portal_admins(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Usage Analytics
      CREATE TABLE IF NOT EXISTS usage_analytics (
        id SERIAL PRIMARY KEY,
        school_instance_id INTEGER REFERENCES school_instances(id) NOT NULL,
        date TIMESTAMP NOT NULL,
        metric TEXT NOT NULL,
        value INTEGER NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Audit Logs
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        school_instance_id INTEGER REFERENCES school_instances(id),
        admin_id INTEGER REFERENCES portal_admins(id),
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        resource_id TEXT,
        details JSONB DEFAULT '{}',
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Billing Info
      CREATE TABLE IF NOT EXISTS billing_info (
        id SERIAL PRIMARY KEY,
        school_instance_id INTEGER REFERENCES school_instances(id) NOT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        plan_id TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        billing_email TEXT,
        billing_address JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Feature Flags
      CREATE TABLE IF NOT EXISTS feature_flags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        is_global BOOLEAN DEFAULT false,
        default_value BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- School Feature Settings
      CREATE TABLE IF NOT EXISTS school_feature_settings (
        id SERIAL PRIMARY KEY,
        school_instance_id INTEGER REFERENCES school_instances(id) NOT NULL,
        feature_flag_id INTEGER REFERENCES feature_flags(id) NOT NULL,
        is_enabled BOOLEAN NOT NULL,
        config JSONB DEFAULT '{}',
        updated_by INTEGER REFERENCES portal_admins(id),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_school_instances_school_id ON school_instances(school_id);
      CREATE INDEX IF NOT EXISTS idx_school_instances_subdomain ON school_instances(subdomain);
      CREATE INDEX IF NOT EXISTS idx_school_instances_api_key ON school_instances(api_key);
      CREATE INDEX IF NOT EXISTS idx_school_instances_status ON school_instances(status);
      CREATE INDEX IF NOT EXISTS idx_credit_transactions_school_id ON credit_transactions(school_instance_id);
      CREATE INDEX IF NOT EXISTS idx_usage_analytics_school_id ON usage_analytics(school_instance_id);
      CREATE INDEX IF NOT EXISTS idx_usage_analytics_date ON usage_analytics(date);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_school_id ON audit_logs(school_instance_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    `);

    // Create default feature flags
    await pool.query(`
      INSERT INTO feature_flags (name, description, is_global, default_value) 
      VALUES 
        ('video_portal', 'Enable video conferencing portal', false, false),
        ('parent_portal', 'Enable parent access portal', false, true),
        ('sms_notifications', 'Enable SMS notification system', false, false),
        ('advanced_reporting', 'Enable advanced analytics and reporting', false, false),
        ('document_generation', 'Enable document generation features', false, true),
        ('api_access', 'Enable API access for integrations', false, false)
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✅ Developer Portal database tables created successfully');
    console.log('✅ Default feature flags inserted');

  } catch (error) {
    console.error('❌ Error creating Developer Portal tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDeveloperPortal()
    .then(() => {
      console.log('🎉 Developer Portal migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateDeveloperPortal };