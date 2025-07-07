#!/usr/bin/env node

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = "postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1
});

async function fixCalendarSchema() {
  try {
    console.log('🔧 Making titleBn optional in calendar_events table...');

    // Alter the column to make it nullable
    await sql`ALTER TABLE calendar_events ALTER COLUMN title_bn DROP NOT NULL`;
    console.log('✓ Made title_bn column optional');

    // Test inserting an event without Bengali title
    await sql`
      INSERT INTO calendar_events (title, start_date, type, school_id)
      VALUES ('Test Event Without Bengali', CURRENT_DATE, 'test', 1)
    `;
    console.log('✓ Test insert successful');

    // Clean up test data
    await sql`DELETE FROM calendar_events WHERE title = 'Test Event Without Bengali'`;
    console.log('✓ Test data cleaned up');

    console.log('✅ Calendar schema fixed - titleBn is now optional!');

  } catch (error) {
    console.error('❌ Error fixing schema:', error);
  } finally {
    await sql.end();
  }
}

fixCalendarSchema();