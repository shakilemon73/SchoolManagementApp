import { Express, Request, Response } from 'express';
import { db, safeDbQuery } from '../db';
import { users, schools, creditBalance } from '../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { emailService } from './email-service';

// Generate random password for new users
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function registerUserManagementRoutes(app: Express) {
  
  // Get user statistics
  app.get('/api/users/stats', async (req: Request, res: Response) => {
    try {
      const userStats = await safeDbQuery(async () => {
        // Get total users count
        const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
        
        // Get users by role
        const usersByRole = await db
          .select({
            role: users.role,
            count: sql`count(*)`
          })
          .from(users)
          .groupBy(users.role);
        
        // Get active users (logged in within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUsers = await db
          .select({ count: sql`count(*)` })
          .from(users)
          .where(sql`${users.lastLogin} >= ${thirtyDaysAgo.toISOString()}`);

        return {
          totalUsers: Number(totalUsers[0]?.count) || 0,
          activeUsers: Number(activeUsers[0]?.count) || 0,
          usersByRole: usersByRole.reduce((acc, curr) => {
            acc[curr.role] = Number(curr.count);
            return acc;
          }, {} as Record<string, number>)
        };
      }, {
        totalUsers: 0,
        activeUsers: 0,
        usersByRole: {}
      });

      res.json(userStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  });

  // Get all users with pagination
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const usersList = await safeDbQuery(async () => {
        return await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            isActive: users.isActive,
            lastLogin: users.lastLogin,
            createdAt: users.createdAt,
          })
          .from(users)
          .orderBy(desc(users.createdAt))
          .limit(limit)
          .offset(offset);
      }, []);

      res.json(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Create new user
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const { name, email, role, phone, address } = req.body;

      // Validate required fields
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Name, email, and role are required' });
      }

      // Check if user already exists
      const existingUser = await safeDbQuery(async () => {
        return await db.select().from(users).where(eq(users.email, email)).limit(1);
      }, []);

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Generate secure password
      const tempPassword = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create user
      const newUser = await safeDbQuery(async () => {
        const result = await db.insert(users).values({
          name,
          email,
          password: hashedPassword,
          role,
          phone: phone || null,
          address: address || null,
          isActive: true,
          emailVerified: false,
        }).returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        });
        
        return result[0];
      }, null);

      if (!newUser) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      // Initialize credit balance for the user
      await safeDbQuery(async () => {
        await db.insert(creditBalance).values({
          userId: newUser.id,
          balance: 100, // Default starting credits
          totalEarned: 100,
          totalSpent: 0,
        });
      }, null);

      // Send welcome email with credentials
      try {
        await emailService.sendWelcomeEmail({
          to: email,
          name,
          email,
          tempPassword,
          role,
          loginUrl: `${req.protocol}://${req.get('host')}/login`
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the user creation if email fails
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: newUser
      });

    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Update user status (activate/deactivate)
  app.patch('/api/users/:id/status', async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const { isActive } = req.body;

      const updatedUser = await safeDbQuery(async () => {
        const result = await db
          .update(users)
          .set({ isActive })
          .where(eq(users.id, userId))
          .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            isActive: users.isActive
          });
        
        return result[0];
      }, null);

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user: updatedUser
      });

    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  // Delete user (soft delete by deactivating)
  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;

      const deletedUser = await safeDbQuery(async () => {
        const result = await db
          .update(users)
          .set({ 
            isActive: false,
            email: `deleted_${Date.now()}_${users.email}` // Prevent email conflicts
          })
          .where(eq(users.id, userId))
          .returning({
            id: users.id,
            name: users.name,
            email: users.email
          });
        
        return result[0];
      }, null);

      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
        user: deletedUser
      });

    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Get setup status for initial configuration
  app.get('/api/setup/status', async (req: Request, res: Response) => {
    try {
      const setupStatus = await safeDbQuery(async () => {
        // Check if we have any schools
        const schoolCount = await db.select({ count: sql`count(*)` }).from(schools);
        
        // Check if we have any admin users
        const adminCount = await db
          .select({ count: sql`count(*)` })
          .from(users)
          .where(eq(users.role, 'admin'));

        const schoolTotal = Number(schoolCount[0]?.count) || 0;
        const adminTotal = Number(adminCount[0]?.count) || 0;

        return {
          schoolCount: schoolTotal,
          adminCount: adminTotal,
          hasSchools: schoolTotal > 0,
          hasAdmins: adminTotal > 0,
          setupNeeded: schoolTotal === 0 || adminTotal === 0
        };
      }, {
        schoolCount: 0,
        adminCount: 0,
        hasSchools: false,
        hasAdmins: false,
        setupNeeded: true
      });

      res.json(setupStatus);
    } catch (error) {
      console.error('Error checking setup status:', error);
      res.status(500).json({ error: 'Failed to check setup status' });
    }
  });

  console.log('✅ User management routes registered');
}