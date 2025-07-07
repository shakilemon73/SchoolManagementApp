#!/usr/bin/env node
/**
 * Production server configuration for School Management System
 * Optimized for deployment on Render.com and other hosting platforms
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Production optimizations
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  next();
});

// Import and setup main application
async function startServer() {
  try {
    // Import the main server setup
    const { default: mainApp } = await import('./server/index.js');
    
    console.log('🚀 Production server starting...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Port: ${process.env.PORT || 5000}`);
    
  } catch (error) {
    console.error('❌ Failed to start production server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📝 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📝 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();