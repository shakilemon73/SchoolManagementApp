#!/usr/bin/env node

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

console.log('🔧 Connecting to Supabase PostgreSQL...');

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10
});

async function fixNotificationsTable() {
  try {
    console.log('📋 Checking notifications table structure...');
    
    // Check if recipient_type column exists
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('Current columns:', columns.map(c => c.column_name));
    
    const hasRecipientType = columns.some(col => col.column_name === 'recipient_type');
    
    if (!hasRecipientType) {
      console.log('➕ Adding recipient_type column...');
      await sql`
        ALTER TABLE notifications 
        ADD COLUMN recipient_type TEXT DEFAULT 'user' NOT NULL;
      `;
      console.log('✅ Added recipient_type column');
    } else {
      console.log('✅ recipient_type column already exists');
    }
    
    // Check for other missing columns
    const requiredColumns = [
      'title_bn', 'message_bn', 'category_bn', 'is_live', 
      'is_active', 'is_public', 'action_required', 'sender'
    ];
    
    for (const colName of requiredColumns) {
      const hasColumn = columns.some(col => col.column_name === colName);
      if (!hasColumn) {
        console.log(`➕ Adding ${colName} column...`);
        
        let columnDef = 'TEXT';
        let defaultVal = "''";
        
        if (colName.startsWith('is_')) {
          columnDef = 'BOOLEAN';
          defaultVal = 'false';
        }
        
        await sql`
          ALTER TABLE notifications 
          ADD COLUMN ${sql(colName)} ${sql.unsafe(columnDef)} DEFAULT ${sql.unsafe(defaultVal)};
        `;
        console.log(`✅ Added ${colName} column`);
      }
    }
    
    // Create indexes if they don't exist
    console.log('🔍 Creating indexes...');
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type ON notifications(recipient_type);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_notifications_school_id ON notifications(school_id);`;
      console.log('✅ Indexes created');
    } catch (indexError) {
      console.log('⚠️ Index creation warning:', indexError.message);
    }
    
    // Test the table by inserting a sample notification
    console.log('🧪 Testing notifications table...');
    
    const testNotification = await sql`
      INSERT INTO notifications (
        title, title_bn, message, message_bn, type, priority, 
        category, category_bn, recipient_type, is_public, school_id
      ) VALUES (
        'System Ready', 'সিস্টেম প্রস্তুত', 
        'Notifications system is working properly', 'বিজ্ঞপ্তি সিস্টেম সঠিকভাবে কাজ করছে',
        'success', 'medium', 'System', 'সিস্টেম', 'user', true, 1
      )
      ON CONFLICT DO NOTHING
      RETURNING id;
    `;
    
    // Query existing notifications
    const notifications = await sql`
      SELECT id, title, recipient_type, is_read, created_at 
      FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 5;
    `;
    
    console.log('✅ Notifications table is working properly');
    console.log(`📊 Found ${notifications.length} notifications in the table`);
    
    if (notifications.length > 0) {
      console.log('📄 Sample notifications:');
      notifications.forEach(n => {
        console.log(`  - ${n.title} (${n.recipient_type})`);
      });
    }
    
    console.log('🎉 Notifications table setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

fixNotificationsTable();