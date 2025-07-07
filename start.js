#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('🚀 Starting School Management System in production mode...');

// Set production environment
process.env.NODE_ENV = 'production';

try {
  // Start the server
  execSync('tsx server/index.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Server failed to start:', error.message);
  process.exit(1);
}