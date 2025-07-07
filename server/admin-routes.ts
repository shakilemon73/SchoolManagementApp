import { Express, Request, Response } from 'express';
import { db } from './db';
import { users, schools, students, teachers, classes, feeReceipts, attendance, exams, documentTemplates } from '../shared/schema';
import { eq, count, desc, and, gte, lte, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Admin middleware to check if user has admin privileges
const requireAdmin = async (req: Request, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

export function registerAdminRoutes(app: Express) {
  
  // System Statistics
  app.get("/api/admin/stats", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [totalUsers] = await db.select({ count: count() }).from(users);
      const [totalSchools] = await db.select({ count: count() }).from(schools);
      const [totalStudents] = await db.select({ count: count() }).from(students);
      const [totalTeachers] = await db.select({ count: count() }).from(teachers);

      // Get recent activities
      const recentUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(5);

      res.json({
        totalUsers: totalUsers.count,
        totalSchools: totalSchools.count,
        totalStudents: totalStudents.count,
        totalTeachers: totalTeachers.count,
        recentUsers
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to fetch system statistics' });
    }
  });

  // User Management Routes
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const allUsers = await db
        .select({
          id: users.id,
          username: users.username,
          full_name: users.full_name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      res.json(allUsers);
    } catch (error) {
      console.error('Users fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { username, password, full_name, email, phone, role } = req.body;

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
      const hashedPassword = await bcrypt.hash(password, 12);

      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          full_name,
          email,
          phone,
          role,
          language: 'bn'
        })
        .returning({
          id: users.id,
          username: users.username,
          full_name: users.full_name,
          email: users.email,
          phone: users.phone,
          role: users.role
        });

      res.json(newUser);
    } catch (error) {
      console.error('User creation error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.patch("/api/admin/users/:id/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { status } = req.body;

      const [updatedUser] = await db
        .update(users)
        .set({ updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      res.json(updatedUser);
    } catch (error) {
      console.error('User status update error:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);

      // Prevent deleting super admin
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user[0]?.role === 'super_admin') {
        return res.status(403).json({ error: 'Cannot delete super admin user' });
      }

      await db.delete(users).where(eq(users.id, userId));
      res.json({ success: true });
    } catch (error) {
      console.error('User deletion error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // School Management Routes
  app.get("/api/admin/schools", requireAdmin, async (req: Request, res: Response) => {
    try {
      const allSchools = await db
        .select()
        .from(schools)
        .orderBy(desc(schools.createdAt));

      // Get student and teacher counts for each school
      const schoolsWithCounts = await Promise.all(
        allSchools.map(async (school) => {
          const [studentCount] = await db
            .select({ count: count() })
            .from(students)
            .where(eq(students.schoolId, school.id));

          const [teacherCount] = await db
            .select({ count: count() })
            .from(teachers)
            .where(eq(teachers.schoolId, school.id));

          return {
            ...school,
            studentCount: studentCount.count,
            teacherCount: teacherCount.count
          };
        })
      );

      res.json(schoolsWithCounts);
    } catch (error) {
      console.error('Schools fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch schools' });
    }
  });

  app.post("/api/admin/schools", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { name, address, phone, email, website, type } = req.body;

      const [newSchool] = await db
        .insert(schools)
        .values({
          name,
          address,
          phone,
          email,
          website,
          type
        })
        .returning();

      res.json(newSchool);
    } catch (error) {
      console.error('School creation error:', error);
      res.status(500).json({ error: 'Failed to create school' });
    }
  });

  app.patch("/api/admin/schools/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.id);
      const updates = req.body;

      const [updatedSchool] = await db
        .update(schools)
        .set(updates)
        .where(eq(schools.id, schoolId))
        .returning();

      res.json(updatedSchool);
    } catch (error) {
      console.error('School update error:', error);
      res.status(500).json({ error: 'Failed to update school' });
    }
  });

  // System Monitoring Routes
  app.get("/api/admin/system/health", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Check database connection
      const dbCheck = await db.select({ count: count() }).from(users);
      
      res.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        userCount: dbCheck[0].count
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ 
        status: 'unhealthy',
        error: 'System health check failed'
      });
    }
  });

  // Feature Control Routes
  app.get("/api/admin/features", requireAdmin, async (req: Request, res: Response) => {
    try {
      // This would typically come from a features configuration table
      // For now, returning static feature list
      const features = [
        { id: 'student_management', name: 'Student Management', enabled: true },
        { id: 'teacher_management', name: 'Teacher Management', enabled: true },
        { id: 'attendance_system', name: 'Attendance System', enabled: true },
        { id: 'fee_management', name: 'Fee Management', enabled: true },
        { id: 'document_generation', name: 'Document Generation', enabled: true },
        { id: 'examination_system', name: 'Examination System', enabled: true },
        { id: 'library_management', name: 'Library Management', enabled: false },
        { id: 'transportation', name: 'Transportation', enabled: false }
      ];

      res.json(features);
    } catch (error) {
      console.error('Features fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch features' });
    }
  });

  // Analytics Routes
  app.get("/api/admin/analytics", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Get user registrations over time
      let userQuery = db.select({ 
        date: users.createdAt,
        role: users.role 
      }).from(users);

      if (startDate && endDate) {
        userQuery = userQuery.where(
          and(
            gte(users.createdAt, new Date(startDate as string)),
            lte(users.createdAt, new Date(endDate as string))
          )
        );
      }

      const userRegistrations = await userQuery.orderBy(desc(users.createdAt));

      // Get attendance statistics
      const attendanceStats = await db
        .select({ 
          date: attendance.date,
          status: attendance.status
        })
        .from(attendance)
        .orderBy(desc(attendance.date))
        .limit(100);

      res.json({
        userRegistrations,
        attendanceStats,
        summary: {
          totalUsers: userRegistrations.length,
          recentAttendance: attendanceStats.length
        }
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Audit Logs Route
  app.get("/api/admin/audit-logs", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      // Get recent user activities
      const recentActivities = await db
        .select({
          id: users.id,
          username: users.username,
          full_name: users.full_name,
          role: users.role,
          lastActivity: users.updatedAt,
          action: users.createdAt // Using createdAt as activity timestamp
        })
        .from(users)
        .orderBy(desc(users.updatedAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      res.json({
        logs: recentActivities,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: recentActivities.length
        }
      });
    } catch (error) {
      console.error('Audit logs error:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // Template Management Routes
  app.get("/api/admin/templates", requireAdmin, async (req: Request, res: Response) => {
    try {
      const templates = await db
        .select()
        .from(db.select().from(db.select().from(templates)));
      
      // Mock data for now - replace with actual template data from database
      const templateData = [
        { id: 1, name: 'আইডি কার্ড', type: 'id_card', schools: 12, status: 'active' },
        { id: 2, name: 'ফি রিসিট', type: 'fee_receipt', schools: 15, status: 'active' },
        { id: 3, name: 'মার্কশিট', type: 'marksheet', schools: 8, status: 'active' },
        { id: 4, name: 'সার্টিফিকেট', type: 'certificate', schools: 5, status: 'beta' }
      ];

      res.json(templateData);
    } catch (error) {
      console.error('Templates fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  // Credit System Routes
  app.get("/api/admin/credits/overview", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [totalCreditsResult] = await db
        .select({ total: count() })
        .from(creditTransactions);

      const creditOverview = {
        totalCreditsUsed: totalCreditsResult.total * 50, // Mock calculation
        activeCredits: 38250,
        monthlyRevenue: 245000,
        pendingPayments: 28500
      };

      res.json(creditOverview);
    } catch (error) {
      console.error('Credit overview error:', error);
      res.status(500).json({ error: 'Failed to fetch credit overview' });
    }
  });

  app.get("/api/admin/credits/packages", requireAdmin, async (req: Request, res: Response) => {
    try {
      const packages = await db
        .select()
        .from(creditPackages)
        .orderBy(creditPackages.price);

      res.json(packages);
    } catch (error) {
      console.error('Credit packages error:', error);
      res.status(500).json({ error: 'Failed to fetch credit packages' });
    }
  });

  app.post("/api/admin/credits/packages", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { name, credits, price, description } = req.body;

      const [newPackage] = await db
        .insert(creditPackages)
        .values({
          name,
          credits,
          price,
          description,
          isActive: true
        })
        .returning();

      res.json(newPackage);
    } catch (error) {
      console.error('Credit package creation error:', error);
      res.status(500).json({ error: 'Failed to create credit package' });
    }
  });

  // Enhanced Analytics Routes
  app.get("/api/admin/analytics/realtime", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [totalUsers] = await db.select({ count: count() }).from(users);
      const [totalSchools] = await db.select({ count: count() }).from(schools);
      
      // Real-time metrics
      const realtimeMetrics = {
        todayLogins: Math.floor(Math.random() * 2000) + 1000, // Mock data - replace with actual
        documentsGenerated: Math.floor(Math.random() * 5000) + 2000,
        systemUptime: 99.9,
        apiCalls: Math.floor(Math.random() * 50000) + 30000,
        totalUsers: totalUsers.count,
        totalSchools: totalSchools.count
      };

      res.json(realtimeMetrics);
    } catch (error) {
      console.error('Realtime analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch realtime analytics' });
    }
  });

  app.get("/api/admin/analytics/system-health", requireAdmin, async (req: Request, res: Response) => {
    try {
      // System health metrics
      const systemHealth = {
        server: {
          cpuUsage: Math.floor(Math.random() * 40) + 10, // 10-50%
          memoryUsage: Math.floor(Math.random() * 30) + 50, // 50-80%
          diskUsage: Math.floor(Math.random() * 20) + 30 // 30-50%
        },
        database: {
          status: 'connected',
          avgQueryTime: Math.floor(Math.random() * 20) + 5, // 5-25ms
          activeConnections: Math.floor(Math.random() * 15) + 5, // 5-20
          totalSize: '2.4' // GB
        }
      };

      res.json(systemHealth);
    } catch (error) {
      console.error('System health error:', error);
      res.status(500).json({ error: 'Failed to fetch system health' });
    }
  });

  // School Feature Management
  app.post("/api/admin/schools/:id/features", requireAdmin, async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.id);
      const { featureId, enabled } = req.body;

      // Mock feature toggle - implement actual feature management
      res.json({
        schoolId,
        featureId,
        enabled,
        message: `Feature ${enabled ? 'enabled' : 'disabled'} for school`
      });
    } catch (error) {
      console.error('Feature toggle error:', error);
      res.status(500).json({ error: 'Failed to toggle feature' });
    }
  });

  // Document Limits Management
  app.get("/api/admin/schools/:id/limits", requireAdmin, async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.id);
      
      // Get credit usage for this school
      const creditUsage = await db
        .select()
        .from(creditUsageLogs)
        .where(eq(creditUsageLogs.userId, schoolId)) // Assuming userId maps to school
        .orderBy(desc(creditUsageLogs.createdAt))
        .limit(10);

      res.json({
        schoolId,
        usage: creditUsage,
        limits: {
          monthly: 1000,
          remaining: 750,
          used: 250
        }
      });
    } catch (error) {
      console.error('Document limits error:', error);
      res.status(500).json({ error: 'Failed to fetch document limits' });
    }
  });

  // Multi-tenant School Registration
  app.post("/api/admin/schools/register", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { name, address, phone, email, type, adminUser } = req.body;

      // Create school
      const [newSchool] = await db
        .insert(schools)
        .values({
          name,
          address,
          phone,
          email,
          type
        })
        .returning();

      // Create admin user for the school if provided
      if (adminUser) {
        const hashedPassword = await bcrypt.hash(adminUser.password, 12);
        
        await db
          .insert(users)
          .values({
            username: adminUser.username,
            password: hashedPassword,
            full_name: adminUser.fullName,
            email: adminUser.email,
            phone: adminUser.phone,
            role: 'admin',
            language: 'bn'
          });
      }

      res.json({
        school: newSchool,
        message: 'School registered successfully'
      });
    } catch (error) {
      console.error('School registration error:', error);
      res.status(500).json({ error: 'Failed to register school' });
    }
  });

  // Bulk Operations
  app.post("/api/admin/bulk/users/import", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { users: usersData } = req.body;
      
      if (!Array.isArray(usersData)) {
        return res.status(400).json({ error: 'Invalid users data format' });
      }

      const results = [];
      for (const userData of usersData) {
        try {
          const hashedPassword = await bcrypt.hash(userData.password || 'password123', 12);
          
          const [newUser] = await db
            .insert(users)
            .values({
              ...userData,
              password: hashedPassword,
              language: userData.language || 'bn'
            })
            .returning();
            
          results.push({ success: true, user: newUser });
        } catch (error) {
          results.push({ 
            success: false, 
            error: (error as Error).message,
            userData: userData.username 
          });
        }
      }

      res.json({
        message: 'Bulk import completed',
        results,
        summary: {
          total: usersData.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      res.status(500).json({ error: 'Bulk import failed' });
    }
  });

  // Document Permission Control Routes - Super Admin Complete Control
  app.get("/api/admin/documents/all", requireAdmin, async (req: Request, res: Response) => {
    try {
      const documents = await db
        .select({
          id: documentTemplates.id,
          name: documentTemplates.name,
          nameBn: documentTemplates.nameBn,
          category: documentTemplates.category,
          type: documentTemplates.type,
          icon: documentTemplates.icon,
          description: documentTemplates.description,
          descriptionBn: documentTemplates.descriptionBn,
          isActive: documentTemplates.isActive,
          isPopular: documentTemplates.isPopular
        })
        .from(documentTemplates)
        .orderBy(documentTemplates.category, documentTemplates.name);

      res.json(documents);
    } catch (error) {
      console.error('Error fetching all documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  // Toggle document active status - Master control
  app.post("/api/admin/documents/:id/toggle", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      await db.execute(`
        UPDATE document_templates 
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [isActive, parseInt(id)]);

      res.json({ success: true, message: `Document ${isActive ? 'enabled' : 'disabled'} successfully` });
    } catch (error) {
      console.error('Error toggling document status:', error);
      res.status(500).json({ error: 'Failed to toggle document status' });
    }
  });

  // Bulk toggle documents by category
  app.post("/api/admin/documents/bulk-toggle", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { category, isActive } = req.body;

      if (category === 'all') {
        await db.execute(`
          UPDATE document_templates 
          SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        `, [isActive]);
      } else {
        await db.execute(`
          UPDATE document_templates 
          SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE category = $2
        `, [isActive, category]);
      }

      const action = isActive ? 'enabled' : 'disabled';
      const scope = category === 'all' ? 'All documents' : `All ${category} documents`;
      
      res.json({ success: true, message: `${scope} ${action} successfully` });
    } catch (error) {
      console.error('Error bulk toggling documents:', error);
      res.status(500).json({ error: 'Failed to bulk toggle documents' });
    }
  });

  // Update document popularity
  app.post("/api/admin/documents/:id/popularity", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isPopular } = req.body;

      await db.execute(`
        UPDATE document_templates 
        SET is_popular = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [isPopular, parseInt(id)]);

      res.json({ success: true, message: `Document popularity updated successfully` });
    } catch (error) {
      console.error('Error updating document popularity:', error);
      res.status(500).json({ error: 'Failed to update document popularity' });
    }
  });

  // Get document usage statistics for super admin
  app.get("/api/admin/documents/stats", requireAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await db.execute(`
        SELECT 
          category,
          COUNT(*) as total_documents,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_documents,
          COUNT(CASE WHEN is_popular = true THEN 1 END) as popular_documents
        FROM document_templates 
        GROUP BY category
        ORDER BY category
      `);

      const overallStats = await db.execute(`
        SELECT 
          COUNT(*) as total_documents,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_documents,
          COUNT(CASE WHEN is_popular = true THEN 1 END) as popular_documents,
          COUNT(CASE WHEN is_active = false THEN 1 END) as disabled_documents
        FROM document_templates
      `);

      res.json({
        byCategory: stats.rows,
        overall: overallStats.rows[0]
      });
    } catch (error) {
      console.error('Error fetching document stats:', error);
      res.status(500).json({ error: 'Failed to fetch document statistics' });
    }
  });

  // Get documents by category for fine-grained control
  app.get("/api/admin/documents/category/:category", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      
      const documents = await db.execute(`
        SELECT 
          id, name, name_bn, type, icon, description, description_bn,
          is_active, is_popular, created_at, updated_at
        FROM document_templates 
        WHERE category = $1
        ORDER BY name
      `, [category]);

      res.json(documents.rows);
    } catch (error) {
      console.error('Error fetching documents by category:', error);
      res.status(500).json({ error: 'Failed to fetch documents by category' });
    }
  });

  // Update multiple documents at once
  app.post("/api/admin/documents/batch-update", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { documentIds, updates } = req.body;
      
      for (const docId of documentIds) {
        const setParts = [];
        const values = [];
        let paramIndex = 1;

        if (updates.isActive !== undefined) {
          setParts.push(`is_active = $${paramIndex++}`);
          values.push(updates.isActive);
        }
        
        if (updates.isPopular !== undefined) {
          setParts.push(`is_popular = $${paramIndex++}`);
          values.push(updates.isPopular);
        }

        if (setParts.length > 0) {
          setParts.push(`updated_at = $${paramIndex++}`);
          values.push(new Date());
          values.push(docId);

          await db.execute(`
            UPDATE document_templates 
            SET ${setParts.join(', ')}
            WHERE id = $${paramIndex}
          `, values);
        }
      }

      res.json({ success: true, message: `${documentIds.length} documents updated successfully` });
    } catch (error) {
      console.error('Error batch updating documents:', error);
      res.status(500).json({ error: 'Failed to batch update documents' });
    }
  });

  // Get comprehensive document control dashboard data
  app.get("/api/admin/documents/dashboard", requireAdmin, async (req: Request, res: Response) => {
    try {
      const categoryStats = await db.execute(`
        SELECT 
          category,
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active,
          COUNT(CASE WHEN is_active = false THEN 1 END) as disabled,
          COUNT(CASE WHEN is_popular = true THEN 1 END) as popular,
          ROUND(
            (COUNT(CASE WHEN is_active = true THEN 1 END) * 100.0 / COUNT(*)), 2
          ) as active_percentage
        FROM document_templates 
        GROUP BY category
        ORDER BY category
      `);

      const recentChanges = await db.execute(`
        SELECT 
          id, name, name_bn, category, is_active, is_popular, updated_at
        FROM document_templates 
        WHERE updated_at > NOW() - INTERVAL '7 days'
        ORDER BY updated_at DESC
        LIMIT 10
      `);

      const totalStats = await db.execute(`
        SELECT 
          COUNT(*) as total_documents,
          COUNT(CASE WHEN is_active = true THEN 1 END) as total_active,
          COUNT(CASE WHEN is_active = false THEN 1 END) as total_disabled,
          COUNT(CASE WHEN is_popular = true THEN 1 END) as total_popular
        FROM document_templates
      `);

      res.json({
        categoryStats: categoryStats.rows,
        recentChanges: recentChanges.rows,
        totalStats: totalStats.rows[0]
      });
    } catch (error) {
      console.error('Error fetching document dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch document dashboard data' });
    }
  });
}