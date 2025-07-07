import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { developerPortalStorage } from "./developer-portal-storage";
import * as schema from "../shared/developer-portal-schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Supabase admin client for managing school databases (optional)
let supabaseAdmin: any = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      user?: schema.PortalAdmin;
      school?: schema.SchoolInstance;
    }
  }
}

// Middleware for authentication
const authenticatePortalAdmin = async (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: number };
    const admin = await developerPortalStorage.getPortalAdmin(decoded.adminId);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive admin' });
    }

    req.user = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware for API key authentication (for school instances)
const authenticateApiKey = async (req: Request, res: Response, next: any) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const school = await developerPortalStorage.getSchoolInstanceByApiKey(apiKey);
    if (!school || school.status !== 'active') {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    req.school = school;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid API key' });
  }
};

export async function registerDeveloperPortalRoutes(app: Express): Promise<Server> {
  
  // Portal Admin Authentication
  app.post("/api/portal/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      const admin = await developerPortalStorage.getPortalAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!admin.isActive) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '24h' });
      
      // Update last login
      await developerPortalStorage.updatePortalAdmin(admin.id, { lastLogin: new Date() });

      // Log the login
      await developerPortalStorage.addAuditLog({
        adminId: admin.id,
        action: 'admin_login',
        resource: 'portal_admins',
        resourceId: admin.id.toString(),
        details: { email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create first admin (only if no admins exist)
  app.post("/api/portal/auth/setup", async (req: Request, res: Response) => {
    try {
      const existingAdmins = await developerPortalStorage.getPortalAdmin(1);
      if (existingAdmins) {
        return res.status(400).json({ error: 'Portal already set up' });
      }

      const { email, password, fullName } = req.body;
      const admin = await developerPortalStorage.createPortalAdmin({
        email,
        password,
        fullName,
        role: 'super_admin'
      });

      res.json({ message: 'Portal admin created successfully', adminId: admin.id });
    } catch (error) {
      console.error('Setup error:', error);
      res.status(500).json({ error: 'Failed to create admin' });
    }
  });

  // School Instance Management
  app.get("/api/portal/schools", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const schools = await developerPortalStorage.getAllSchoolInstances();
      res.json(schools);
    } catch (error) {
      console.error('Get schools error:', error);
      res.status(500).json({ error: 'Failed to fetch schools' });
    }
  });

  app.post("/api/portal/schools", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const schoolData = req.body;
      const school = await developerPortalStorage.createSchoolInstance(schoolData);

      // Log the creation
      await developerPortalStorage.addAuditLog({
        adminId: req.user.id,
        action: 'create_school',
        resource: 'school_instances',
        resourceId: school.id.toString(),
        details: { schoolId: school.schoolId, name: school.name },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(school);
    } catch (error) {
      console.error('Create school error:', error);
      res.status(500).json({ error: 'Failed to create school' });
    }
  });

  app.get("/api/portal/schools/:id", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const school = await developerPortalStorage.getSchoolInstance(parseInt(req.params.id));
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
      res.json(school);
    } catch (error) {
      console.error('Get school error:', error);
      res.status(500).json({ error: 'Failed to fetch school' });
    }
  });

  app.patch("/api/portal/schools/:id", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.id);
      const updates = req.body;
      
      const school = await developerPortalStorage.updateSchoolInstance(schoolId, updates);

      // Log the update
      await developerPortalStorage.addAuditLog({
        adminId: req.user.id,
        action: 'update_school',
        resource: 'school_instances',
        resourceId: schoolId.toString(),
        details: { updates },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(school);
    } catch (error) {
      console.error('Update school error:', error);
      res.status(500).json({ error: 'Failed to update school' });
    }
  });

  app.delete("/api/portal/schools/:id", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.id);
      await developerPortalStorage.deleteSchoolInstance(schoolId);

      // Log the deletion
      await developerPortalStorage.addAuditLog({
        adminId: req.user.id,
        action: 'delete_school',
        resource: 'school_instances',
        resourceId: schoolId.toString(),
        details: {},
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'School deleted successfully' });
    } catch (error) {
      console.error('Delete school error:', error);
      res.status(500).json({ error: 'Failed to delete school' });
    }
  });

  // School Credits Management
  app.get("/api/portal/schools/:id/credits", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.id);
      const credits = await developerPortalStorage.getSchoolCredits(schoolId);
      const transactions = await developerPortalStorage.getCreditTransactions(schoolId);
      
      res.json({ credits, transactions });
    } catch (error) {
      console.error('Get credits error:', error);
      res.status(500).json({ error: 'Failed to fetch credits' });
    }
  });

  app.post("/api/portal/schools/:id/credits", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.id);
      const { amount, type, description } = req.body;
      
      const transaction = await developerPortalStorage.addCreditTransaction({
        schoolInstanceId: schoolId,
        type,
        amount,
        description,
        reference: `admin_${req.user.id}`
      });

      // Log the credit transaction
      await developerPortalStorage.addAuditLog({
        adminId: req.user.id,
        action: 'manage_credits',
        resource: 'school_credits',
        resourceId: schoolId.toString(),
        details: { type, amount, description },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(transaction);
    } catch (error) {
      console.error('Add credits error:', error);
      res.status(500).json({ error: 'Failed to add credits' });
    }
  });

  // Document Templates Management
  app.get("/api/portal/templates", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const templates = await developerPortalStorage.getDocumentTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Get templates error:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  app.post("/api/portal/templates", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const templateData = { ...req.body, createdBy: req.user.id };
      const template = await developerPortalStorage.createDocumentTemplate(templateData);

      // Log template creation
      await developerPortalStorage.addAuditLog({
        adminId: req.user.id,
        action: 'create_template',
        resource: 'document_templates',
        resourceId: template.id.toString(),
        details: { name: template.name, type: template.type },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(template);
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  });

  // Template Access Management
  app.post("/api/portal/schools/:id/templates/:templateId/grant", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.id);
      const templateId = parseInt(req.params.templateId);
      
      const access = await developerPortalStorage.grantTemplateAccess({
        schoolInstanceId: schoolId,
        templateId,
        grantedBy: req.user.id,
        isEnabled: true
      });

      // Log template access grant
      await developerPortalStorage.addAuditLog({
        adminId: req.user.id,
        action: 'grant_template_access',
        resource: 'template_access',
        resourceId: `${schoolId}_${templateId}`,
        details: { schoolId, templateId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(access);
    } catch (error) {
      console.error('Grant template access error:', error);
      res.status(500).json({ error: 'Failed to grant template access' });
    }
  });

  // Feature Flags Management
  app.get("/api/portal/features", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const features = await developerPortalStorage.getFeatureFlags();
      res.json(features);
    } catch (error) {
      console.error('Get features error:', error);
      res.status(500).json({ error: 'Failed to fetch features' });
    }
  });

  app.post("/api/portal/features", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const feature = await developerPortalStorage.createFeatureFlag(req.body);
      res.status(201).json(feature);
    } catch (error) {
      console.error('Create feature error:', error);
      res.status(500).json({ error: 'Failed to create feature' });
    }
  });

  app.patch("/api/portal/schools/:id/features/:featureId", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.id);
      const featureId = parseInt(req.params.featureId);
      const { isEnabled, config } = req.body;
      
      const setting = await developerPortalStorage.updateSchoolFeatureSetting({
        schoolInstanceId: schoolId,
        featureFlagId: featureId,
        isEnabled,
        config,
        updatedBy: req.user.id
      });

      res.json(setting);
    } catch (error) {
      console.error('Update feature setting error:', error);
      res.status(500).json({ error: 'Failed to update feature setting' });
    }
  });

  // Analytics and Reporting
  app.get("/api/portal/analytics/overview", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const schools = await developerPortalStorage.getAllSchoolInstances();
      const totalSchools = schools.length;
      const activeSchools = schools.filter(s => s.status === 'active').length;
      const trialSchools = schools.filter(s => s.status === 'trial').length;
      
      res.json({
        totalSchools,
        activeSchools,
        trialSchools,
        recentSchools: schools.slice(0, 5)
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Audit Logs
  app.get("/api/portal/audit-logs", authenticatePortalAdmin, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const schoolId = req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined;
      
      const logs = await developerPortalStorage.getAuditLogs(schoolId, limit);
      res.json(logs);
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // Public API for School Instances (with API key auth)
  app.get("/api/school/info", authenticateApiKey, async (req: Request, res: Response) => {
    try {
      const school = req.school;
      const credits = await developerPortalStorage.getSchoolCredits(school.id);
      const features = await developerPortalStorage.getSchoolFeatureSettings(school.id);
      
      res.json({
        school: {
          id: school.schoolId,
          name: school.name,
          subdomain: school.subdomain,
          planType: school.planType,
          status: school.status,
          maxStudents: school.maxStudents,
          maxTeachers: school.maxTeachers,
          maxDocuments: school.maxDocuments,
          usedDocuments: school.usedDocuments
        },
        credits,
        features
      });
    } catch (error) {
      console.error('Get school info error:', error);
      res.status(500).json({ error: 'Failed to fetch school information' });
    }
  });

  app.post("/api/school/usage", authenticateApiKey, async (req: Request, res: Response) => {
    try {
      const { metric, value, metadata } = req.body;
      const school = req.school;
      
      // Record usage analytics
      await developerPortalStorage.addUsageAnalytics({
        schoolInstanceId: school.id,
        date: new Date(),
        metric,
        value,
        metadata
      });

      // If it's document generation, use credits and update count
      if (metric === 'documents_generated') {
        const credits = await developerPortalStorage.getSchoolCredits(school.id);
        if (credits && credits.availableCredits >= value) {
          await developerPortalStorage.addCreditTransaction({
            schoolInstanceId: school.id,
            type: 'usage',
            amount: value,
            description: `Document generation: ${metadata?.documentType || 'Unknown'}`,
            reference: `usage_${Date.now()}`
          });

          // Update used documents count
          await developerPortalStorage.updateSchoolInstance(school.id, {
            usedDocuments: school.usedDocuments + value
          });
        } else {
          return res.status(402).json({ error: 'Insufficient credits' });
        }
      }

      res.json({ message: 'Usage recorded successfully' });
    } catch (error) {
      console.error('Record usage error:', error);
      res.status(500).json({ error: 'Failed to record usage' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}