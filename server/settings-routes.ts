import { Express, Request, Response } from 'express';
import { db } from '@db/index';
import { eq, and } from 'drizzle-orm';
import { 
  schoolSettings, 
  adminSettings, 
  pricingPlans, 
  users,
  schoolSettingsInsertSchema,
  adminSettingsInsertSchema,
  pricingPlansInsertSchema,
  SchoolSettings,
  AdminSettings,
  PricingPlan
} from '@shared/schema';
import bcrypt from 'bcryptjs';

// Middleware to require authentication
const requireAuth = async (req: Request, res: Response, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to require admin role
const requireAdmin = async (req: Request, res: Response, next: any) => {
  if (!req.session?.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export function registerSettingsRoutes(app: Express) {
  
  // ==================== School Settings Routes ====================
  
  // Public test endpoint for school settings (no auth)
  app.get('/api/public/school/settings', async (req: Request, res: Response) => {
    console.log('[SETTINGS] Public school settings endpoint called');
    try {
      console.log('[SETTINGS] Querying school_settings table...');
      const settings = await db.select().from(schoolSettings).limit(1);
      console.log('[SETTINGS] Query result:', settings.length > 0 ? 'Data found' : 'No data');
      
      if (settings.length === 0) {
        console.log('[SETTINGS] No settings found, returning empty response');
        return res.json({ 
          message: 'No settings found',
          hasData: false,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('[SETTINGS] Returning settings data');
      res.json({
        success: true,
        data: settings[0],
        hasData: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[SETTINGS] Error fetching school settings:', error);
      res.status(500).json({ 
        error: 'Failed to fetch settings',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Public test endpoint for updating school settings (CRUD test)
  app.post('/api/public/school/settings/update', async (req: Request, res: Response) => {
    console.log('[SETTINGS] Public school settings update endpoint called');
    try {
      const updates = req.body;
      console.log('[SETTINGS] Received updates:', Object.keys(updates));
      
      // Get existing settings
      const existingSettings = await db.select().from(schoolSettings).limit(1);
      
      if (existingSettings.length === 0) {
        console.log('[SETTINGS] No existing settings found, creating new record');
        const [newSettings] = await db
          .insert(schoolSettings)
          .values({
            schoolId: 1,
            name: updates.name || 'আদর্শ শিক্ষা প্রতিষ্ঠান',
            nameInBangla: updates.nameInBangla || 'Adarsha Educational Institution',
            address: updates.address || 'ঢাকা, বাংলাদেশ',
            addressInBangla: updates.addressInBangla || 'Dhaka, Bangladesh',
            email: updates.email || 'admin@school.edu.bd',
            phone: updates.phone || '+8801712345678',
            schoolType: updates.schoolType || 'school',
            establishmentYear: updates.establishmentYear || 2020,
            principalName: updates.principalName || 'মোঃ আবদুল করিম',
            eiin: updates.eiin || '123456',
            ...updates
          })
          .returning();
          
        console.log('[SETTINGS] New settings created successfully');
        return res.json({
          success: true,
          data: newSettings,
          action: 'created'
        });
      }
      
      // Update existing settings
      console.log('[SETTINGS] Updating existing settings...');
      const [updatedSettings] = await db
        .update(schoolSettings)
        .set({ 
          ...updates, 
          updatedAt: new Date() 
        })
        .where(eq(schoolSettings.id, existingSettings[0].id))
        .returning();
        
      console.log('[SETTINGS] Settings updated successfully');
      res.json({
        success: true,
        data: updatedSettings,
        action: 'updated'
      });
    } catch (error) {
      console.error('[SETTINGS] Error updating school settings:', error);
      res.status(500).json({ 
        error: 'Failed to update settings',
        details: error.message
      });
    }
  });

  // Test endpoint to create tables
  app.get('/api/test/create-tables', async (req: Request, res: Response) => {
    try {
      console.log('[TABLE_CREATION] Starting table creation...');
      
      // Create school_settings table using sql template
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS school_settings (
          id SERIAL PRIMARY KEY,
          school_id INTEGER NOT NULL DEFAULT 1,
          name TEXT NOT NULL DEFAULT 'আদর্শ শিক্ষা প্রতিষ্ঠান',
          name_in_bangla TEXT NOT NULL DEFAULT 'Adarsha Educational Institution',
          address TEXT NOT NULL DEFAULT 'ঢাকা, বাংলাদেশ',
          address_in_bangla TEXT NOT NULL DEFAULT 'Dhaka, Bangladesh',
          email TEXT NOT NULL DEFAULT 'admin@school.edu.bd',
          phone TEXT NOT NULL DEFAULT '+8801712345678',
          website TEXT,
          school_type TEXT NOT NULL DEFAULT 'school',
          establishment_year INTEGER NOT NULL DEFAULT 2020,
          eiin TEXT,
          registration_number TEXT,
          principal_name TEXT,
          principal_phone TEXT,
          description TEXT,
          description_in_bangla TEXT,
          primary_color TEXT DEFAULT '#3B82F6',
          secondary_color TEXT DEFAULT '#10B981',
          accent_color TEXT DEFAULT '#F59E0B',
          motto TEXT,
          motto_bn TEXT,
          use_watermark BOOLEAN DEFAULT true,
          use_letterhead BOOLEAN DEFAULT true,
          logo_url TEXT,
          timezone TEXT DEFAULT 'Asia/Dhaka',
          language TEXT DEFAULT 'bn',
          date_format TEXT DEFAULT 'DD/MM/YYYY',
          currency TEXT DEFAULT 'BDT',
          academic_year_start TEXT DEFAULT '01/01',
          week_starts_on TEXT DEFAULT 'sunday',
          enable_notifications BOOLEAN DEFAULT true,
          enable_sms BOOLEAN DEFAULT false,
          enable_email BOOLEAN DEFAULT true,
          auto_backup BOOLEAN DEFAULT true,
          data_retention INTEGER DEFAULT 365,
          max_students INTEGER DEFAULT 500,
          max_teachers INTEGER DEFAULT 50,
          allow_online_payments BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('[TABLE_CREATION] school_settings table created');

      // Create admin_settings table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS admin_settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          display_name TEXT,
          bio TEXT,
          profile_picture TEXT,
          contact_phone TEXT,
          emergency_contact TEXT,
          language TEXT DEFAULT 'bn',
          dark_mode BOOLEAN DEFAULT false,
          email_notifications BOOLEAN DEFAULT true,
          sms_notifications BOOLEAN DEFAULT false,
          push_notifications BOOLEAN DEFAULT true,
          two_factor_enabled BOOLEAN DEFAULT false,
          session_timeout INTEGER DEFAULT 60,
          password_expiry INTEGER DEFAULT 90,
          allow_multiple_sessions BOOLEAN DEFAULT false,
          default_dashboard TEXT DEFAULT 'overview',
          sidebar_collapsed BOOLEAN DEFAULT false,
          show_welcome_message BOOLEAN DEFAULT true,
          items_per_page INTEGER DEFAULT 25,
          maintenance_mode BOOLEAN DEFAULT false,
          system_backup_enabled BOOLEAN DEFAULT true,
          debug_mode BOOLEAN DEFAULT false,
          log_level TEXT DEFAULT 'info',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('[TABLE_CREATION] admin_settings table created');

      // Insert default school settings
      await db.execute(sql`
        INSERT INTO school_settings (
          name, name_in_bangla, address, address_in_bangla,
          email, phone, school_type, establishment_year,
          principal_name, eiin
        ) VALUES (
          'আদর্শ শিক্ষা প্রতিষ্ঠান',
          'Adarsha Educational Institution',
          'ঢাকা, বাংলাদেশ',
          'Dhaka, Bangladesh',
          'admin@adarsha.edu.bd',
          '+8801712345678',
          'school',
          2020,
          'মোঃ আবদুল করিম',
          '123456'
        )
        ON CONFLICT (id) DO NOTHING
      `);

      console.log('[TABLE_CREATION] Default data inserted');
      res.json({ success: true, message: 'Tables created and data inserted successfully' });
    } catch (error) {
      console.error('[TABLE_CREATION] Error creating tables:', error);
      res.status(500).json({ error: 'Failed to create tables', details: error.message });
    }
  });

  // Get school settings
  app.get('/api/school/settings', async (req: Request, res: Response) => {
    try {
      const settings = await db.select().from(schoolSettings).limit(1);
      
      if (settings.length === 0) {
        // Return default settings if none exist
        const defaultSettings = {
          id: null,
          schoolId: 1,
          name: '',
          nameInBangla: '',
          address: '',
          addressInBangla: '',
          email: '',
          phone: '',
          website: '',
          schoolType: 'school',
          establishmentYear: new Date().getFullYear(),
          eiin: '',
          registrationNumber: '',
          principalName: '',
          principalPhone: '',
          description: '',
          descriptionInBangla: '',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          motto: '',
          mottoBn: '',
          useWatermark: true,
          useLetterhead: true,
          logoUrl: '',
          timezone: 'Asia/Dhaka',
          language: 'bn',
          dateFormat: 'DD/MM/YYYY',
          currency: 'BDT',
          academicYearStart: '01/01',
          weekStartsOn: 'sunday',
          enableNotifications: true,
          enableSMS: false,
          enableEmail: true,
          autoBackup: true,
          dataRetention: 365,
          maxStudents: 500,
          maxTeachers: 50,
          allowOnlinePayments: false,
          createdAt: null,
          updatedAt: null
        };
        return res.json(defaultSettings);
      }
      
      res.json(settings[0]);
    } catch (error) {
      console.error('Error fetching school settings:', error);
      res.status(500).json({ error: 'Failed to fetch school settings' });
    }
  });

  // Create or update school settings (public for testing)
  app.post('/api/school/settings', async (req: Request, res: Response) => {
    try {
      const validatedData = schoolSettingsInsertSchema.parse(req.body);
      
      // Check if settings exist
      const existingSettings = await db.select().from(schoolSettings).limit(1);
      
      if (existingSettings.length > 0) {
        // Update existing settings
        const [updatedSettings] = await db
          .update(schoolSettings)
          .set({ 
            ...validatedData, 
            updatedAt: new Date() 
          })
          .where(eq(schoolSettings.id, existingSettings[0].id))
          .returning();
        
        return res.json(updatedSettings);
      } else {
        // Create new settings
        const [newSettings] = await db
          .insert(schoolSettings)
          .values(validatedData)
          .returning();
        
        return res.json(newSettings);
      }
    } catch (error) {
      console.error('Error saving school settings:', error);
      res.status(500).json({ error: 'Failed to save school settings' });
    }
  });

  // Update specific school setting sections (public for testing)
  app.patch('/api/school/settings/:section', async (req: Request, res: Response) => {
    try {
      const section = req.params.section;
      const updates = req.body;
      
      // Get existing settings
      const existingSettings = await db.select().from(schoolSettings).limit(1);
      
      if (existingSettings.length === 0) {
        return res.status(404).json({ error: 'School settings not found' });
      }
      
      let validatedUpdates;
      
      switch (section) {
        case 'basic':
          validatedUpdates = {
            name: updates.name,
            nameInBangla: updates.nameInBangla,
            address: updates.address,
            addressInBangla: updates.addressInBangla,
            email: updates.email,
            phone: updates.phone,
            website: updates.website,
            updatedAt: new Date()
          };
          break;
          
        case 'details':
          validatedUpdates = {
            schoolType: updates.schoolType,
            establishmentYear: updates.establishmentYear,
            eiin: updates.eiin,
            registrationNumber: updates.registrationNumber,
            principalName: updates.principalName,
            principalPhone: updates.principalPhone,
            description: updates.description,
            descriptionInBangla: updates.descriptionInBangla,
            updatedAt: new Date()
          };
          break;
          
        case 'branding':
          validatedUpdates = {
            primaryColor: updates.primaryColor,
            secondaryColor: updates.secondaryColor,
            accentColor: updates.accentColor,
            motto: updates.motto,
            mottoBn: updates.mottoBn,
            useWatermark: updates.useWatermark,
            useLetterhead: updates.useLetterhead,
            logoUrl: updates.logoUrl,
            updatedAt: new Date()
          };
          break;
          
        case 'system':
          validatedUpdates = {
            timezone: updates.timezone,
            language: updates.language,
            dateFormat: updates.dateFormat,
            currency: updates.currency,
            academicYearStart: updates.academicYearStart,
            weekStartsOn: updates.weekStartsOn,
            enableNotifications: updates.enableNotifications,
            enableSMS: updates.enableSMS,
            enableEmail: updates.enableEmail,
            autoBackup: updates.autoBackup,
            dataRetention: updates.dataRetention,
            maxStudents: updates.maxStudents,
            maxTeachers: updates.maxTeachers,
            allowOnlinePayments: updates.allowOnlinePayments,
            updatedAt: new Date()
          };
          break;
          
        default:
          return res.status(400).json({ error: 'Invalid settings section' });
      }
      
      const [updatedSettings] = await db
        .update(schoolSettings)
        .set(validatedUpdates)
        .where(eq(schoolSettings.id, existingSettings[0].id))
        .returning();
      
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating school settings section:', error);
      res.status(500).json({ error: 'Failed to update school settings' });
    }
  });

  // ==================== Admin Settings Routes ====================
  
  // Get admin settings for current user
  app.get('/api/admin/settings', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found in session' });
      }
      
      const settings = await db
        .select()
        .from(adminSettings)
        .where(eq(adminSettings.userId, userId))
        .limit(1);
      
      if (settings.length === 0) {
        // Return default admin settings
        const defaultSettings = {
          id: null,
          userId: userId,
          displayName: req.session.user.name || '',
          bio: '',
          profilePicture: '',
          contactPhone: '',
          emergencyContact: '',
          language: 'bn',
          darkMode: false,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          twoFactorEnabled: false,
          sessionTimeout: 60,
          passwordExpiry: 90,
          allowMultipleSessions: false,
          defaultDashboard: 'overview',
          sidebarCollapsed: false,
          showWelcomeMessage: true,
          itemsPerPage: 25,
          maintenanceMode: false,
          systemBackupEnabled: true,
          debugMode: false,
          logLevel: 'info',
          createdAt: null,
          updatedAt: null
        };
        return res.json(defaultSettings);
      }
      
      res.json(settings[0]);
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      res.status(500).json({ error: 'Failed to fetch admin settings' });
    }
  });

  // Create or update admin settings
  app.post('/api/admin/settings', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found in session' });
      }
      
      const validatedData = adminSettingsInsertSchema.parse({
        ...req.body,
        userId: userId
      });
      
      // Check if settings exist for this user
      const existingSettings = await db
        .select()
        .from(adminSettings)
        .where(eq(adminSettings.userId, userId))
        .limit(1);
      
      if (existingSettings.length > 0) {
        // Update existing settings
        const [updatedSettings] = await db
          .update(adminSettings)
          .set({ 
            ...validatedData, 
            updatedAt: new Date() 
          })
          .where(eq(adminSettings.id, existingSettings[0].id))
          .returning();
        
        return res.json(updatedSettings);
      } else {
        // Create new settings
        const [newSettings] = await db
          .insert(adminSettings)
          .values(validatedData)
          .returning();
        
        return res.json(newSettings);
      }
    } catch (error) {
      console.error('Error saving admin settings:', error);
      res.status(500).json({ error: 'Failed to save admin settings' });
    }
  });

  // Update admin profile
  app.patch('/api/admin/profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.user?.id;
      const { name, email, username, currentPassword, newPassword } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found in session' });
      }
      
      // Get current user data
      const currentUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (currentUser.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password if changing password
      if (newPassword) {
        const isValidPassword = await bcrypt.compare(currentPassword, currentUser[0].passwordHash);
        if (!isValidPassword) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
      }
      
      // Prepare updates
      const updates: any = {
        name,
        email,
        username,
        updatedAt: new Date()
      };
      
      // Hash new password if provided
      if (newPassword) {
        updates.passwordHash = await bcrypt.hash(newPassword, 12);
      }
      
      // Update user
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
          role: users.role,
          isAdmin: users.isAdmin
        });
      
      // Update session
      if (req.session?.user) {
        req.session.user = {
          ...req.session.user,
          ...updatedUser
        };
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating admin profile:', error);
      res.status(500).json({ error: 'Failed to update admin profile' });
    }
  });

  // ==================== Admin User Management Routes ====================
  
  // Get all users (admin only)
  app.get('/api/admin/users', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 25, role, status, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      let query = db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
          phoneNumber: users.phoneNumber,
          role: users.role,
          isActive: users.isActive,
          isAdmin: users.isAdmin,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users);
      
      // Apply filters
      let conditions = [];
      
      if (role && role !== 'all') {
        conditions.push(eq(users.role, role as string));
      }
      
      if (status && status !== 'all') {
        if (status === 'active') {
          conditions.push(eq(users.isActive, true));
        } else if (status === 'inactive') {
          conditions.push(eq(users.isActive, false));
        }
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const allUsers = await query
        .limit(Number(limit))
        .offset(offset)
        .orderBy(users.createdAt);
      
      // Get total count
      const [{ count: totalUsers }] = await db
        .select({ count: users.id })
        .from(users);
      
      res.json({
        users: allUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(totalUsers),
          totalPages: Math.ceil(Number(totalUsers) / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Create new user (admin only)
  app.post('/api/admin/users', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { username, name, email, phoneNumber, role, password } = req.body;
      
      // Check if username already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          name,
          email,
          phoneNumber,
          role,
          passwordHash,
          isActive: true,
          isAdmin: role === 'admin'
        })
        .returning({
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
          phoneNumber: users.phoneNumber,
          role: users.role,
          isActive: users.isActive,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt
        });
      
      res.json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Update user status (admin only)
  app.patch('/api/admin/users/:id/status', requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const [updatedUser] = await db
        .update(users)
        .set({ 
          isActive,
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          name: users.name,
          isActive: users.isActive
        });
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  // Delete user (admin only)
  app.delete('/api/admin/users/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.session?.user?.id;
      
      // Prevent deleting self
      if (userId === currentUserId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }
      
      await db.delete(users).where(eq(users.id, userId));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // ==================== Pricing Plans Routes ====================
  
  // Get all pricing plans
  app.get('/api/pricing-plans', async (req: Request, res: Response) => {
    try {
      const plans = await db
        .select()
        .from(pricingPlans)
        .where(eq(pricingPlans.isActive, true))
        .orderBy(pricingPlans.price);
      
      res.json(plans);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      res.status(500).json({ error: 'Failed to fetch pricing plans' });
    }
  });

  // Create pricing plan (admin only)
  app.post('/api/admin/pricing-plans', requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = pricingPlansInsertSchema.parse(req.body);
      
      const [newPlan] = await db
        .insert(pricingPlans)
        .values(validatedData)
        .returning();
      
      res.json(newPlan);
    } catch (error) {
      console.error('Error creating pricing plan:', error);
      res.status(500).json({ error: 'Failed to create pricing plan' });
    }
  });

  // Update pricing plan (admin only)
  app.patch('/api/admin/pricing-plans/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const planId = parseInt(req.params.id);
      const updates = req.body;
      
      const [updatedPlan] = await db
        .update(pricingPlans)
        .set({ 
          ...updates, 
          updatedAt: new Date() 
        })
        .where(eq(pricingPlans.id, planId))
        .returning();
      
      res.json(updatedPlan);
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      res.status(500).json({ error: 'Failed to update pricing plan' });
    }
  });

  // Delete pricing plan (admin only)
  app.delete('/api/admin/pricing-plans/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const planId = parseInt(req.params.id);
      
      await db.delete(pricingPlans).where(eq(pricingPlans.id, planId));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      res.status(500).json({ error: 'Failed to delete pricing plan' });
    }
  });
}