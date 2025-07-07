import { Express, Request, Response } from 'express';
import { db } from './db';
import { 
  videoConferences, 
  paymentTransactions, 
  documentTemplates, 
  schoolSettings,
  notifications,
  academicTerms,
  users 
} from '../shared/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Video Conference Routes
export function registerVideoConferenceRoutes(app: Express) {
  // Get all video conferences
  app.get('/api/video-conferences', async (req: Request, res: Response) => {
    try {
      const conferences = await db.select().from(videoConferences).orderBy(desc(videoConferences.createdAt));
      res.json(conferences);
    } catch (error) {
      console.error('Error fetching video conferences:', error);
      res.status(500).json({ error: 'Failed to fetch video conferences' });
    }
  });

  // Create new video conference
  app.post('/api/video-conferences', async (req: Request, res: Response) => {
    try {
      const { name, nameBn, subject, host, startTime, maxParticipants } = req.body;
      
      const [conference] = await db.insert(videoConferences).values({
        name,
        nameBn,
        subject,
        host,
        startTime: new Date(startTime),
        maxParticipants,
        meetingId: nanoid(10),
        status: 'upcoming'
      }).returning();

      res.json(conference);
    } catch (error) {
      console.error('Error creating video conference:', error);
      res.status(500).json({ error: 'Failed to create video conference' });
    }
  });

  // Update video conference status
  app.patch('/api/video-conferences/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, isRecording } = req.body;

      const [updatedConference] = await db.update(videoConferences)
        .set({ 
          status, 
          isRecording,
          endTime: status === 'ended' ? new Date() : undefined
        })
        .where(eq(videoConferences.id, parseInt(id)))
        .returning();

      res.json(updatedConference);
    } catch (error) {
      console.error('Error updating video conference:', error);
      res.status(500).json({ error: 'Failed to update video conference' });
    }
  });

  // Join video conference
  app.post('/api/video-conferences/:id/join', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await db.update(videoConferences)
        .set({ 
          participants: sql`${videoConferences.participants} + 1`
        })
        .where(eq(videoConferences.id, parseInt(id)));

      res.json({ success: true });
    } catch (error) {
      console.error('Error joining video conference:', error);
      res.status(500).json({ error: 'Failed to join video conference' });
    }
  });
}

