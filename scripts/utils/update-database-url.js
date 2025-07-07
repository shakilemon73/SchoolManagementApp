#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Extract Supabase project details from URL
const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!urlMatch) {
  console.error('Invalid Supabase URL format');
  process.exit(1);
}

const projectId = urlMatch[1];

// Construct the PostgreSQL connection string for Supabase
const supabaseDbUrl = `postgresql://postgres.${projectId}:[YOUR_DB_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;

console.log('Current DATABASE_URL points to Neon database');
console.log('Supabase URL:', supabaseUrl);
console.log('Expected database URL format:', supabaseDbUrl.replace('[YOUR_DB_PASSWORD]', '[PASSWORD]'));

// Read current .env file
let envContent = '';
try {
  envContent = fs.readFileSync('.env', 'utf8');
} catch (error) {
  console.log('No .env file found, creating new one');
}

// The DATABASE_URL provided in secrets should be the correct Supabase URL
console.log('Using DATABASE_URL from environment secrets');
console.log('Current DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 50) + '...');

// Check if the DATABASE_URL is pointing to Supabase
if (process.env.DATABASE_URL?.includes('supabase.com')) {
  console.log('✅ DATABASE_URL is already configured for Supabase');
} else {
  console.log('⚠️  DATABASE_URL is not pointing to Supabase');
  console.log('The DATABASE_URL secret needs to be updated to use Supabase PostgreSQL connection string');
}