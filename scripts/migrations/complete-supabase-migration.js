import postgres from 'postgres';

const databaseUrl = "postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const client = postgres(databaseUrl, {
  prepare: false,
  fetch_types: false,
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
  debug: false,
  onnotice: () => {},
  onparameter: () => {},
  transform: { undefined: null }
});

async function completeSupabaseMigration() {
  try {
    console.log('🚀 Starting complete Supabase database migration...');

    // Create all essential tables that might be missing
    const tables = [
      {
        name: 'app_users',
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
          )
        `
      },
      {
        name: 'schools',
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
          )
        `
      },
      {
        name: 'students',
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
            address TEXT,
            phone TEXT,
            email TEXT,
            admission_date DATE,
            status TEXT DEFAULT 'active',
            school_id INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          )
        `
      },
      {
        name: 'document_templates',
        sql: `
          CREATE TABLE IF NOT EXISTS document_templates (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            name_bn TEXT NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            description_bn TEXT,
            template JSONB,
            is_active BOOLEAN DEFAULT true,
            required_credits INTEGER DEFAULT 1,
            difficulty TEXT DEFAULT 'easy',
            estimated_time TEXT DEFAULT '2 minutes',
            popularity INTEGER DEFAULT 0,
            usage_count INTEGER DEFAULT 0,
            last_used TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `
      },
      {
        name: 'notifications',
        sql: `
          CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            title_bn TEXT NOT NULL,
            message TEXT NOT NULL,
            message_bn TEXT NOT NULL,
            type TEXT DEFAULT 'info' NOT NULL,
            priority TEXT DEFAULT 'medium' NOT NULL,
            category TEXT NOT NULL,
            category_bn TEXT NOT NULL,
            recipient_id INTEGER,
            recipient_type TEXT DEFAULT 'user' NOT NULL,
            sender TEXT,
            is_read BOOLEAN DEFAULT false,
            is_live BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            is_public BOOLEAN DEFAULT false,
            action_required BOOLEAN DEFAULT false,
            read_at TIMESTAMP,
            school_id INTEGER DEFAULT 1 NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `
      },
      {
        name: 'calendar_events',
        sql: `
          CREATE TABLE IF NOT EXISTS calendar_events (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            title_bn TEXT,
            description TEXT,
            description_bn TEXT,
            start_date DATE NOT NULL,
            end_date DATE,
            start_time TIME,
            end_time TIME,
            type TEXT DEFAULT 'event' NOT NULL,
            is_active BOOLEAN DEFAULT true,
            is_public BOOLEAN DEFAULT false,
            location TEXT,
            organizer TEXT,
            attendees JSONB,
            school_id INTEGER DEFAULT 1 NOT NULL,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `
      },
      {
        name: 'library_books',
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
          )
        `
      },
      {
        name: 'credit_packages',
        sql: `
          CREATE TABLE IF NOT EXISTS credit_packages (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            credits INTEGER NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          )
        `
      }
    ];

    // Create each table
    for (const table of tables) {
      console.log(`Creating table: ${table.name}`);
      await client.unsafe(table.sql);
      console.log(`✓ ${table.name} table ready`);
    }

    // Insert sample data for essential tables
    console.log('🔄 Inserting essential sample data...');

    // Schools
    await client`
      INSERT INTO schools (name, address, phone, email, type)
      VALUES ('Demo School', 'Dhaka, Bangladesh', '+880-1234567890', 'info@demoschool.edu.bd', 'public')
      ON CONFLICT DO NOTHING
    `;

    // Sample users (admin) - using actual existing table structure
    await client`
      INSERT INTO app_users (username, email, password_hash, role, is_admin)
      VALUES 
        ('admin', 'admin@school.edu.bd', '$2a$10$YourHashedPasswordHere', 'admin', true),
        ('teacher1', 'teacher@school.edu.bd', '$2a$10$YourHashedPasswordHere', 'teacher', false)
      ON CONFLICT (username) DO NOTHING
    `;

    // Sample students
    await client`
      INSERT INTO students (name, name_in_bangla, student_id, class, section, roll_number, status)
      VALUES 
        ('Ahmed Rahman', 'আহমেদ রহমান', 'STU-2024-001', 'Class 10', 'A', '001', 'active'),
        ('Fatima Khan', 'ফাতিমা খান', 'STU-2024-002', 'Class 10', 'A', '002', 'active'),
        ('Mohammad Ali', 'মোহাম্মদ আলী', 'STU-2024-003', 'Class 9', 'B', '001', 'active')
      ON CONFLICT (student_id) DO NOTHING
    `;

    // Document templates
    await client`
      INSERT INTO document_templates (name, name_bn, type, category, description, description_bn, required_credits, difficulty)
      VALUES 
        ('ID Card', 'পরিচয়পত্র', 'id_card', 'academic', 'Student identification card', 'ছাত্র পরিচয়পত্র', 2, 'easy'),
        ('Certificate', 'সার্টিফিকেট', 'certificate', 'academic', 'Academic certificate', 'একাডেমিক সার্টিফিকেট', 3, 'medium'),
        ('Admit Card', 'প্রবেশপত্র', 'admit_card', 'exam', 'Examination admit card', 'পরীক্ষার প্রবেশপত্র', 2, 'easy'),
        ('Mark Sheet', 'নম্বরপত্র', 'marksheet', 'exam', 'Student mark sheet', 'ছাত্রের নম্বরপত্র', 3, 'medium')
      ON CONFLICT DO NOTHING
    `;

    // Sample library books
    await client`
      INSERT INTO library_books (title, title_bn, author, category, location, total_copies, available_copies)
      VALUES 
        ('Bangladesh History', 'বাংলাদেশের ইতিহাস', 'Dr. Rahman', 'History', 'Shelf A-1', 5, 4),
        ('Mathematics Guide', 'গণিত গাইড', 'Prof. Khan', 'Mathematics', 'Shelf B-2', 3, 3),
        ('English Grammar', 'ইংরেজি ব্যাকরণ', 'John Smith', 'Language', 'Shelf C-1', 8, 6)
      ON CONFLICT DO NOTHING
    `;

    // Sample notifications
    await client`
      INSERT INTO notifications (title, title_bn, message, message_bn, category, category_bn, is_public)
      VALUES 
        ('Welcome to School Management System', 'স্কুল ব্যবস্থাপনা সিস্টেমে স্বাগতম', 'Welcome to our digital school management platform', 'আমাদের ডিজিটাল স্কুল ব্যবস্থাপনা প্ল্যাটফর্মে স্বাগতম', 'System', 'সিস্টেম', true),
        ('New Academic Year Started', 'নতুন শিক্ষাবর্ষ শুরু', 'Academic year 2024-25 has begun', '২০২৪-২৫ শিক্ষাবর্ষ শুরু হয়েছে', 'Academic', 'একাডেমিক', true)
      ON CONFLICT DO NOTHING
    `;

    // Credit packages
    await client`
      INSERT INTO credit_packages (name, description, credits, price)
      VALUES 
        ('Starter Pack', 'Basic credit package for new users', 100, 500.00),
        ('Standard Pack', 'Standard credit package for regular users', 500, 2000.00),
        ('Premium Pack', 'Premium credit package for heavy users', 1000, 3500.00)
      ON CONFLICT DO NOTHING
    `;

    console.log('✅ Supabase database migration completed successfully');
    console.log('✅ All tables created with sample data');
    
    // Verify tables exist
    const tableCheck = await client`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('📋 Available tables:', tableCheck.map(t => t.table_name).join(', '));
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await client.end();
    process.exit(1);
  }
}

completeSupabaseMigration();