// Notifications Routes
export function registerNotificationsRoutes(app: Express) {
  // Get all notifications
  app.get('/api/notifications', async (req: Request, res: Response) => {
    try {
      const { priority, type, isRead } = req.query;
      
      let query = db.select().from(notifications);
      const conditions = [];

      if (priority) conditions.push(eq(notifications.priority, priority as string));
      if (type) conditions.push(eq(notifications.type, type as string));
      if (isRead !== undefined) conditions.push(eq(notifications.isRead, isRead === 'true'));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const allNotifications = await query.orderBy(desc(notifications.createdAt));
      res.json(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Create new notification
  app.post('/api/notifications', async (req: Request, res: Response) => {
    try {
      const { title, titleBn, message, messageBn, type, priority, userId } = req.body;
      
      const [notification] = await db.insert(notifications).values({
        title,
        titleBn,
        message,
        messageBn,
        type: type || 'info',
        priority: priority || 'medium',
        userId,
        category: 'general',
        categoryBn: 'সাধারণ'
      }).returning();

      res.json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  // Mark notification as read
  app.patch('/api/notifications/:id/read', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [updatedNotification] = await db.update(notifications)
        .set({ 
          isRead: true,
          readAt: new Date()
        })
        .where(eq(notifications.id, parseInt(id)))
        .returning();

      res.json(updatedNotification);
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  // Mark all notifications as read
  app.patch('/api/notifications/mark-all-read', async (req: Request, res: Response) => {
    try {
      await db.update(notifications)
        .set({ 
          isRead: true,
          readAt: new Date()
        })
        .where(eq(notifications.isRead, false));

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });
}

// Payment Gateway Routes
export function registerPaymentRoutes(app: Express) {
  // Get all payment transactions
  app.get('/api/payments', async (req: Request, res: Response) => {
    try {
      const { status, paymentMethod } = req.query;
      
      let query = db.select().from(paymentTransactions);
      const conditions = [];

      if (status) conditions.push(eq(paymentTransactions.status, status as string));
      if (paymentMethod) conditions.push(eq(paymentTransactions.paymentMethod, paymentMethod as string));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const transactions = await query.orderBy(desc(paymentTransactions.createdAt));
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      res.status(500).json({ error: 'Failed to fetch payment transactions' });
    }
  });

  // Create new payment transaction
  app.post('/api/payments', async (req: Request, res: Response) => {
    try {
      const { 
        amount, 
        paymentMethod, 
        payerName, 
        payerPhone, 
        description, 
        descriptionBn, 
        studentId 
      } = req.body;
      
      const [transaction] = await db.insert(paymentTransactions).values({
        transactionId: `TXN_${nanoid(10)}`,
        amount,
        paymentMethod,
        payerName,
        payerPhone,
        description,
        descriptionBn,
        studentId,
        status: 'pending'
      }).returning();

      res.json(transaction);
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      res.status(500).json({ error: 'Failed to create payment transaction' });
    }
  });

  // Update payment status
  app.patch('/api/payments/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const [updatedTransaction] = await db.update(paymentTransactions)
        .set({ 
          status,
          completedAt: status === 'success' ? new Date() : undefined
        })
        .where(eq(paymentTransactions.id, parseInt(id)))
        .returning();

      res.json(updatedTransaction);
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ error: 'Failed to update payment status' });
    }
  });

  // Get payment statistics
  app.get('/api/payments/stats', async (req: Request, res: Response) => {
    try {
      const totalTransactions = await db.select({ count: sql`count(*)` }).from(paymentTransactions);
      const successfulTransactions = await db.select({ count: sql`count(*)` })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.status, 'success'));
      
      const totalAmount = await db.select({ sum: sql`sum(${paymentTransactions.amount})` })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.status, 'success'));

      res.json({
        totalTransactions: totalTransactions[0].count,
        successfulTransactions: successfulTransactions[0].count,
        totalAmount: totalAmount[0].sum || 0
      });
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      res.status(500).json({ error: 'Failed to fetch payment stats' });
    }
  });
}

// Document Templates Routes
export function registerTemplatesRoutes(app: Express) {
  // Get all document templates
  app.get('/api/templates', async (req: Request, res: Response) => {
    try {
      const { type, category, isActive } = req.query;
      
      let query = db.select().from(documentTemplates);
      const conditions = [];

      if (type) conditions.push(eq(documentTemplates.type, type as string));
      if (category) conditions.push(eq(documentTemplates.category, category as string));
      if (isActive !== undefined) conditions.push(eq(documentTemplates.isActive, isActive === 'true'));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const templates = await query.orderBy(desc(documentTemplates.createdAt));
      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  // Create new template
  app.post('/api/templates', async (req: Request, res: Response) => {
    try {
      const { 
        name, 
        nameBn, 
        type, 
        description, 
        descriptionBn, 
        category, 
        categoryBn,
        settings,
        createdBy,
        tags
      } = req.body;
      
      const [template] = await db.insert(documentTemplates).values({
        name,
        nameBn,
        type,
        description,
        descriptionBn,
        category,
        categoryBn,
        settings,
        createdBy,
        tags,
        isDefault: false,
        isActive: true
      }).returning();

      res.json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  });

  // Toggle template favorite
  app.patch('/api/templates/:id/favorite', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isFavorite } = req.body;

      const [updatedTemplate] = await db.update(documentTemplates)
        .set({ isFavorite })
        .where(eq(documentTemplates.id, parseInt(id)))
        .returning();

      res.json(updatedTemplate);
    } catch (error) {
      console.error('Error updating template favorite:', error);
      res.status(500).json({ error: 'Failed to update template favorite' });
    }
  });

  // Increment template usage
  app.post('/api/templates/:id/use', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await db.update(documentTemplates)
        .set({ 
          usageCount: sql`${documentTemplates.usageCount} + 1`,
          lastModified: new Date()
        })
        .where(eq(documentTemplates.id, parseInt(id)));

      res.json({ success: true });
    } catch (error) {
      console.error('Error incrementing template usage:', error);
      res.status(500).json({ error: 'Failed to increment template usage' });
    }
  });
}

