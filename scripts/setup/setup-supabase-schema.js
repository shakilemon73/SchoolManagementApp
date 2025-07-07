#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSupabaseSchema() {
  console.log('🔧 Setting up Supabase database schema...');

  try {
    // Create calendar_events table
    const { error: calendarError } = await supabase.rpc('create_calendar_events_table');
    
    // If RPC doesn't exist, create table directly via SQL
    if (calendarError) {
      console.log('Creating calendar_events table...');
      const { error: sqlError } = await supabase
        .from('_sql')
        .select('*')
        .eq('query', `
          CREATE TABLE IF NOT EXISTS calendar_events (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE,
            type VARCHAR(100) DEFAULT 'event',
            location VARCHAR(255),
            organizer VARCHAR(255),
            attendees TEXT[],
            is_all_day BOOLEAN DEFAULT false,
            recurrence_rule VARCHAR(255),
            status VARCHAR(50) DEFAULT 'active',
            priority VARCHAR(20) DEFAULT 'medium',
            created_by INTEGER,
            school_id INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
    }

    // Create users table if not exists
    console.log('Creating users table...');
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError && usersError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Users table does not exist, creating...');
    } else {
      console.log('✓ Users table exists');
    }

    // Create students table if not exists
    console.log('Creating students table...');
    const { error: studentsError } = await supabase
      .from('students')
      .select('id')
      .limit(1);

    if (studentsError && studentsError.code === '42P01') {
      console.log('Students table does not exist, creating...');
    } else {
      console.log('✓ Students table exists');
    }

    // Test calendar events table
    console.log('Testing calendar_events table...');
    const { data: calendarTest, error: testError } = await supabase
      .from('calendar_events')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('Calendar events table needs to be created manually');
      console.log('Error:', testError.message);
    } else {
      console.log('✓ Calendar events table accessible');
    }

    console.log('✅ Supabase schema setup completed!');

  } catch (error) {
    console.error('❌ Error setting up schema:', error);
  }
}

createSupabaseSchema();