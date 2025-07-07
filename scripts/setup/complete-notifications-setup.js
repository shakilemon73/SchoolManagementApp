#!/usr/bin/env node

import postgres from 'postgres';

const databaseUrl = "postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10
});

async function completeNotificationsSetup() {
  try {
    console.log('🔧 Completing notifications table setup...');
    
    // Add missing school_id column
    console.log('Adding school_id column...');
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS school_id INTEGER DEFAULT 1 NOT NULL;`;
    
    // Add missing updated_at column
    console.log('Adding updated_at column...');
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();`;
    
    // Create all necessary indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_school_id ON notifications(school_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type ON notifications(recipient_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);`;
    
    // Test with a simple insert
    console.log('Testing table functionality...');
    await sql`
      INSERT INTO notifications (
        title, title_bn, message, message_bn, type, priority, 
        category, category_bn, recipient_type, is_public, school_id
      ) VALUES (
        'System Ready', 'সিস্টেম প্রস্তুত', 
        'Notifications working properly', 'বিজ্ঞপ্তি সঠিকভাবে কাজ করছে',
        'success', 'medium', 'System', 'সিস্টেম', 'user', true, 1
      )
      ON CONFLICT DO NOTHING;
    `;
    
    // Verify table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('✅ Final table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    const count = await sql`SELECT COUNT(*) as count FROM notifications;`;
    console.log(`✅ Notifications table ready with ${count[0].count} notifications`);
    
    await sql.end();
    console.log('🎉 Notifications table setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

completeNotificationsSetup();