// Academic Years Routes
export function registerAcademicYearsRoutes(app: Express) {
  // Get all academic terms
  app.get('/api/academic-terms', async (req: Request, res: Response) => {
    try {
      const { academicYearId, status } = req.query;
      
      let query = db.select().from(academicTerms);
      const conditions = [];

      if (academicYearId) conditions.push(eq(academicTerms.academicYearId, parseInt(academicYearId as string)));
      if (status) conditions.push(eq(academicTerms.status, status as string));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const terms = await query.orderBy(desc(academicTerms.createdAt));
      res.json(terms);
    } catch (error) {
      console.error('Error fetching academic terms:', error);
      res.status(500).json({ error: 'Failed to fetch academic terms' });
    }
  });

  // Create new academic term
  app.post('/api/academic-terms', async (req: Request, res: Response) => {
    try {
      const { 
        name, 
        nameBn, 
        academicYearId, 
        startDate, 
        endDate, 
        description, 
        descriptionBn 
      } = req.body;
      
      const [term] = await db.insert(academicTerms).values({
        name,
        nameBn,
        academicYearId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        descriptionBn,
        status: 'upcoming'
      }).returning();

      res.json(term);
    } catch (error) {
      console.error('Error creating academic term:', error);
      res.status(500).json({ error: 'Failed to create academic term' });
    }
  });

  // Update term status
  app.patch('/api/academic-terms/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, examScheduled, resultPublished } = req.body;

      const [updatedTerm] = await db.update(academicTerms)
        .set({ 
          status,
          examScheduled,
          resultPublished
        })
        .where(eq(academicTerms.id, parseInt(id)))
        .returning();

      res.json(updatedTerm);
    } catch (error) {
      console.error('Error updating academic term:', error);
      res.status(500).json({ error: 'Failed to update academic term' });
    }
  });
}

// School Settings Routes
export function registerSchoolSettingsRoutes(app: Express) {
  // Get school settings
  app.get('/api/school/settings', async (req: Request, res: Response) => {
    try {
      const settings = await db.select().from(schoolSettings).limit(1);
      res.json(settings[0] || null);
    } catch (error) {
      console.error('Error fetching school settings:', error);
      res.status(500).json({ error: 'Failed to fetch school settings' });
    }
  });

  // Update school info
  app.put('/api/school/info', async (req: Request, res: Response) => {
    try {
      const updateData = req.body;
      
      const [updatedSettings] = await db.update(schoolSettings)
        .set({ 
          ...updateData,
          updatedAt: new Date()
        })
        .returning();

      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating school info:', error);
      res.status(500).json({ error: 'Failed to update school info' });
    }
  });

  // Update school branding
  app.put('/api/school/branding', async (req: Request, res: Response) => {
    try {
      const { primaryColor, secondaryColor, accentColor, motto, mottoBn, useWatermark, useLetterhead } = req.body;
      
      const [updatedSettings] = await db.update(schoolSettings)
        .set({ 
          primaryColor,
          secondaryColor,
          accentColor,
          motto,
          mottoBn,
          useWatermark,
          useLetterhead,
          updatedAt: new Date()
        })
        .returning();

      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating school branding:', error);
      res.status(500).json({ error: 'Failed to update school branding' });
    }
  });
}

// Admin Settings Routes
export function registerAdminSettingsRoutes(app: Express) {
  // Get admin profile
  app.get('/api/admin/profile', async (req: Request, res: Response) => {
    try {
      const adminUsers = await db.select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      }).from(users).where(eq(users.role, 'admin'));
      
      res.json(adminUsers);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({ error: 'Failed to fetch admin profile' });
    }
  });

  // Update admin profile
  app.put('/api/admin/profile', async (req: Request, res: Response) => {
    try {
      const { id, name, email, username } = req.body;
      
      const [updatedUser] = await db.update(users)
        .set({ name, email, username })
        .where(eq(users.id, id))
        .returning();

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating admin profile:', error);
      res.status(500).json({ error: 'Failed to update admin profile' });
    }
  });

  // Get system statistics
  app.get('/api/admin/stats', async (req: Request, res: Response) => {
    try {
      const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
      const totalPayments = await db.select({ sum: sql`sum(${paymentTransactions.amount})` })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.status, 'success'));
      
      const totalConferences = await db.select({ count: sql`count(*)` }).from(videoConferences);
      const totalNotifications = await db.select({ count: sql`count(*)` }).from(notifications);

      res.json({
        totalUsers: totalUsers[0].count,
        totalRevenue: totalPayments[0].sum || 0,
        totalConferences: totalConferences[0].count,
        totalNotifications: totalNotifications[0].count,
        systemUptime: 99.9,
        monthlyGrowth: 15.8
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  });
}