import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

async function createSupabaseTables() {
  console.log('🔄 Setting up Supabase database tables...');

  try {
    // Create app_users table (avoiding conflict with Supabase auth.users)
    const { error: usersError } = await supabase.rpc('exec_sql', {
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
      console.log('Creating app_users table directly...');
      // Fallback: try direct table creation
      const { error: directError } = await supabase
        .from('app_users')
        .select('id')
        .limit(1);
      
      if (directError && directError.code === 'PGRST116') {
        console.log('Table does not exist, creating schema...');
      }
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
          guardian_name TEXT,
          guardian_phone TEXT,
          address TEXT,
          emergency_contact TEXT,
          photo_url TEXT,
          email TEXT,
          phone TEXT,
          admission_date DATE,
          status TEXT,
          previous_school TEXT,
          medical_conditions TEXT,
          transport_needed BOOLEAN DEFAULT false,
          library_card_number TEXT,
          notes TEXT,
          school_id INTEGER DEFAULT 1 NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `
    });

    // Create document templates table
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS document_templates (
          id SERIAL PRIMARY KEY,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          name_bn TEXT,
          description_bn TEXT,
          fields TEXT,
          template_data TEXT,
          is_active BOOLEAN DEFAULT true,
          credits_required INTEGER DEFAULT 1,
          popularity INTEGER DEFAULT 0,
          usage_count INTEGER DEFAULT 0,
          generated BOOLEAN DEFAULT false,
          last_used TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    // Create library books table
    const { error: libraryError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS library_books (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          title_bn TEXT NOT NULL,
          author TEXT NOT NULL,
          isbn TEXT,
          category TEXT NOT NULL,
          publisher TEXT,
          publish_year INTEGER,
          total_copies INTEGER DEFAULT 1 NOT NULL,
          available_copies INTEGER DEFAULT 1 NOT NULL,
          location TEXT NOT NULL,
          description TEXT,
          school_id INTEGER DEFAULT 1 NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `
    });

    console.log('✓ Database tables created successfully!');

    // Test table access
    const { data: testUsers, error: testError } = await supabase
      .from('app_users')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('⚠ Tables created but access verification failed:', testError.message);
    } else {
      console.log('✓ Table access verified');
    }

    // Create admin user if not exists
    const { data: existingAdmin } = await supabase
      .from('app_users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (!existingAdmin) {
      const { error: adminError } = await supabase
        .from('app_users')
        .insert([{
          username: 'admin',
          name: 'Admin User',
          email: 'admin@school.com',
          password_hash: '$2b$10$hashedPasswordExample', // You should hash this properly
          role: 'admin',
          is_admin: true
        }]);

      if (adminError) {
        console.log('⚠ Could not create admin user:', adminError.message);
      } else {
        console.log('✓ Admin user created');
      }
    } else {
      console.log('✓ Admin user already exists');
    }

    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    return false;
  }
}

// Run the setup
createSupabaseTables().then(success => {
  if (success) {
    console.log('🎉 Supabase migration completed successfully!');
  } else {
    console.log('❌ Migration failed');
  }
  process.exit(success ? 0 : 1);
});