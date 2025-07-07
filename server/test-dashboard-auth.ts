import type { Express, Request, Response } from "express";
import { createClient } from '@supabase/supabase-js';

export function registerDashboardAuthTest(app: Express) {
  app.get('/test-dashboard-auth', async (req: Request, res: Response) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Create a test user for dashboard authentication
      const testEmail = 'test@school.com';
      const testPassword = 'test123456';

      // First, try to create a test user
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Test Admin',
          role: 'admin'
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.error('Failed to create test user:', signUpError);
        return res.json({
          status: 'FAILED',
          error: signUpError.message,
          step: 'user_creation'
        });
      }

      // Now try to sign in as this user to get a valid session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInError) {
        return res.json({
          status: 'FAILED',
          error: signInError.message,
          step: 'user_signin'
        });
      }

      const session = signInData.session;
      if (!session) {
        return res.json({
          status: 'FAILED',
          error: 'No session returned from sign in',
          step: 'session_check'
        });
      }

      // Test the dashboard endpoints with the valid session token
      const testResults = {
        userCreation: 'SUCCESS',
        sessionGeneration: 'SUCCESS',
        accessToken: session.access_token ? 'GENERATED' : 'MISSING',
        dashboardEndpoints: {} as any
      };

      // Test dashboard stats endpoint
      try {
        const statsResponse = await fetch(`http://localhost:5000/api/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          testResults.dashboardEndpoints.stats = {
            status: 'SUCCESS',
            data: statsData
          };
        } else {
          testResults.dashboardEndpoints.stats = {
            status: 'FAILED',
            error: `${statsResponse.status}: ${statsResponse.statusText}`
          };
        }
      } catch (statsError: any) {
        testResults.dashboardEndpoints.stats = {
          status: 'FAILED',
          error: statsError.message
        };
      }

      // Test dashboard activities endpoint
      try {
        const activitiesResponse = await fetch(`http://localhost:5000/api/dashboard/activities`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          testResults.dashboardEndpoints.activities = {
            status: 'SUCCESS',
            data: activitiesData
          };
        } else {
          testResults.dashboardEndpoints.activities = {
            status: 'FAILED',
            error: `${activitiesResponse.status}: ${activitiesResponse.statusText}`
          };
        }
      } catch (activitiesError: any) {
        testResults.dashboardEndpoints.activities = {
          status: 'FAILED',
          error: activitiesError.message
        };
      }

      // Test dashboard documents endpoint
      try {
        const documentsResponse = await fetch(`http://localhost:5000/api/dashboard/documents`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json();
          testResults.dashboardEndpoints.documents = {
            status: 'SUCCESS',
            data: documentsData
          };
        } else {
          testResults.dashboardEndpoints.documents = {
            status: 'FAILED',
            error: `${documentsResponse.status}: ${documentsResponse.statusText}`
          };
        }
      } catch (documentsError: any) {
        testResults.dashboardEndpoints.documents = {
          status: 'FAILED',
          error: documentsError.message
        };
      }

      // Generate test credentials for frontend
      const frontendTestData = {
        testCredentials: {
          email: testEmail,
          password: testPassword,
          accessToken: session.access_token
        },
        instructions: `
To test dashboard in frontend:
1. Go to login page
2. Use email: ${testEmail}
3. Use password: ${testPassword}
4. Dashboard should now load with real data
        `
      };

      res.json({
        status: 'SUCCESS',
        testResults,
        frontendTestData,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Dashboard auth test failed:', error);
      res.status(500).json({
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}