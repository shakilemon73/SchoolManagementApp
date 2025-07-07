import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
  console.log('Creating database tables using Supabase client...');

  // Since direct SQL execution is restricted, we'll use a workaround
  // by creating the tables through insert operations that force table creation

  try {
    // Method 1: Use Supabase's built-in table creation via first insert
    console.log('Creating app_users table...');
    
    // Try to create the admin user - this will create the table if it doesn't exist
    const adminUser = {
      username: 'admin',
      name: 'System Administrator', 
      email: 'admin@school.edu.bd',
      password_hash: '$2b$10$vI3GbFwGG3kRCZa4/eAJhe7QFKzxgvVBGUGwG7QsKKK3nFJp4fQQG', // admin123
      role: 'admin',
      is_admin: true,
      credits: 1000,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: userData, error: userError } = await supabase
      .from('app_users')
      .upsert(adminUser, { onConflict: 'username' })
      .select();

    if (userError) {
      console.log('User table creation failed:', userError.message);
      // If table doesn't exist, we need to create it manually via the Dashboard
      console.log('⚠️ Tables need to be created manually in Supabase Dashboard');
      console.log('Please go to your Supabase project dashboard and run this SQL:');
      
      console.log(`
-- Run this in your Supabase SQL Editor:

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

-- Insert default admin user
INSERT INTO public.app_users (username, name, email, password_hash, role, is_admin, credits)
VALUES ('admin', 'System Administrator', 'admin@school.edu.bd', '$2b$10$vI3GbFwGG3kRCZa4/eAJhe7QFKzxgvVBGUGwG7QsKKK3nFJp4fQQG', 'admin', true, 1000)
ON CONFLICT (username) DO NOTHING;
      `);
      
    } else {
      console.log('✅ Admin user created successfully:', userData);
    }

    // Test if we can access the tables now
    const { data: testData, error: testError } = await supabase
      .from('app_users')
      .select('id, username, role')
      .limit(1);

    if (testError) {
      console.log('❌ Table access still failed:', testError.message);
    } else {
      console.log('✅ Database tables are now accessible');
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

fixDatabase();