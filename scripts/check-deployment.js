#!/usr/bin/env node
/**
 * Deployment Health Check Script
 * Verifies the application is ready for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Running deployment health check...\n');

const checks = {
  'Environment Variables': checkEnvironmentVariables,
  'Build Files': checkBuildFiles,
  'Dependencies': checkDependencies,
  'Database Configuration': checkDatabaseConfig,
  'Frontend Configuration': checkFrontendConfig
};

let allChecksPassed = true;

for (const [checkName, checkFunction] of Object.entries(checks)) {
  try {
    const result = checkFunction();
    console.log(`✅ ${checkName}: ${result}`);
  } catch (error) {
    console.log(`❌ ${checkName}: ${error.message}`);
    allChecksPassed = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('🎉 All deployment checks passed!');
  console.log('✅ Application is ready for production deployment');
  process.exit(0);
} else {
  console.log('⚠️  Some deployment checks failed');
  console.log('❌ Please fix the issues above before deploying');
  process.exit(1);
}

function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SESSION_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  return 'All required environment variables are set';
}

function checkBuildFiles() {
  const buildPath = path.resolve(__dirname, '..', 'dist', 'public');
  const indexPath = path.resolve(buildPath, 'index.html');
  
  if (!fs.existsSync(buildPath)) {
    throw new Error('Build directory does not exist. Run: npm run build');
  }
  
  if (!fs.existsSync(indexPath)) {
    throw new Error('index.html not found in build directory');
  }
  
  return 'Build files are present and valid';
}

function checkDependencies() {
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  const packageLockPath = path.resolve(__dirname, '..', 'package-lock.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }
  
  if (!fs.existsSync(packageLockPath)) {
    throw new Error('package-lock.json not found. Run: npm install');
  }
  
  return 'Dependencies are properly configured';
}

function checkDatabaseConfig() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  
  if (!dbUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }
  
  return 'Database configuration is valid';
}

function checkFrontendConfig() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Frontend Supabase configuration missing (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
  }
  
  return 'Frontend configuration is valid';
}