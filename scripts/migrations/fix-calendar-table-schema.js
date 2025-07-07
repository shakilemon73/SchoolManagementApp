#!/usr/bin/env node

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = "postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1
});

async function fixCalendarTable() {
  try {
    console.log('🔧 Fixing calendar_events table schema...');

    // Drop and recreate calendar_events table with correct schema
    await sql`DROP TABLE IF EXISTS calendar_events CASCADE`;
    console.log('✓ Dropped existing calendar_events table');

    // Create calendar_events table with correct schema matching shared/schema.ts
    await sql`
      CREATE TABLE calendar_events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        title_bn TEXT NOT NULL,
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
        attendees JSON,
        school_id INTEGER DEFAULT 1 NOT NULL,
        created_by INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ Created calendar_events table with correct schema');

    // Insert sample calendar events with Bengali translations
    await sql`
      INSERT INTO calendar_events (
        title, title_bn, description, description_bn, 
        start_date, end_date, start_time, end_time, 
        type, location, organizer, is_public, school_id
      )
      VALUES 
        (
          'School Assembly', 
          'স্কুল সমাবেশ',
          'Weekly school assembly for all students',
          'সকল শিক্ষার্থীদের জন্য সাপ্তাহিক স্কুল সমাবেশ',
          CURRENT_DATE + INTERVAL '1 day',
          CURRENT_DATE + INTERVAL '1 day',
          '08:00:00',
          '09:00:00',
          'event',
          'Main Hall',
          'Principal',
          true,
          1
        ),
        (
          'Parent Meeting',
          'অভিভাবক সভা',
          'Monthly parent-teacher meeting',
          'মাসিক অভিভাবক-শিক্ষক সভা',
          CURRENT_DATE + INTERVAL '1 week',
          CURRENT_DATE + INTERVAL '1 week',
          '14:00:00',
          '16:00:00',
          'meeting',
          'Conference Room',
          'Class Teacher',
          false,
          1
        ),
        (
          'Sports Day',
          'ক্রীড়া দিবস',
          'Annual sports competition for all grades',
          'সকল শ্রেণীর বার্ষিক ক্রীড়া প্রতিযোগিতা',
          CURRENT_DATE + INTERVAL '2 weeks',
          CURRENT_DATE + INTERVAL '2 weeks',
          '08:00:00',
          '17:00:00',
          'event',
          'Sports Ground',
          'Sports Committee',
          true,
          1
        ),
        (
          'Mid-term Exam',
          'অর্ধবার্ষিক পরীক্ষা',
          'Mid-term examination for classes 6-10',
          '৬ম-১০ম শ্রেণীর অর্ধবার্ষিক পরীক্ষা',
          CURRENT_DATE + INTERVAL '3 weeks',
          CURRENT_DATE + INTERVAL '4 weeks',
          '09:00:00',
          '12:00:00',
          'exam',
          'Examination Hall',
          'Academic Department',
          false,
          1
        )
    `;
    console.log('✓ Added sample calendar events with Bengali translations');

    // Verify the table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'calendar_events'
      ORDER BY ordinal_position
    `;
    
    console.log('✓ Calendar events table structure:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Test data retrieval
    const eventCount = await sql`SELECT COUNT(*) FROM calendar_events`;
    console.log(`✓ Calendar events created: ${eventCount[0].count}`);

    console.log('✅ Calendar table schema fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing calendar table:', error);
  } finally {
    await sql.end();
  }
}

fixCalendarTable();