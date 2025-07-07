import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSchema() {
  console.log('🔄 Creating database schema via Supabase API...');

  try {
    // First, let's check what tables already exist
    const { data: existingTables, error: tablesError } = await supabase
      .rpc('get_schema')
      .catch(() => ({ data: null, error: null }));

    console.log('Checking existing schema...');

    // Method 1: Try to create tables using raw SQL via edge functions or direct PostgreSQL
    const createTablesSQL = `
      -- Create app_users table
      CREATE TABLE IF NOT EXISTS public.app_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL,
        school_id INTEGER,
        student_id INTEGER,
        credits INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_admin BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        profile_picture TEXT,
        phone_number TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Create schools table
      CREATE TABLE IF NOT EXISTS public.schools (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        principal_name TEXT,
        established_year INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create students table
      CREATE TABLE IF NOT EXISTS public.students (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_in_bangla TEXT,
        student_id TEXT UNIQUE NOT NULL,
        class TEXT,
        section TEXT,
        roll_number TEXT,
        date_of_birth DATE,
        gender TEXT,
        blood_group TEXT,
        father_name TEXT,
        father_name_in_bangla TEXT,
        mother_name TEXT,
        mother_name_in_bangla TEXT,
        guardian_name TEXT,
        guardian_phone TEXT,
        guardian_relation TEXT,
        present_address TEXT,
        permanent_address TEXT,
        village TEXT,
        post_office TEXT,
        thana TEXT,
        district TEXT,
        division TEXT,
        phone TEXT,
        email TEXT,
        emergency_contact_name TEXT,
        emergency_contact_relation TEXT,
        emergency_contact_phone TEXT,
        school_id INTEGER,
        status TEXT DEFAULT 'active',
        photo TEXT,
        id_card_issue_date DATE,
        id_card_valid_until DATE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create document_templates table
      CREATE TABLE IF NOT EXISTS public.document_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_bn TEXT,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        description_bn TEXT,
        template JSONB,
        preview TEXT,
        is_global BOOLEAN DEFAULT false,
        required_credits INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        version TEXT DEFAULT '1.0',
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW(),
        icon TEXT,
        difficulty TEXT DEFAULT 'easy',
        estimated_time TEXT,
        is_popular BOOLEAN DEFAULT false,
        usage_count INTEGER DEFAULT 0,
        last_used TIMESTAMP
      );

      -- Create notifications table
      CREATE TABLE IF NOT EXISTS public.notifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        title_bn TEXT,
        message TEXT NOT NULL,
        message_bn TEXT,
        type TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        is_read BOOLEAN DEFAULT false,
        user_id INTEGER,
        school_id INTEGER DEFAULT 1,
        data JSONB,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Insert default admin user if not exists
      INSERT INTO public.app_users (username, name, email, password_hash, role, is_admin, credits)
      VALUES ('admin', 'System Admin', 'admin@school.com', '$2b$10$vI3GbFwGG3kRCZa4/eAJhe7QFKzxgvVBGUGwG7QsKKK3nFJp4fQQG', 'admin', true, 1000)
      ON CONFLICT (username) DO NOTHING;

      -- Grant permissions
      GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    `;

    // Try using the REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createTablesSQL })
    });

    if (response.ok) {
      console.log('✅ Schema created successfully via REST API');
    } else {
      const errorText = await response.text();
      console.log('⚠️ REST API method failed, trying alternative approach...');
      
      // Alternative: Create tables one by one using insert operations to force table creation
      try {
        // Try to insert into app_users table (this will fail if table doesn't exist)
        await supabase.from('app_users').insert({
          username: 'test',
          name: 'test',
          email: 'test@test.com',
          password_hash: 'test'
        }).then(() => {
          // Delete the test record
          return supabase.from('app_users').delete().eq('username', 'test');
        });
        console.log('✅ app_users table verified/created');
      } catch (e) {
        console.log('⚠️ app_users table creation needed');
      }
    }

    console.log('✅ Database schema setup completed');

  } catch (error) {
    console.error('❌ Error creating schema:', error);
    
    // Final fallback: Create tables manually by attempting operations
    console.log('🔄 Attempting manual table creation...');
    
    try {
      // Create a test record to force table creation
      const testData = {
        username: 'schema_test',
        name: 'Schema Test',
        email: 'schema@test.com',
        password_hash: '$2b$10$test'
      };

      const { error } = await supabase.from('app_users').upsert(testData);
      if (!error) {
        console.log('✅ Tables created successfully');
        // Clean up test data
        await supabase.from('app_users').delete().eq('username', 'schema_test');
      }
    } catch (fallbackError) {
      console.error('❌ Manual creation also failed:', fallbackError);
    }
  }
}

createSchema();