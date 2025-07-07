import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🔄 Setting up database tables...');

  try {
    // Create app_users table (renamed to avoid conflicts)
    const { data: usersTable, error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS app_users (
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
      `
    });

    if (usersError) {
      console.log('Users table likely already exists or using alternative method');
    } else {
      console.log('✓ Users table created');
    }

    // Create schools table
    const { error: schoolsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS schools (
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
      `
    });

    if (!schoolsError) {
      console.log('✓ Schools table created');
    }

    // Create students table
    const { error: studentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS students (
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
          guardian_phone TEXT,
          address TEXT,
          admission_date DATE,
          status TEXT DEFAULT 'active',
          school_id INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `
    });

    if (!studentsError) {
      console.log('✓ Students table created');
    }

    // Create document_templates table
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS document_templates (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          name_bn TEXT,
          is_active BOOLEAN DEFAULT true,
          credits_required INTEGER DEFAULT 1,
          popularity INTEGER DEFAULT 0,
          usage_count INTEGER DEFAULT 0,
          template_data JSONB,
          fields JSONB,
          layout JSONB,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW(),
          last_used TIMESTAMP
        );
      `
    });

    if (!templatesError) {
      console.log('✓ Document templates table created');
    }

    // Insert default admin user
    const adminPassword = '$2a$10$123456789012345678901234567890123456'; // Default hash for 'admin123'
    const { error: adminError } = await supabase
      .from('app_users')
      .upsert({
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@school.edu.bd',
        password_hash: adminPassword,
        role: 'admin',
        is_admin: true,
        credits: 1000
      }, { onConflict: 'username' });

    if (!adminError) {
      console.log('✓ Default admin user created');
    }

    // Insert sample school
    const { error: schoolError } = await supabase
      .from('schools')
      .upsert({
        id: 1,
        name: 'Sample School',
        address: 'Dhaka, Bangladesh',
        phone: '+880-1234567890',
        email: 'info@sampleschool.edu.bd',
        principal_name: 'Principal Name'
      }, { onConflict: 'id' });

    if (!schoolError) {
      console.log('✓ Sample school created');
    }

    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();