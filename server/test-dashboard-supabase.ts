import type { Express, Request, Response } from "express";
import { createClient } from '@supabase/supabase-js';
import { db } from "./db";
import * as schema from "@shared/schema";
import { count, sql } from "drizzle-orm";

export function registerDashboardSupabaseTest(app: Express) {
  app.get('/api/test/dashboard-supabase', async (req: Request, res: Response) => {
    const testResults: any = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.SUPABASE_URL ? 'Found' : 'Missing',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ? 'Found' : 'Missing',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? 'Found' : 'Missing',
        databaseUrl: process.env.DATABASE_URL ? 'Found' : 'Missing'
      },
      tests: {},
      summary: {}
    };

    try {
      // Test 1: Basic Supabase Client Connection
      console.log('Testing Supabase client connection...');
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        testResults.tests.clientConnection = {
          status: 'FAILED',
          error: 'Missing Supabase credentials'
        };
        return res.json(testResults);
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      testResults.tests.clientConnection = { status: 'PASSED' };

      // Test 2: Supabase Auth Service
      console.log('Testing Supabase auth service...');
      try {
        const { data: users, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
          testResults.tests.authService = {
            status: 'FAILED',
            error: authError.message
          };
        } else {
          testResults.tests.authService = {
            status: 'PASSED',
            userCount: users.users?.length || 0
          };
        }
      } catch (authErr: any) {
        testResults.tests.authService = {
          status: 'FAILED',
          error: authErr.message
        };
      }

      // Test 3: Database Tables Access
      console.log('Testing database table access...');
      try {
        const { data: tableData, error: tableError } = await supabase
          .from('users')
          .select('id')
          .limit(1);
          
        if (tableError) {
          testResults.tests.databaseTables = {
            status: 'FAILED',
            error: tableError.message
          };
        } else {
          testResults.tests.databaseTables = {
            status: 'PASSED',
            canAccessUsers: true
          };
        }
      } catch (dbErr: any) {
        testResults.tests.databaseTables = {
          status: 'FAILED',
          error: dbErr.message
        };
      }

      // Test 4: Drizzle ORM Connection
      console.log('Testing Drizzle ORM connection...');
      try {
        const studentsCount = await db.select().from(schema.students).limit(1);
        testResults.tests.drizzleORM = {
          status: 'PASSED',
          canQueryStudents: true
        };
      } catch (drizzleErr: any) {
        testResults.tests.drizzleORM = {
          status: 'FAILED',
          error: drizzleErr.message
        };
      }

      // Test 5: Dashboard Data Queries
      console.log('Testing dashboard data queries...');
      try {
        // Test the same queries used in dashboard
        const [studentsCount] = await db.select({ count: count() }).from(schema.students);
        const [teachersCount] = await db.select({ count: count() }).from(schema.teachers);
        const [classesCount] = await db.select({ count: count() }).from(schema.classes);

        testResults.tests.dashboardQueries = {
          status: 'PASSED',
          data: {
            students: studentsCount?.count || 0,
            teachers: teachersCount?.count || 0,
            classes: classesCount?.count || 0
          }
        };
      } catch (queryErr: any) {
        testResults.tests.dashboardQueries = {
          status: 'FAILED',
          error: queryErr.message
        };
      }

      // Test 6: Real-time Features
      console.log('Testing real-time capabilities...');
      try {
        const channel = supabase.channel('test-channel');
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Real-time connection timeout'));
          }, 5000);

          channel.subscribe((status) => {
            clearTimeout(timeout);
            if (status === 'SUBSCRIBED') {
              resolve(status);
            } else {
              reject(new Error(`Subscription failed: ${status}`));
            }
          });
        });

        await supabase.removeChannel(channel);
        testResults.tests.realtimeFeatures = { status: 'PASSED' };
      } catch (realtimeErr: any) {
        testResults.tests.realtimeFeatures = {
          status: 'FAILED',
          error: realtimeErr.message
        };
      }

      // Test 7: Storage Access
      console.log('Testing storage access...');
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        if (storageError) {
          testResults.tests.storageAccess = {
            status: 'FAILED',
            error: storageError.message
          };
        } else {
          testResults.tests.storageAccess = {
            status: 'PASSED',
            bucketsCount: buckets?.length || 0,
            buckets: buckets?.map(b => b.name) || []
          };
        }
      } catch (storageErr: any) {
        testResults.tests.storageAccess = {
          status: 'FAILED',
          error: storageErr.message
        };
      }

      // Calculate overall status
      const allTests = Object.values(testResults.tests);
      const passedTests = allTests.filter((test: any) => test.status === 'PASSED').length;
      const totalTests = allTests.length;
      
      testResults.summary = {
        overallStatus: passedTests === totalTests ? 'FULLY_CONNECTED' : 'PARTIAL_CONNECTION',
        passedTests,
        totalTests,
        successRate: `${Math.round((passedTests / totalTests) * 100)}%`
      };

      console.log(`Dashboard Supabase Test Complete: ${testResults.summary.successRate} success rate`);
      res.json(testResults);

    } catch (error: any) {
      console.error('Dashboard Supabase test failed:', error);
      testResults.tests.generalError = {
        status: 'FAILED',
        error: error.message
      };
      testResults.summary = {
        overallStatus: 'CONNECTION_FAILED',
        passedTests: 0,
        totalTests: 1,
        successRate: '0%'
      };
      res.status(500).json(testResults);
    }
  });
}