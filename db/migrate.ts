import { db } from './index';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Starting migration...');
  
  try {
    // Create credit packages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS credit_packages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        credits INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP
      )
    `);
    console.log('Created credit_packages table');

    // Create credit transactions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        package_id INTEGER REFERENCES credit_packages(id),
        amount DECIMAL(10, 2) NOT NULL,
        credits INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_id TEXT,
        payment_number TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP
      )
    `);
    console.log('Created credit_transactions table');

    // Create credit usage logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS credit_usage_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        feature TEXT NOT NULL,
        credits INTEGER NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('Created credit_usage_logs table');

    // Update users table to add credits column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
    `);
    console.log('Updated users table');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate().catch(console.error);