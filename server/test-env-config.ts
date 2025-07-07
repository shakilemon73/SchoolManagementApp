import type { Express, Request, Response } from "express";
import { createClient } from '@supabase/supabase-js';
import { sql } from 'drizzle-orm';

export function registerEnvironmentTest(app: Express) {
  app.get('/api/test-env-config', async (req: Request, res: Response) => {
    try {
      const envCheck = {
        server: {
          DATABASE_URL: process.env.DATABASE_URL ? 'Found' : 'Missing',
          SUPABASE_URL: process.env.SUPABASE_URL ? 'Found' : 'Missing',
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Found' : 'Missing',
          SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'Found' : 'Missing',
          NODE_ENV: process.env.NODE_ENV || 'undefined'
        },
        client: {
          VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'Found' : 'Missing',
          VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Missing'
        },
        tests: {
          databaseConnection: 'Not tested',
          supabaseAuth: 'Not tested',
          supabaseStorage: 'Not tested'
        }
      };

      // Test database connection
      try {
        const { db } = await import('../db');
        // Test with a simple query that should work regardless of schema
        const { sql } = await import('drizzle-orm');
        const result = await db.execute(sql`SELECT 1 as test`);
        envCheck.tests.databaseConnection = 'Success';
      } catch (error: any) {
        envCheck.tests.databaseConnection = `Failed: ${error.message}`;
      }

      // Test Supabase authentication
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        try {
          const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
          );
          const { data, error } = await supabase.auth.getSession();
          envCheck.tests.supabaseAuth = error ? `Failed: ${error.message}` : 'Success';
        } catch (error: any) {
          envCheck.tests.supabaseAuth = `Failed: ${error.message}`;
        }
      }

      // Test Supabase storage
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
        try {
          const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
          );
          const { data, error } = await supabase.storage.listBuckets();
          envCheck.tests.supabaseStorage = error ? `Failed: ${error.message}` : 'Success';
        } catch (error: any) {
          envCheck.tests.supabaseStorage = `Failed: ${error.message}`;
        }
      }

      res.json({
        message: 'Environment configuration test completed',
        timestamp: new Date().toISOString(),
        ...envCheck
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Environment test failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}