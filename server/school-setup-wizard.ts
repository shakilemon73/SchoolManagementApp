import { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users, schools } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { emailService } from './email-service.js';

// School setup validation schema
const schoolSetupSchema = z.object({
  // School Information
  schoolName: z.string().min(2, 'School name is required'),
  schoolNameBangla: z.string().optional(),
  address: z.string().min(5, 'School address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid school email is required'),
  establishedYear: z.number().min(1800).max(new Date().getFullYear()),
  
  // Principal Information
  principalName: z.string().min(2, 'Principal name is required'),
  principalPhone: z.string().optional(),
  
  // Admin User Information
  adminName: z.string().min(2, 'Admin name is required'),
  adminEmail: z.string().email('Valid admin email is required'),
  adminPhone: z.string().optional(),
  
  // School Type and Settings
  schoolType: z.enum(['primary', 'secondary', 'higher_secondary', 'college', 'university']),
  totalStudents: z.number().min(1).optional(),
  totalTeachers: z.number().min(1).optional(),
  
  // Feature Preferences
  features: z.object({
    documentsEnabled: z.boolean().default(true),
    admitCardsEnabled: z.boolean().default(true),
    libraryEnabled: z.boolean().default(true),
    transportEnabled: z.boolean().default(false),
    financialEnabled: z.boolean().default(true),
    notificationsEnabled: z.boolean().default(true),
    multiLanguageSupport: z.boolean().default(true),
  }).optional(),
});

