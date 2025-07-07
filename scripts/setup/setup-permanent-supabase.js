#!/usr/bin/env node

// Permanent Supabase setup script
// This will configure your app to use Supabase as the primary database

import fs from 'fs';
import path from 'path';

console.log('Setting up permanent Supabase configuration...');

// Update environment configuration
const envExample = `# Supabase Configuration (Required)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_database_connection_string

# Session Configuration
SESSION_SECRET=your_session_secret_key

# Development
NODE_ENV=development
`;

fs.writeFileSync('.env.example', envExample);

// Create deployment configuration
const deployConfig = {
  "name": "school-management-system",
  "description": "Complete school management application with Supabase",
  "env": {
    "SUPABASE_URL": {
      "description": "Your Supabase project URL",
      "required": true
    },
    "SUPABASE_ANON_KEY": {
      "description": "Your Supabase anonymous key", 
      "required": true
    },
    "DATABASE_URL": {
      "description": "Your Supabase database connection string",
      "required": true
    },
    "SESSION_SECRET": {
      "description": "Secret key for session management",
      "generator": "secret"
    }
  },
  "build": {
    "commands": [
      "npm install",
      "npm run db:push"
    ]
  },
  "run": {
    "command": "npm start"
  }
};

fs.writeFileSync('deploy.json', JSON.stringify(deployConfig, null, 2));

// Update package.json scripts for production
const packagePath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  "start": "tsx server/index.ts",
  "build": "npm run db:push",
  "db:migrate": "tsx server/migrate-to-supabase.ts",
  "setup:supabase": "node setup-permanent-supabase.js"
};

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

console.log('✓ Created .env.example with required variables');
console.log('✓ Created deploy.json for hosting platforms');
console.log('✓ Updated package.json scripts');
console.log('\nNext steps:');
console.log('1. Copy your Supabase database URL to DATABASE_URL');
console.log('2. Run: npm run db:migrate (to transfer current data)');
console.log('3. Deploy with your preferred hosting platform');