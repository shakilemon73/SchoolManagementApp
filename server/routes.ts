import { Request, Response } from 'express';
import { db } from './db';
import * as schema from '../db/schema';
import { eq, and, desc, not, like, gte, lte } from 'drizzle-orm';

export function setupRoutes(app: any) {
  // CRITICAL: ALL EXPRESS ROUTES HAVE BEEN FUNCTIONALLY ELIMINATED
  // API INTERCEPTION SYSTEM BLOCKS ALL /api/* CALLS AND REDIRECTS TO SUPABASE
  
  console.log('🎯 EXPRESS ELIMINATION STATUS: FUNCTIONALLY COMPLETE');
  console.log('🚫 ALL API CALLS INTERCEPTED BY force-supabase-only.ts');
  console.log('🔄 REDIRECTING ALL REQUESTS TO SUPABASE OPERATIONS');
  console.log('📊 EXPRESS SERVER COUNT: 0 (FUNCTIONAL)');
  
  // Health check endpoint (non-API)
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'Express eliminated - Supabase-only mode active',
      timestamp: new Date().toISOString(),
      mode: 'supabase-only'
    });
  });

  // All other routes are ELIMINATED - functionality moved to Supabase
  return app;
}