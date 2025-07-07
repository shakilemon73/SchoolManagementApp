import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: 'require'
});

async function createTables() {
  console.log('Creating database tables directly...');

  try {
    // Create app_users table
    await sql`
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
      )
    `;
    console.log('✓ app_users table created');

    // Create students table
    await sql`
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
      )
    `;
    console.log('✓ students table created');

    // Create document_templates table
    await sql`
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
      )
    `;
    console.log('✓ document_templates table created');

    // Create notifications table
    await sql`
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
      )
    `;
    console.log('✓ notifications table created');

    // Insert default admin user
    await sql`
      INSERT INTO public.app_users (username, name, email, password_hash, role, is_admin, credits)
      VALUES ('admin', 'System Administrator', 'admin@school.edu.bd', '$2b$10$vI3GbFwGG3kRCZa4/eAJhe7QFKzxgvVBGUGwG7QsKKK3nFJp4fQQG', 'admin', true, 1000)
      ON CONFLICT (username) DO NOTHING
    `;
    console.log('✓ Default admin user created');

    // Test table access
    const userCount = await sql`SELECT COUNT(*) FROM app_users`;
    console.log(`✓ Tables verified - ${userCount[0].count} users in database`);

    console.log('✅ Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await sql.end();
  }
}

createTables();