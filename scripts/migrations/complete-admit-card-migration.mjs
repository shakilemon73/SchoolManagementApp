import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

async function completeAdmitCardMigration() {
  try {
    console.log('🔧 Completing admit card database migration...');
    
    // Force Supabase connection
    const databaseUrl = 'postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';
    const client = postgres(databaseUrl);
    const db = drizzle(client);

    console.log('✓ Connected to Supabase PostgreSQL');

    // Add missing columns to admit_cards table
    console.log('📋 Adding missing columns...');
    
    await db.execute(sql`ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS "group" TEXT`);
    console.log('✓ Added group column');
    
    await db.execute(sql`ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS subject_list TEXT`);
    console.log('✓ Added subject_list column');
    
    await db.execute(sql`ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS session TEXT`);
    console.log('✓ Added session column');
    
    await db.execute(sql`ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS college_code TEXT`);
    console.log('✓ Added college_code column');
    
    await db.execute(sql`ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS college_name TEXT`);
    console.log('✓ Added college_name column');
    
    await db.execute(sql`ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS board_name TEXT`);
    console.log('✓ Added board_name column');

    // Verify the table structure
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admit_cards' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Current admit_cards table columns:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    console.log('✅ Admit card migration completed successfully');
    console.log('🎯 System ready for real admit card generation');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

completeAdmitCardMigration();