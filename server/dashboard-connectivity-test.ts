import type { Express, Request, Response } from "express";
import { createClient } from '@supabase/supabase-js';

export function registerDashboardConnectivityTest(app: Express) {
  app.get('/test-dashboard-connectivity', async (req: Request, res: Response) => {
    const results = {
      timestamp: new Date().toISOString(),
      supabaseConnection: {} as any,
      databaseAccess: {} as any,
      dashboardEndpoints: {} as any,
      overallStatus: 'UNKNOWN'
    };

    try {
      // Test 1: Supabase Service Connection
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        results.supabaseConnection = { status: 'FAILED', error: 'Missing credentials' };
        results.overallStatus = 'CONFIGURATION_ERROR';
        return res.json(results);
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Test auth service
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        results.supabaseConnection = { status: 'FAILED', error: authError.message };
      } else {
        results.supabaseConnection = { 
          status: 'CONNECTED', 
          userCount: authData.users?.length || 0 
        };
      }

      // Test 2: Direct Database Access
      try {
        const { data: tableData, error: tableError } = await supabase
          .from('app_users')
          .select('id')
          .limit(1);
          
        if (tableError) {
          results.databaseAccess = { status: 'FAILED', error: tableError.message };
        } else {
          results.databaseAccess = { status: 'ACCESSIBLE' };
        }
      } catch (dbErr: any) {
        results.databaseAccess = { status: 'FAILED', error: dbErr.message };
      }

      // Test 3: Dashboard Endpoint Availability
      try {
        // Test if we can query basic tables directly via Supabase
        const studentsQuery = await supabase.from('students').select('id').limit(1);
        const teachersQuery = await supabase.from('teachers').select('id').limit(1);
        const classesQuery = await supabase.from('classes').select('id').limit(1);

        results.dashboardEndpoints = {
          studentsTable: studentsQuery.error ? 'FAILED' : 'ACCESSIBLE',
          teachersTable: teachersQuery.error ? 'FAILED' : 'ACCESSIBLE',
          classesTable: classesQuery.error ? 'FAILED' : 'ACCESSIBLE',
          errors: {
            students: studentsQuery.error?.message || null,
            teachers: teachersQuery.error?.message || null,
            classes: classesQuery.error?.message || null
          }
        };
      } catch (endpointErr: any) {
        results.dashboardEndpoints = { status: 'FAILED', error: endpointErr.message };
      }

      // Determine overall status
      const supabaseOk = results.supabaseConnection.status === 'CONNECTED';
      const databaseOk = results.databaseAccess.status === 'ACCESSIBLE';
      const tablesAccessible = results.dashboardEndpoints.studentsTable === 'ACCESSIBLE';

      if (supabaseOk && databaseOk && tablesAccessible) {
        results.overallStatus = 'FULLY_CONNECTED';
      } else if (supabaseOk && databaseOk) {
        results.overallStatus = 'PARTIALLY_CONNECTED';
      } else if (supabaseOk) {
        results.overallStatus = 'SERVICE_ONLY';
      } else {
        results.overallStatus = 'CONNECTION_FAILED';
      }

      res.json(results);

    } catch (error: any) {
      console.error('Dashboard connectivity test failed:', error);
      results.overallStatus = 'TEST_FAILED';
      res.status(500).json({ ...results, error: error.message });
    }
  });
}