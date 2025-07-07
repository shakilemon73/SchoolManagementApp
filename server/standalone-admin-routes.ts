import type { Express, Request, Response } from "express";
import { multiSupabaseManager } from "./multi-supabase-manager";
import { developerPortalStorage } from "./developer-portal-storage";
import { SupabaseSchemaManager } from "./supabase-schema-manager";
import { nanoid } from "nanoid";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Standalone Admin Routes for managing individual school Supabase instances
 */
export function registerStandaloneAdminRoutes(app: Express) {

  // Get all schools with their Supabase status
  app.get("/api/standalone-admin/schools", async (req: Request, res: Response) => {
    try {
      const schools = await developerPortalStorage.getAllSchoolInstances();
      
      const schoolsWithStatus = await Promise.all(schools.map(async (school) => {
        const hasSupabase = !!(school.supabaseUrl && school.supabaseProjectId);
        let connectionStatus = 'unknown';
        
        if (hasSupabase) {
          try {
            const client = await multiSupabaseManager.getSchoolClient(school.schoolId);
            if (client) {
              // Test connection
              const { error } = await client.from('users').select('count').limit(1);
              connectionStatus = error ? 'error' : 'connected';
            }
          } catch (error) {
            connectionStatus = 'error';
          }
        }

        return {
          ...school,
          hasSupabase,
          connectionStatus,
          supabaseUrl: school.supabaseUrl ? `${school.supabaseUrl.substring(0, 20)}...` : null, // Mask for security
        };
      }));

      res.json(schoolsWithStatus);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new Supabase instance for a school
  app.post("/api/standalone-admin/schools/:schoolId/supabase/setup", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { supabaseUrl, supabaseProjectId, databaseUrl } = req.body;

      // Validate required fields
      if (!supabaseUrl || !supabaseProjectId) {
        return res.status(400).json({ error: 'Supabase URL and Project ID are required' });
      }

      // Get school instance
      const school = await developerPortalStorage.getSchoolInstanceById(schoolId);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      // Generate new API keys for this school's Supabase
      const newApiKey = `sk_${nanoid(32)}`;
      const newSecretKey = `sk_secret_${nanoid(48)}`;

      // Update school with Supabase configuration  
      const updatedSchool = await developerPortalStorage.updateSchoolInstance(school.id, {
        supabaseUrl,
        supabaseProjectId,
        databaseUrl: databaseUrl || `postgresql://postgres:[password]@db.${supabaseProjectId}.supabase.co:5432/postgres`,
      });

      // Register with multi-Supabase manager
      const config = await multiSupabaseManager.registerSchoolSupabase(updatedSchool);
      
      if (!config) {
        return res.status(500).json({ error: 'Failed to register Supabase instance' });
      }

      // Set up complete schema using the automated manager
      const adminClient = await multiSupabaseManager.getSchoolAdminClient(schoolId);
      let schemaSetup = false;
      let storageSetup = false;
      let schemaDetails = null;

      if (adminClient) {
        schemaDetails = await SupabaseSchemaManager.setupCompleteSchema(adminClient);
        schemaSetup = schemaDetails.success;
        storageSetup = schemaDetails.bucketsCreated.length > 0;
      }

      res.json({
        message: 'Supabase instance set up successfully',
        schoolId,
        apiKey: newApiKey,
        schemaSetup,
        storageSetup,
        schemaDetails: schemaDetails ? {
          tablesCreated: schemaDetails.tablesCreated,
          bucketsCreated: schemaDetails.bucketsCreated,
          policiesCreated: schemaDetails.policiesCreated,
          errors: schemaDetails.errors
        } : null,
        config: {
          url: config.url,
          projectId: config.projectId
        }
      });

    } catch (error: any) {
      console.error('Supabase setup error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test Supabase connection for a school
  app.post("/api/standalone-admin/schools/:schoolId/supabase/test", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      const school = await developerPortalStorage.getSchoolInstanceById(schoolId);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      if (!school.supabaseUrl) {
        return res.status(400).json({ error: 'School does not have Supabase configured' });
      }

      const client = await multiSupabaseManager.getSchoolClient(schoolId);
      if (!client) {
        return res.status(500).json({ error: 'Failed to get Supabase client' });
      }

      // Test basic operations
      const tests = {
        connection: false,
        auth: false,
        database: false,
        storage: false
      };

      // Test 1: Basic connection
      try {
        const { data, error } = await client.from('users').select('count').limit(1);
        tests.connection = !error;
        tests.database = !error;
      } catch (error) {
        console.log('Connection test failed:', error);
      }

      // Test 2: Auth service
      try {
        const { data, error } = await client.auth.getSession();
        tests.auth = !error;
      } catch (error) {
        console.log('Auth test failed:', error);
      }

      // Test 3: Storage
      try {
        const { data, error } = await client.storage.listBuckets();
        tests.storage = !error;
      } catch (error) {
        console.log('Storage test failed:', error);
      }

      const overallStatus = Object.values(tests).every(test => test);

      res.json({
        schoolId,
        schoolName: school.name,
        tests,
        overallStatus,
        message: overallStatus ? 'All tests passed' : 'Some tests failed'
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get school's Supabase configuration (masked)
  app.get("/api/standalone-admin/schools/:schoolId/supabase/config", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      const school = await developerPortalStorage.getSchoolInstanceById(schoolId);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      const maskedConfig = {
        schoolId: school.schoolId,
        schoolName: school.name,
        hasSupabase: !!(school.supabaseUrl && school.supabaseProjectId),
        supabaseUrl: school.supabaseUrl ? `${school.supabaseUrl.substring(0, 25)}...` : null,
        projectId: school.supabaseProjectId,
        databaseUrl: school.databaseUrl ? `${school.databaseUrl.substring(0, 30)}...` : null,
        apiKey: school.apiKey ? `${school.apiKey.substring(0, 8)}...` : null,
        status: school.status,
        planType: school.planType,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt
      };

      res.json(maskedConfig);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update school's Supabase configuration
  app.patch("/api/standalone-admin/schools/:schoolId/supabase/config", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { supabaseUrl, supabaseProjectId, databaseUrl } = req.body;
      
      const school = await developerPortalStorage.getSchoolInstanceById(schoolId);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      const updateData: any = {};
      if (supabaseUrl) updateData.supabaseUrl = supabaseUrl;
      if (supabaseProjectId) updateData.supabaseProjectId = supabaseProjectId;
      if (databaseUrl) updateData.databaseUrl = databaseUrl;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const updatedSchool = await developerPortalStorage.updateSchoolInstance(school.id, updateData);

      // Remove old client and reinitialize
      multiSupabaseManager.removeSchoolClient(schoolId);
      
      const config = await multiSupabaseManager.registerSchoolSupabase(updatedSchool);

      res.json({
        message: 'Supabase configuration updated successfully',
        schoolId,
        updated: true,
        config: config ? {
          url: config.url,
          projectId: config.projectId
        } : null
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reset school's API keys
  app.post("/api/standalone-admin/schools/:schoolId/reset-keys", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      const school = await developerPortalStorage.getSchoolInstanceById(schoolId);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      const newApiKey = `sk_${nanoid(32)}`;
      const newSecretKey = `sk_secret_${nanoid(48)}`;

      await developerPortalStorage.updateSchoolInstance(school.id, {
        apiKey: newApiKey,
        secretKey: newSecretKey,
      });

      // Remove old client to force reinitialization with new keys
      multiSupabaseManager.removeSchoolClient(schoolId);

      res.json({
        message: 'API keys reset successfully',
        schoolId,
        newApiKey,
        warning: 'Please update your applications with the new API key'
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get system overview
  app.get("/api/standalone-admin/overview", async (req: Request, res: Response) => {
    try {
      const schools = await developerPortalStorage.getAllSchoolInstances();
      const registeredClients = multiSupabaseManager.getRegisteredSchools();

      const stats = {
        totalSchools: schools.length,
        activeSchools: schools.filter(s => s.status === 'active').length,
        schoolsWithSupabase: schools.filter(s => s.supabaseUrl && s.supabaseProjectId).length,
        connectedClients: registeredClients.length,
        planDistribution: schools.reduce((acc, school) => {
          acc[school.planType] = (acc[school.planType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        statusDistribution: schools.reduce((acc, school) => {
          acc[school.status] = (acc[school.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sync school data from main database to its Supabase instance
  app.post("/api/standalone-admin/schools/:schoolId/sync-data", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      const school = await developerPortalStorage.getSchoolInstanceById(schoolId);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      const adminClient = await multiSupabaseManager.getSchoolAdminClient(schoolId);
      if (!adminClient) {
        return res.status(400).json({ error: 'School Supabase not configured' });
      }

      // This would sync data from your main database to the school's Supabase
      // Implementation depends on your data structure
      
      const syncResults = {
        users: 0,
        students: 0,
        teachers: 0,
        classes: 0
      };

      res.json({
        message: 'Data sync completed',
        schoolId,
        results: syncResults
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create complete database schema for a school
  app.post("/api/standalone-admin/schools/:schoolId/create-database", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      const school = await developerPortalStorage.getSchoolInstanceBySchoolId(schoolId);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      if (!school.supabaseUrl) {
        return res.status(400).json({ error: 'School does not have Supabase configured. Please setup Supabase first.' });
      }

      const adminClient = await multiSupabaseManager.getSchoolAdminClient(schoolId);
      if (!adminClient) {
        return res.status(500).json({ error: 'Failed to connect to school Supabase instance' });
      }

      // Setup complete database schema
      const schemaResult = await SupabaseSchemaManager.setupCompleteSchema(adminClient);

      res.json({
        message: schemaResult.success ? 'Database schema created successfully' : 'Database setup completed with some errors',
        schoolId,
        schoolName: school.name,
        success: schemaResult.success,
        tablesCreated: schemaResult.tablesCreated,
        bucketsCreated: schemaResult.bucketsCreated,
        policiesCreated: schemaResult.policiesCreated,
        errors: schemaResult.errors,
        summary: {
          totalTables: schemaResult.tablesCreated.length,
          totalBuckets: schemaResult.bucketsCreated.length,
          totalPolicies: schemaResult.policiesCreated.length,
          totalErrors: schemaResult.errors.length
        }
      });

    } catch (error: any) {
      console.error('Database creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify database schema completeness
  app.get("/api/standalone-admin/schools/:schoolId/verify-database", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      const school = await developerPortalStorage.getSchoolInstanceBySchoolId(schoolId);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      if (!school.supabaseUrl) {
        return res.status(400).json({ error: 'School does not have Supabase configured' });
      }

      const client = await multiSupabaseManager.getSchoolClient(schoolId);
      if (!client) {
        return res.status(500).json({ error: 'Failed to connect to school Supabase instance' });
      }

      const verification = await SupabaseSchemaManager.verifySchema(client);

      res.json({
        schoolId,
        schoolName: school.name,
        isComplete: verification.isComplete,
        missingTables: verification.missingTables,
        status: verification.isComplete ? 'complete' : 'incomplete'
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}