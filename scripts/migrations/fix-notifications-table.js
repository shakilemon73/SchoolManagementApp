#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixNotificationsTable() {
  console.log('🔧 Fixing notifications table structure...');
  
  try {
    // First, check if the table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('📋 Creating notifications table...');
      
      // Create the notifications table with all required columns
      const { error: createError } = await supabase.rpc('exec_sql', {
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
            recipient_id INTEGER REFERENCES auth.users(id),
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
          );
          
          CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
          CREATE INDEX IF NOT EXISTS idx_notifications_school_id ON notifications(school_id);
          CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
          CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type ON notifications(recipient_type);
        `
      });

      if (createError) {
        console.error('❌ Error creating table:', createError.message);
        return;
      }
    } else {
      console.log('📋 Table exists, checking for missing columns...');
      
      // Add missing columns if they don't exist
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE notifications 
          ADD COLUMN IF NOT EXISTS recipient_type TEXT DEFAULT 'user' NOT NULL,
          ADD COLUMN IF NOT EXISTS title_bn TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS message_bn TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS category_bn TEXT DEFAULT '',
          ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
          ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS action_required BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS sender TEXT,
          ADD COLUMN IF NOT EXISTS school_id INTEGER DEFAULT 1 NOT NULL;
          
          CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type ON notifications(recipient_type);
        `
      });

      if (alterError) {
        console.error('❌ Error altering table:', alterError.message);
        return;
      }
    }

    // Insert sample notifications to test
    console.log('📝 Adding sample notifications...');
    
    const { error: insertError } = await supabase
      .from('notifications')
      .insert([
        {
          title: 'Welcome to the System',
          title_bn: 'সিস্টেমে স্বাগতম',
          message: 'Your account has been successfully created.',
          message_bn: 'আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।',
          type: 'success',
          priority: 'high',
          category: 'Account',
          category_bn: 'অ্যাকাউন্ট',
          recipient_type: 'user',
          is_public: true,
          school_id: 1
        },
        {
          title: 'System Maintenance',
          title_bn: 'সিস্টেম রক্ষণাবেক্ষণ',
          message: 'Scheduled maintenance will occur tonight.',
          message_bn: 'আজ রাতে নির্ধারিত রক্ষণাবেক্ষণ হবে।',
          type: 'warning',
          priority: 'medium',
          category: 'System',
          category_bn: 'সিস্টেম',
          recipient_type: 'admin',
          is_public: false,
          school_id: 1
        }
      ]);

    if (insertError) {
      console.log('⚠️ Sample data insert error (table may already have data):', insertError.message);
    }

    console.log('✅ Notifications table structure fixed successfully!');
    
    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);

    if (testError) {
      console.error('❌ Test query failed:', testError.message);
    } else {
      console.log('✅ Test successful - found', testData?.length || 0, 'notifications');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixNotificationsTable();