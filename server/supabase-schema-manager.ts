import { SupabaseClient } from "@supabase/supabase-js";

export interface SchemaSetupResult {
  success: boolean;
  tablesCreated: string[];
  bucketsCreated: string[];
  policiesCreated: string[];
  errors: string[];
}

export class SupabaseSchemaManager {
  
  /**
   * Complete database schema setup for a school's Supabase instance
   */
  static async setupCompleteSchema(client: SupabaseClient): Promise<SchemaSetupResult> {
    const result: SchemaSetupResult = {
      success: false,
      tablesCreated: [],
      bucketsCreated: [],
      policiesCreated: [],
      errors: []
    };

    try {
      // 1. Create all required tables
      await this.createCoreTables(client, result);
      
      // 2. Create storage buckets
      await this.createStorageBuckets(client, result);
      
      // 3. Set up Row Level Security policies
      await this.setupRLSPolicies(client, result);
      
      // 4. Insert default data
      await this.insertDefaultData(client, result);
      
      result.success = result.errors.length === 0;
      return result;
      
    } catch (error: any) {
      result.errors.push(`Schema setup failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Create all core tables required for school management
   */
  private static async createCoreTables(client: SupabaseClient, result: SchemaSetupResult) {
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id BIGSERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            school_id INTEGER,
            student_id INTEGER,
            credits INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            last_login TIMESTAMP WITH TIME ZONE,
            profile_picture TEXT,
            phone_number TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'students',
        sql: `
          CREATE TABLE IF NOT EXISTS students (
            id BIGSERIAL PRIMARY KEY,
            student_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            name_bn TEXT,
            father_name TEXT,
            mother_name TEXT,
            date_of_birth DATE,
            blood_group TEXT,
            phone TEXT,
            email TEXT,
            address TEXT,
            class_id INTEGER,
            section TEXT,
            roll_number INTEGER,
            admission_date DATE,
            status TEXT DEFAULT 'active',
            photo_url TEXT,
            guardian_name TEXT,
            guardian_phone TEXT,
            emergency_contact TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'teachers',
        sql: `
          CREATE TABLE IF NOT EXISTS teachers (
            id BIGSERIAL PRIMARY KEY,
            teacher_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            name_bn TEXT,
            email TEXT,
            phone TEXT,
            subject TEXT,
            qualification TEXT,
            experience INTEGER,
            date_of_joining DATE,
            salary DECIMAL(10,2),
            status TEXT DEFAULT 'active',
            department TEXT,
            designation TEXT,
            address TEXT,
            photo_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'classes',
        sql: `
          CREATE TABLE IF NOT EXISTS classes (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            name_bn TEXT,
            level INTEGER,
            section TEXT,
            class_teacher_id INTEGER REFERENCES teachers(id),
            room_number TEXT,
            capacity INTEGER DEFAULT 30,
            description TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'subjects',
        sql: `
          CREATE TABLE IF NOT EXISTS subjects (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            name_bn TEXT,
            code TEXT UNIQUE,
            class_id INTEGER REFERENCES classes(id),
            teacher_id INTEGER REFERENCES teachers(id),
            credits INTEGER DEFAULT 1,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'attendance',
        sql: `
          CREATE TABLE IF NOT EXISTS attendance (
            id BIGSERIAL PRIMARY KEY,
            student_id INTEGER REFERENCES students(id),
            class_id INTEGER REFERENCES classes(id),
            date DATE NOT NULL,
            status TEXT NOT NULL DEFAULT 'present',
            notes TEXT,
            marked_by INTEGER REFERENCES teachers(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, date)
          );
        `
      },
      {
        name: 'fees',
        sql: `
          CREATE TABLE IF NOT EXISTS fees (
            id BIGSERIAL PRIMARY KEY,
            student_id INTEGER REFERENCES students(id),
            fee_type TEXT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            due_date DATE,
            paid_date DATE,
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            receipt_number TEXT,
            academic_year TEXT,
            month TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'exams',
        sql: `
          CREATE TABLE IF NOT EXISTS exams (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            exam_type TEXT NOT NULL,
            class_id INTEGER REFERENCES classes(id),
            subject_id INTEGER REFERENCES subjects(id),
            exam_date DATE,
            start_time TIME,
            end_time TIME,
            total_marks INTEGER DEFAULT 100,
            passing_marks INTEGER DEFAULT 40,
            status TEXT DEFAULT 'scheduled',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'results',
        sql: `
          CREATE TABLE IF NOT EXISTS results (
            id BIGSERIAL PRIMARY KEY,
            student_id INTEGER REFERENCES students(id),
            exam_id INTEGER REFERENCES exams(id),
            marks_obtained DECIMAL(5,2),
            grade TEXT,
            remarks TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, exam_id)
          );
        `
      },
      {
        name: 'library_books',
        sql: `
          CREATE TABLE IF NOT EXISTS library_books (
            id BIGSERIAL PRIMARY KEY,
            isbn TEXT,
            title TEXT NOT NULL,
            author TEXT,
            publisher TEXT,
            category TEXT,
            total_copies INTEGER DEFAULT 1,
            available_copies INTEGER DEFAULT 1,
            location TEXT,
            purchase_date DATE,
            price DECIMAL(8,2),
            status TEXT DEFAULT 'available',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'library_transactions',
        sql: `
          CREATE TABLE IF NOT EXISTS library_transactions (
            id BIGSERIAL PRIMARY KEY,
            book_id INTEGER REFERENCES library_books(id),
            borrower_id INTEGER,
            borrower_type TEXT NOT NULL,
            issue_date DATE NOT NULL,
            due_date DATE NOT NULL,
            return_date DATE,
            fine_amount DECIMAL(8,2) DEFAULT 0,
            status TEXT DEFAULT 'issued',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'events',
        sql: `
          CREATE TABLE IF NOT EXISTS events (
            id BIGSERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            event_date DATE NOT NULL,
            start_time TIME,
            end_time TIME,
            location TEXT,
            event_type TEXT,
            organizer TEXT,
            status TEXT DEFAULT 'scheduled',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'notifications',
        sql: `
          CREATE TABLE IF NOT EXISTS notifications (
            id BIGSERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            recipient_type TEXT NOT NULL,
            recipient_id INTEGER,
            sender_id INTEGER,
            is_read BOOLEAN DEFAULT false,
            notification_type TEXT DEFAULT 'info',
            data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'timetables',
        sql: `
          CREATE TABLE IF NOT EXISTS timetables (
            id BIGSERIAL PRIMARY KEY,
            class_id INTEGER REFERENCES classes(id),
            subject_id INTEGER REFERENCES subjects(id),
            teacher_id INTEGER REFERENCES teachers(id),
            day_of_week INTEGER NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            room_number TEXT,
            academic_year TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];

    for (const table of tables) {
      try {
        const { error } = await client.rpc('exec_sql', { sql: table.sql });
        if (error) {
          result.errors.push(`Failed to create table ${table.name}: ${error.message}`);
        } else {
          result.tablesCreated.push(table.name);
        }
      } catch (error: any) {
        result.errors.push(`Error creating table ${table.name}: ${error.message}`);
      }
    }
  }

  /**
   * Create storage buckets for file management
   */
  private static async createStorageBuckets(client: SupabaseClient, result: SchemaSetupResult) {
    const buckets = [
      { 
        name: 'student-photos', 
        config: { public: true, allowedMimeTypes: ['image/*'], fileSizeLimit: 5242880 }
      },
      { 
        name: 'teacher-photos', 
        config: { public: true, allowedMimeTypes: ['image/*'], fileSizeLimit: 5242880 }
      },
      { 
        name: 'school-documents', 
        config: { public: false, allowedMimeTypes: ['application/pdf', 'image/*'], fileSizeLimit: 10485760 }
      },
      { 
        name: 'certificates', 
        config: { public: false, allowedMimeTypes: ['application/pdf', 'image/*'], fileSizeLimit: 10485760 }
      },
      { 
        name: 'exam-papers', 
        config: { public: false, allowedMimeTypes: ['application/pdf'], fileSizeLimit: 10485760 }
      },
      { 
        name: 'library-covers', 
        config: { public: true, allowedMimeTypes: ['image/*'], fileSizeLimit: 2097152 }
      }
    ];

    for (const bucket of buckets) {
      try {
        const { error } = await client.storage.createBucket(bucket.name, bucket.config);
        if (error && !error.message.includes('already exists')) {
          result.errors.push(`Failed to create bucket ${bucket.name}: ${error.message}`);
        } else {
          result.bucketsCreated.push(bucket.name);
        }
      } catch (error: any) {
        result.errors.push(`Error creating bucket ${bucket.name}: ${error.message}`);
      }
    }
  }

  /**
   * Set up Row Level Security policies
   */
  private static async setupRLSPolicies(client: SupabaseClient, result: SchemaSetupResult) {
    const policies = [
      {
        name: 'Enable RLS on users',
        sql: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
      },
      {
        name: 'Users can view their own data',
        sql: `
          CREATE POLICY "Users can view own data" ON users 
          FOR SELECT USING (auth.uid()::text = id::text OR role = 'admin');
        `
      },
      {
        name: 'Enable RLS on students',
        sql: `ALTER TABLE students ENABLE ROW LEVEL SECURITY;`
      },
      {
        name: 'Authenticated users can view students',
        sql: `
          CREATE POLICY "Authenticated users can view students" ON students 
          FOR SELECT TO authenticated;
        `
      },
      {
        name: 'Enable RLS on teachers',
        sql: `ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;`
      },
      {
        name: 'Authenticated users can view teachers',
        sql: `
          CREATE POLICY "Authenticated users can view teachers" ON teachers 
          FOR SELECT TO authenticated;
        `
      },
      {
        name: 'Enable RLS on classes',
        sql: `ALTER TABLE classes ENABLE ROW LEVEL SECURITY;`
      },
      {
        name: 'Authenticated users can view classes',
        sql: `
          CREATE POLICY "Authenticated users can view classes" ON classes 
          FOR SELECT TO authenticated;
        `
      }
    ];

    for (const policy of policies) {
      try {
        const { error } = await client.rpc('exec_sql', { sql: policy.sql });
        if (error && !error.message.includes('already exists')) {
          result.errors.push(`Failed to create policy ${policy.name}: ${error.message}`);
        } else {
          result.policiesCreated.push(policy.name);
        }
      } catch (error: any) {
        // Ignore policy errors for now as they're not critical
        console.log(`Policy setup warning for ${policy.name}: ${error.message}`);
      }
    }
  }

  /**
   * Insert default data for school setup
   */
  private static async insertDefaultData(client: SupabaseClient, result: SchemaSetupResult) {
    try {
      // Create default admin user
      const { error: userError } = await client.from('users').upsert([
        {
          username: 'admin',
          name: 'School Administrator',
          email: 'admin@school.edu',
          password: '$2a$12$placeholder_hash', // This should be properly hashed
          role: 'admin',
          is_active: true
        }
      ]);

      if (userError && !userError.message.includes('duplicate')) {
        result.errors.push(`Failed to create default admin: ${userError.message}`);
      }

      // Create default classes
      const { error: classError } = await client.from('classes').upsert([
        { name: 'Class 1', name_bn: 'প্রথম শ্রেণী', level: 1, is_active: true },
        { name: 'Class 2', name_bn: 'দ্বিতীয় শ্রেণী', level: 2, is_active: true },
        { name: 'Class 3', name_bn: 'তৃতীয় শ্রেণী', level: 3, is_active: true },
        { name: 'Class 4', name_bn: 'চতুর্থ শ্রেণী', level: 4, is_active: true },
        { name: 'Class 5', name_bn: 'পঞ্চম শ্রেণী', level: 5, is_active: true }
      ]);

      if (classError && !classError.message.includes('duplicate')) {
        result.errors.push(`Failed to create default classes: ${classError.message}`);
      }

    } catch (error: any) {
      result.errors.push(`Failed to insert default data: ${error.message}`);
    }
  }

  /**
   * Verify schema setup by checking if all tables exist
   */
  static async verifySchema(client: SupabaseClient): Promise<{ isComplete: boolean; missingTables: string[] }> {
    const requiredTables = [
      'users', 'students', 'teachers', 'classes', 'subjects',
      'attendance', 'fees', 'exams', 'results', 'library_books',
      'library_transactions', 'events', 'notifications', 'timetables'
    ];

    const missingTables: string[] = [];

    for (const table of requiredTables) {
      try {
        const { error } = await client.from(table).select('count').limit(1);
        if (error) {
          missingTables.push(table);
        }
      } catch (error) {
        missingTables.push(table);
      }
    }

    return {
      isComplete: missingTables.length === 0,
      missingTables
    };
  }
}