export function registerSchoolSetupWizard(app: Express) {
  // Step 1: Check if setup is needed
  app.get('/api/setup/status', async (req: Request, res: Response) => {
    try {
      // Check if there are any schools in the system
      const schoolCount = await db.select({ count: schools.id }).from(schools);
      const hasSchools = schoolCount.length > 0;
      
      // Check if there are any admin users
      const adminUsers = await db.select({ count: users.id }).from(users).where(eq(users.role, 'admin'));
      const hasAdmins = adminUsers.length > 0;
      
      const setupNeeded = !hasSchools || !hasAdmins;
      
      res.json({
        setupNeeded,
        hasSchools,
        hasAdmins,
        schoolCount: schoolCount.length,
        adminCount: adminUsers.length,
      });
    } catch (error) {
      console.error('Error checking setup status:', error);
      res.status(500).json({ error: 'Failed to check setup status' });
    }
  });

  // Step 2: Create school and admin user
  app.post('/api/setup/create-school', async (req: Request, res: Response) => {
    try {
      const validatedData = schoolSetupSchema.parse(req.body);
      
      // Check if school with this name already exists
      const existingSchool = await db.select().from(schools)
        .where(eq(schools.name, validatedData.schoolName))
        .limit(1);
      
      if (existingSchool.length > 0) {
        return res.status(400).json({ 
          error: 'A school with this name already exists',
          field: 'schoolName'
        });
      }

      // Check if admin email already exists
      const existingAdmin = await db.select().from(users)
        .where(eq(users.email, validatedData.adminEmail))
        .limit(1);
      
      if (existingAdmin.length > 0) {
        return res.status(400).json({ 
          error: 'A user with this email already exists',
          field: 'adminEmail'
        });
      }

      // Generate secure temporary password
      const tempPassword = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create school record
      const newSchool = await db.insert(schools).values({
        name: validatedData.schoolName,
        nameInBangla: validatedData.schoolNameBangla,
        address: validatedData.address,
        phone: validatedData.phone,
        email: validatedData.email,
        establishedYear: validatedData.establishedYear,
        principalName: validatedData.principalName,
        isActive: true,
        schoolType: validatedData.schoolType,
        totalStudents: validatedData.totalStudents,
        totalTeachers: validatedData.totalTeachers,
        settings: validatedData.features || {
          documentsEnabled: true,
          admitCardsEnabled: true,
          libraryEnabled: true,
          transportEnabled: false,
          financialEnabled: true,
          notificationsEnabled: true,
          multiLanguageSupport: true,
        },
      }).returning();

      // Create admin user
      const adminUser = await db.insert(users).values({
        email: validatedData.adminEmail,
        name: validatedData.adminName,
        password: hashedPassword,
        role: 'admin',
        schoolId: newSchool[0].id,
        phoneNumber: validatedData.adminPhone,
        isActive: true,
        mustChangePassword: true,
        emailVerified: false,
      }).returning();

      // Send welcome email with credentials
      const emailSent = await emailService.sendWelcomeEmail(
        validatedData.adminEmail,
        validatedData.adminName,
        validatedData.schoolName,
        tempPassword
      );

      // Prepare response (exclude sensitive data)
      const response = {
        school: {
          id: newSchool[0].id,
          name: newSchool[0].name,
          nameInBangla: newSchool[0].nameInBangla,
          address: newSchool[0].address,
          phone: newSchool[0].phone,
          email: newSchool[0].email,
          principalName: newSchool[0].principalName,
          schoolType: newSchool[0].schoolType,
        },
        admin: {
          id: adminUser[0].id,
          name: adminUser[0].name,
          email: adminUser[0].email,
          role: adminUser[0].role,
        },
        credentials: {
          email: validatedData.adminEmail,
          temporaryPassword: tempPassword,
          emailSent,
        },
        nextSteps: [
          'Login with the provided credentials',
          'Change your password immediately',
          'Complete school profile setup',
          'Add teachers and students',
          'Configure document templates',
        ],
      };

      res.status(201).json({
        success: true,
        message: 'School setup completed successfully!',
        data: response,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        });
      }
      console.error('Error creating school:', error);
      res.status(500).json({ 
        error: 'Failed to create school',
        message: 'An unexpected error occurred during school setup'
      });
    }
  });

  // Step 3: Validate school setup
  app.post('/api/setup/validate', async (req: Request, res: Response) => {
    try {
      const { schoolName, adminEmail } = req.body;
      
      if (!schoolName || !adminEmail) {
        return res.status(400).json({ 
          error: 'School name and admin email are required' 
        });
      }

      // Check if school name is available
      const existingSchool = await db.select().from(schools)
        .where(eq(schools.name, schoolName))
        .limit(1);
      
      const schoolAvailable = existingSchool.length === 0;

      // Check if admin email is available
      const existingUser = await db.select().from(users)
        .where(eq(users.email, adminEmail))
        .limit(1);
      
      const emailAvailable = existingUser.length === 0;

      res.json({
        schoolName: {
          value: schoolName,
          available: schoolAvailable,
          message: schoolAvailable ? 'School name is available' : 'School name already exists'
        },
        adminEmail: {
          value: adminEmail,
          available: emailAvailable,
          message: emailAvailable ? 'Email is available' : 'Email already in use'
        },
        valid: schoolAvailable && emailAvailable,
      });

    } catch (error) {
      console.error('Error validating setup:', error);
      res.status(500).json({ error: 'Failed to validate setup data' });
    }
  });

  // Step 4: Get school setup progress
  app.get('/api/setup/progress/:schoolId', async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
      // Get school details
      const school = await db.select().from(schools)
        .where(eq(schools.id, parseInt(schoolId)))
        .limit(1);
      
      if (school.length === 0) {
        return res.status(404).json({ error: 'School not found' });
      }

      // Count users by role
      const userCounts = await db.select({
        role: users.role,
        count: users.id,
      }).from(users).where(eq(users.schoolId, parseInt(schoolId)));

      const progress = {
        school: school[0],
        users: {
          admin: userCounts.filter(u => u.role === 'admin').length,
          teacher: userCounts.filter(u => u.role === 'teacher').length,
          student: userCounts.filter(u => u.role === 'student').length,
          parent: userCounts.filter(u => u.role === 'parent').length,
        },
        setupComplete: userCounts.length > 1, // More than just the admin
        recommendations: generateSetupRecommendations(userCounts),
      };

      res.json(progress);

    } catch (error) {
      console.error('Error fetching setup progress:', error);
      res.status(500).json({ error: 'Failed to fetch setup progress' });
    }
  });
}

// Helper function to generate secure password
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill remaining length with random characters
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Helper function to generate setup recommendations
function generateSetupRecommendations(userCounts: any[]): string[] {
  const recommendations = [];
  
  const adminCount = userCounts.filter(u => u.role === 'admin').length;
  const teacherCount = userCounts.filter(u => u.role === 'teacher').length;
  const studentCount = userCounts.filter(u => u.role === 'student').length;
  
  if (adminCount === 0) {
    recommendations.push('Create at least one admin user');
  }
  
  if (teacherCount === 0) {
    recommendations.push('Add teachers to manage classes and students');
  }
  
  if (studentCount === 0) {
    recommendations.push('Import or add student records');
  }
  
  if (teacherCount > 0 && studentCount === 0) {
    recommendations.push('Add students to start using the system effectively');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Setup is complete! Your school is ready to use EduBD Pro');
  }
  
  return recommendations;
}