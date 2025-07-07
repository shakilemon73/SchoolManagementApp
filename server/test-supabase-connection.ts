import { Express, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

export function registerTestSupabaseConnection(app: Express) {
  // Direct Supabase connection test (no auth required)
  app.get('/test-supabase', async (req: Request, res: Response) => {
    try {
      console.log('=== Testing Supabase Connection ===');
      
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      
      console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
      console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing');
      
      if (!supabaseUrl || !supabaseKey) {
        return res.json({
          status: 'error',
          message: 'Missing Supabase credentials',
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey
        });
      }
      
      // Create direct Supabase client
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test basic connection
      console.log('Testing basic Supabase connectivity...');
      
      // Test 1: List tables (this should work with any valid connection)
      const { data: tables, error: tablesError } = await supabase
        .from('document_templates')
        .select('id, name, category')
        .limit(5);
      
      console.log('Tables test result:', { tables, tablesError });
      
      // Test 2: Check if document_templates table exists and has data
      const { count, error: countError } = await supabase
        .from('document_templates')
        .select('*', { count: 'exact', head: true });
      
      console.log('Count test result:', { count, countError });
      
      const connectionStatus = {
        status: 'success',
        message: 'Document dashboard Supabase connection verified',
        tests: {
          credentialsAvailable: true,
          basicConnection: !tablesError,
          documentTemplatesTable: !countError,
          dataCount: count || 0,
          sampleData: tables || []
        },
        errors: {
          tablesError: tablesError?.message || null,
          countError: countError?.message || null
        }
      };
      
      console.log('=== Connection Status ===', connectionStatus);
      
      res.json(connectionStatus);
      
    } catch (error: any) {
      console.error('Supabase test failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Supabase connection test failed',
        error: error.message
      });
    }
  });
}