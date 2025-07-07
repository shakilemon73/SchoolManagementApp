import { db } from "../db/index";
import { sql } from "drizzle-orm";

export async function createMissingTables() {
  try {
    console.log('🔧 Creating missing database tables...');
    
    // Create staff table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        staff_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        name_in_bangla TEXT,
        department TEXT,
        designation TEXT,
        date_of_birth DATE,
        gender TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        join_date DATE,
        salary INTEGER,
        school_id INTEGER,
        status TEXT DEFAULT 'active' NOT NULL,
        photo TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Insert sample staff data
    await db.execute(sql`
      INSERT INTO staff (staff_id, name, name_in_bangla, department, designation, phone, email, school_id, status) VALUES
      ('STF-001', 'Abdul Rahman', 'আব্দুল রহমান', 'Administration', 'Administrative Officer', '+8801712345678', 'rahman@unityschool.edu.bd', 1, 'active'),
      ('STF-002', 'Fatima Khatun', 'ফাতিমা খাতুন', 'Accounts', 'Accountant', '+8801812345678', 'fatima@unityschool.edu.bd', 1, 'active')
      ON CONFLICT (staff_id) DO NOTHING;
    `);

    // Create parents table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS parents (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_in_bangla TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        occupation TEXT,
        address TEXT,
        relation TEXT NOT NULL,
        school_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Insert sample parents data
    await db.execute(sql`
      INSERT INTO parents (name, name_in_bangla, phone, email, occupation, address, relation, school_id) VALUES
      ('Mohammad Ali', 'মোহাম্মদ আলী', '+8801712345001', 'mali@example.com', 'Business', 'Dhaka, Bangladesh', 'father', 1),
      ('Rashida Begum', 'রশিদা বেগম', '+8801712345002', 'rashida@example.com', 'Teacher', 'Dhaka, Bangladesh', 'mother', 1)
      ON CONFLICT DO NOTHING;
    `);

    // Create academic_terms table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS academic_terms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_bn TEXT NOT NULL,
        academic_year_id INTEGER DEFAULT 1 NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT false,
        description TEXT,
        description_bn TEXT,
        exam_scheduled BOOLEAN DEFAULT false,
        result_published BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'upcoming' NOT NULL,
        school_id INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Insert sample academic terms data
    await db.execute(sql`
      INSERT INTO academic_terms (name, name_bn, academic_year_id, start_date, end_date, description, description_bn, status, exam_scheduled, result_published) VALUES
      ('First Term 2025', 'প্রথম টার্ম ২০২৫', 1, '2025-01-01', '2025-04-30', 'First term of academic year 2025', '২০২৫ শিক্ষাবর্ষের প্রথম টার্ম', 'ongoing', true, false),
      ('Second Term 2025', 'দ্বিতীয় টার্ম ২০২৫', 1, '2025-05-01', '2025-08-31', 'Second term of academic year 2025', '২০২৫ শিক্ষাবর্ষের দ্বিতীয় টার্ম', 'upcoming', false, false),
      ('Final Term 2025', 'চূড়ান্ত টার্ম ২০২৫', 1, '2025-09-01', '2025-12-31', 'Final term of academic year 2025', '২০২৫ শিক্ষাবর্ষের চূড়ান্ত টার্ম', 'upcoming', false, false)
      ON CONFLICT DO NOTHING;
    `);

    // Update academic_years table to add missing columns for comprehensive functionality
    await db.execute(sql`
      ALTER TABLE academic_years 
      ADD COLUMN IF NOT EXISTS name_bn TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS description_bn TEXT,
      ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_classes INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_terms INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
    `);

    // Insert real academic years data to replace static demo content
    await db.execute(sql`
      INSERT INTO academic_years (name, name_bn, start_date, end_date, is_active, is_current, description, description_bn, status, total_students, total_classes, total_terms) VALUES
      ('2025 Academic Year', '২০২৫ শিক্ষাবর্ষ', '2025-01-01', '2025-12-31', true, true, 'Current academic year with all programs', 'সমস্ত কর্মসূচি সহ বর্তমান শিক্ষাবর্ষ', 'active', 450, 12, 3),
      ('2024 Academic Year', '২০২৪ শিক্ষাবর্ষ', '2024-01-01', '2024-12-31', false, false, 'Completed academic year', 'সম্পন্ন শিক্ষাবর্ষ', 'completed', 420, 12, 3),
      ('2026 Academic Year', '২০২৬ শিক্ষাবর্ষ', '2026-01-01', '2026-12-31', false, false, 'Upcoming academic year', 'আসন্ন শিক্ষাবর্ষ', 'draft', 0, 0, 0)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✓ Staff, Parents, Academic Years, and Academic Terms tables created with sample data');
  } catch (error) {
    console.error('Error creating missing tables:', error);
  }
}