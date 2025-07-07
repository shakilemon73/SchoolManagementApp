#!/usr/bin/env node

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Use the correct Supabase connection string
const databaseUrl = "postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1
});

async function createTables() {
  try {
    console.log('🔧 Creating Supabase database tables...');

    // Create calendar_events table
    await sql`
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
      )
    `;
    console.log('✓ calendar_events table created');

    // Create users table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        school_id INTEGER,
        student_id INTEGER,
        credits INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        phone_number VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ users table created');

    // Create students table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        student_id VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        class VARCHAR(50),
        section VARCHAR(10),
        roll_number VARCHAR(20),
        date_of_birth DATE,
        address TEXT,
        guardian_name VARCHAR(255),
        guardian_phone VARCHAR(20),
        admission_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        school_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ students table created');

    // Insert sample calendar events
    await sql`
      INSERT INTO calendar_events (title, description, start_date, end_date, type, location, organizer)
      VALUES 
        ('School Assembly', 'Weekly school assembly', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'assembly', 'Main Hall', 'Principal'),
        ('Parent Meeting', 'Monthly parent-teacher meeting', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '2 hours', 'meeting', 'Conference Room', 'Class Teacher'),
        ('Sports Day', 'Annual sports competition', NOW() + INTERVAL '2 weeks', NOW() + INTERVAL '2 weeks' + INTERVAL '6 hours', 'event', 'Sports Ground', 'Sports Committee')
      ON CONFLICT DO NOTHING
    `;
    console.log('✓ Sample calendar events added');

    // Insert sample user
    await sql`
      INSERT INTO users (name, username, email, password_hash, role)
      VALUES ('Admin User', 'admin', 'admin@school.edu', '$2b$10$vI3GbFwGG3kRCZa4/eAJhe7QFKzxgvVBGUGwG7QsKKK3nFJp4fQQG', 'admin')
      ON CONFLICT (username) DO NOTHING
    `;
    console.log('✓ Admin user created');

    // Test the tables
    const calendarCount = await sql`SELECT COUNT(*) FROM calendar_events`;
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    const studentCount = await sql`SELECT COUNT(*) FROM students`;

    console.log(`✓ Tables verified - ${calendarCount[0].count} calendar events, ${userCount[0].count} users, ${studentCount[0].count} students`);
    console.log('✅ Supabase database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await sql.end();
  }
}

createTables();