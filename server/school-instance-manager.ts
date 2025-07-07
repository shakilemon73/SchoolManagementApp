import { Express, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { db } from "./db";
import { schoolInstances, schoolSubscriptions } from "../shared/schema";
import { eq } from "drizzle-orm";

interface SchoolConfig {
  schoolId: string;
  name: string;
  name_bn: string;
  domain: string;
  customDomain?: string;
  timezone: string;
  language: string;
  subscriptionPlan: string;
  status: string;
  createdAt: string;
  trialEndsAt?: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  billing?: {
    lastPayment: string;
    nextBilling: string;
    amount: number;
    currency: string;
  };
  settings: {
    totalStudents?: number;
    totalTeachers?: number;
    grades?: string[];
  };
}

interface SchoolFeatures {
  [key: string]: {
    enabled: boolean;
    limits?: any;
  };
}

class SchoolInstanceManager {
  private static schoolsDirectory = path.join(process.cwd(), "schools");
  
  static async getAllSchools(): Promise<SchoolConfig[]> {
    try {
      const schoolDirs = await fs.readdir(this.schoolsDirectory);
      const schools: SchoolConfig[] = [];
      
      for (const dir of schoolDirs) {
        if (dir === "template" || dir === "README.md") continue;
        
        try {
          const configPath = path.join(this.schoolsDirectory, dir, "config.json");
          const configData = await fs.readFile(configPath, "utf-8");
          const school = JSON.parse(configData) as SchoolConfig;
          schools.push(school);
        } catch (error) {
          console.error(`Error reading config for school ${dir}:`, error);
        }
      }
      
      return schools.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error getting all schools:", error);
      return [];
    }
  }
  
  static async getSchoolById(schoolId: string): Promise<SchoolConfig | null> {
    try {
      const configPath = path.join(this.schoolsDirectory, schoolId, "config.json");
      const configData = await fs.readFile(configPath, "utf-8");
      return JSON.parse(configData) as SchoolConfig;
    } catch (error) {
      return null;
    }
  }
  
  static async getSchoolFeatures(schoolId: string): Promise<SchoolFeatures | null> {
    try {
      const featuresPath = path.join(this.schoolsDirectory, schoolId, "features.json");
      const featuresData = await fs.readFile(featuresPath, "utf-8");
      return JSON.parse(featuresData) as SchoolFeatures;
    } catch (error) {
      return null;
    }
  }
  
  static async updateSchoolStatus(schoolId: string, status: string): Promise<boolean> {
    try {
      const school = await this.getSchoolById(schoolId);
      if (!school) return false;
      
      school.status = status;
      
      const configPath = path.join(this.schoolsDirectory, schoolId, "config.json");
      await fs.writeFile(configPath, JSON.stringify(school, null, 2));
      
      return true;
    } catch (error) {
      console.error(`Error updating school ${schoolId} status:`, error);
      return false;
    }
  }
  
  static async createSchoolInstance(schoolData: Partial<SchoolConfig>): Promise<string | null> {
    try {
      const schoolId = `school-${Date.now()}`;
      const schoolDir = path.join(this.schoolsDirectory, schoolId);
      
      // Create school directory
      await fs.mkdir(schoolDir, { recursive: true });
      
      // Copy template configuration
      const templateConfig = path.join(this.schoolsDirectory, "template", "config.json");
      const templateData = await fs.readFile(templateConfig, "utf-8");
      const template = JSON.parse(templateData);
      
      // Merge with provided data
      const schoolConfig: SchoolConfig = {
        ...template,
        ...schoolData,
        schoolId,
        domain: `${schoolId}.yourplatform.com`,
        createdAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        status: "trial"
      };
      
      // Save configuration
      const configPath = path.join(schoolDir, "config.json");
      await fs.writeFile(configPath, JSON.stringify(schoolConfig, null, 2));
      
      // Copy default features
      const templateFeatures = path.join(this.schoolsDirectory, "template", "features.json");
      const defaultFeatures = path.join(schoolDir, "features.json");
      
      try {
        await fs.copyFile(templateFeatures, defaultFeatures);
      } catch {
        // Create basic features if template doesn't exist
        const basicFeatures = {
          documentGeneration: { enabled: true, limits: { monthlyDocuments: 100 } },
          libraryManagement: { enabled: true, limits: { maxBooks: 500 } },
          parentPortal: { enabled: true, limits: { maxParents: 200 } }
        };
        await fs.writeFile(defaultFeatures, JSON.stringify(basicFeatures, null, 2));
      }
      
      return schoolId;
    } catch (error) {
      console.error("Error creating school instance:", error);
      return null;
    }
  }
  
  static async getSchoolStats(schoolId: string) {
    const school = await this.getSchoolById(schoolId);
    const features = await this.getSchoolFeatures(schoolId);
    
    if (!school) return null;
    
    return {
      id: school.schoolId,
      name: school.name,
      status: school.status,
      plan: school.subscriptionPlan,
      students: school.settings?.totalStudents || 0,
      teachers: school.settings?.totalTeachers || 0,
      enabledFeatures: features ? Object.keys(features).filter(key => features[key].enabled).length : 0,
      createdAt: school.createdAt,
      trialEndsAt: school.trialEndsAt,
      billing: school.billing
    };
  }
}

export function registerSchoolInstanceRoutes(app: Express) {
  // Get all schools for provider dashboard
  app.get("/api/provider/schools", async (req: Request, res: Response) => {
    try {
      const schools = await SchoolInstanceManager.getAllSchools();
      const schoolStats = await Promise.all(
        schools.map(school => SchoolInstanceManager.getSchoolStats(school.schoolId))
      );
      
      res.json({
        success: true,
        schools: schoolStats.filter(Boolean),
        total: schoolStats.length
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch schools" });
    }
  });
  
  // Get specific school details
  app.get("/api/provider/schools/:schoolId", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const school = await SchoolInstanceManager.getSchoolById(schoolId);
      const features = await SchoolInstanceManager.getSchoolFeatures(schoolId);
      
      if (!school) {
        return res.status(404).json({ success: false, error: "School not found" });
      }
      
      res.json({
        success: true,
        school,
        features
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch school details" });
    }
  });
  
  // Update school status (suspend, activate, etc.)
  app.patch("/api/provider/schools/:schoolId/status", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { status } = req.body;
      
      const success = await SchoolInstanceManager.updateSchoolStatus(schoolId, status);
      
      if (!success) {
        return res.status(404).json({ success: false, error: "School not found" });
      }
      
      res.json({ success: true, message: `School status updated to ${status}` });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update school status" });
    }
  });
  
  // Create new school instance
  app.post("/api/provider/schools", async (req: Request, res: Response) => {
    try {
      const schoolData = req.body;
      const schoolId = await SchoolInstanceManager.createSchoolInstance(schoolData);
      
      if (!schoolId) {
        return res.status(500).json({ success: false, error: "Failed to create school" });
      }
      
      const school = await SchoolInstanceManager.getSchoolStats(schoolId);
      res.json({ success: true, school });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to create school" });
    }
  });
  
  // Get provider dashboard overview
  app.get("/api/provider/overview", async (req: Request, res: Response) => {
    try {
      const schools = await SchoolInstanceManager.getAllSchools();
      
      const overview = {
        totalSchools: schools.length,
        activeSchools: schools.filter(s => s.status === "active").length,
        trialSchools: schools.filter(s => s.status === "trial").length,
        suspendedSchools: schools.filter(s => s.status === "suspended").length,
        totalStudents: schools.reduce((sum, s) => sum + (s.settings?.totalStudents || 0), 0),
        totalTeachers: schools.reduce((sum, s) => sum + (s.settings?.totalTeachers || 0), 0),
        monthlyRevenue: schools
          .filter(s => s.status === "active" && s.billing)
          .reduce((sum, s) => sum + (s.billing?.amount || 0), 0),
        recentSchools: schools.slice(0, 5)
      };
      
      res.json({ success: true, overview });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch overview" });
    }
  });
}

export { SchoolInstanceManager };