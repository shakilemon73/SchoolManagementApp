import type { Express, Request, Response, NextFunction } from "express";
import { multiSupabaseManager } from "./multi-supabase-manager";
import { developerPortalStorage } from "./developer-portal-storage";
import { SupabaseClient } from "@supabase/supabase-js";

// Extend Request interface to include school-specific Supabase client
declare global {
  namespace Express {
    interface Request {
      schoolSupabase?: SupabaseClient;
      schoolId?: string;
      schoolInstance?: any;
    }
  }
}

/**
 * Middleware that identifies the school and sets up their Supabase client
 */
export const schoolSupabaseMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let schoolInstance = null;
    let schoolId = null;

    // Method 1: Check for API key in headers
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) {
      schoolInstance = await developerPortalStorage.getSchoolInstanceByApiKey(apiKey);
      if (schoolInstance) {
        schoolId = schoolInstance.schoolId;
      }
    }

    // Method 2: Check subdomain
    if (!schoolId) {
      const host = req.get('host');
      if (host) {
        const subdomain = host.split('.')[0];
        // Skip if it's the main domain or localhost
        if (subdomain !== 'localhost' && subdomain !== '127' && !host.includes('replit')) {
          try {
            schoolInstance = await developerPortalStorage.getSchoolInstanceBySubdomain(subdomain);
            if (schoolInstance) {
              schoolId = schoolInstance.schoolId;
            }
          } catch (error) {
            // Subdomain not found, continue without school context
          }
        }
      }
    }

    // Method 3: Check for school parameter in query/body
    if (!schoolId) {
      schoolId = req.query.schoolId as string || req.body?.schoolId;
      if (schoolId) {
        schoolInstance = await developerPortalStorage.getSchoolInstanceBySchoolId(schoolId);
      }
    }

    // If we found a school, set up their Supabase client
    if (schoolId && schoolInstance && schoolInstance.status === 'active') {
      const supabaseConfig = {
        url: schoolInstance.supabaseUrl || '',
        anonKey: schoolInstance.apiKey || '',
        serviceKey: schoolInstance.secretKey || '',
        databaseUrl: schoolInstance.databaseUrl || '',
        projectId: schoolInstance.supabaseProjectId || ''
      };

      const schoolSupabase = await multiSupabaseManager.getSchoolClient(schoolId, supabaseConfig);
      
      if (schoolSupabase) {
        req.schoolSupabase = schoolSupabase;
        req.schoolId = schoolId;
        req.schoolInstance = schoolInstance;
        
        // Add school context to logs
        console.log(`Request routed to school: ${schoolId} (${schoolInstance.name || 'Unknown'})`);
      }
    }

    next();
  } catch (error) {
    console.error('School Supabase middleware error:', error);
    next(); // Continue without school context
  }
};

/**
 * Middleware that requires a valid school context
 */
export const requireSchoolContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.schoolSupabase || !req.schoolId) {
    return res.status(400).json({ 
      error: 'School context required. Please provide a valid API key or access via school subdomain.' 
    });
  }
  next();
};

/**
 * Helper function to get school-specific database client
 */
export const getSchoolDatabase = async (schoolId: string) => {
  try {
    const schoolInstance = await developerPortalStorage.getSchoolInstanceBySchoolId(schoolId);
    if (!schoolInstance || !schoolInstance.databaseUrl) {
      throw new Error(`No database configuration found for school: ${schoolId}`);
    }

    // Return database connection string for Drizzle ORM
    return schoolInstance.databaseUrl;
  } catch (error) {
    console.error(`Failed to get database for school ${schoolId}:`, error);
    throw error;
  }
};

/**
 * Initialize all active schools' Supabase clients on server start
 */
export const initializeAllSchoolClients = async () => {
  try {
    console.log('🏫 Initializing Supabase clients for all active schools...');
    
    const schools = await developerPortalStorage.getAllSchoolInstances().then(schools => schools.filter(s => s.status === 'active'));
    let initializedCount = 0;

    for (const school of schools) {
      if (school.supabaseUrl && school.apiKey) {
        const config = {
          url: school.supabaseUrl,
          anonKey: school.apiKey,
          serviceKey: school.secretKey,
          databaseUrl: school.databaseUrl || '',
          projectId: school.supabaseProjectId || ''
        };

        const client = await multiSupabaseManager.getSchoolClient(school.schoolId, config);
        if (client) {
          initializedCount++;
        }
      }
    }

    console.log(`✓ Initialized ${initializedCount} school Supabase clients`);
  } catch (error) {
    console.error('Failed to initialize school clients:', error);
  }
};