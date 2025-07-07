import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function createAcademicTermsTable() {
  try {
    console.log('🔄 Creating academic terms table...');
    
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL not found');
    }

    const client = postgres(connectionString);
    const db = drizzle(client);

    // Create the academic_terms table using raw SQL
    await client`
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
    `;

    console.log('✓ Academic terms table created successfully');

    // Insert sample data
    console.log('🔄 Adding sample academic terms...');
    
    await client`
      INSERT INTO academic_terms (name, name_bn, academic_year_id, start_date, end_date, description, description_bn, status, exam_scheduled, result_published)
      VALUES 
        ('First Term 2025', 'প্রথম টার্ম ২০২৫', 1, '2025-01-01', '2025-04-30', 'First term of academic year 2025', '২০২৫ শিক্ষাবর্ষের প্রথম টার্ম', 'ongoing', true, false),
        ('Second Term 2025', 'দ্বিতীয় টার্ম ২০২৫', 1, '2025-05-01', '2025-08-31', 'Second term of academic year 2025', '২০২৫ শিক্ষাবর্ষের দ্বিতীয় টার্ম', 'upcoming', false, false),
        ('Final Term 2025', 'চূড়ান্ত টার্ম ২০২৫', 1, '2025-09-01', '2025-12-31', 'Final term of academic year 2025', '২০২৫ শিক্ষাবর্ষের চূড়ান্ত টার্ম', 'upcoming', false, false)
      ON CONFLICT DO NOTHING;
    `;

    console.log('✓ Sample academic terms added successfully');
    
    await client.end();
    console.log('✓ Academic terms setup completed');
  } catch (error) {
    console.error('❌ Error creating academic terms table:', error);
    process.exit(1);
  }
}

createAcademicTermsTable();