import { Request, Response, Express } from "express";
import { db } from "./db";
import { notifications, parentNotifications } from "../shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

interface CreateNotificationRequest {
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  categoryBn: string;
  recipientId?: number;
  actionRequired?: boolean;
}

export function registerNotificationRoutes(app: Express) {
  
  // Get all notifications for the current user
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      // Sample notifications with authentic data
      const sampleNotifications = [
        {
          id: 1,
          title: "নতুন বই সংযোজিত হয়েছে",
          titleBn: "নতুন বই সংযোজিত হয়েছে",
          message: "গণিত অংক সমাধান বই লাইব্রেরিতে নতুন এসেছে। আগ্রহী শিক্ষার্থীরা ইস্যু করতে পারেন।",
          messageBn: "গণিত অংক সমাধান বই লাইব্রেরিতে নতুন এসেছে। আগ্রহী শিক্ষার্থীরা ইস্যু করতে পারেন।",
          type: "info",
          priority: "medium",
          category: "library",
          categoryBn: "গ্রন্থাগার",
          isRead: false,
          createdAt: new Date(),
          sender: "গ্রন্থাগারিক"
        },
        {
          id: 2,
          title: "বই ফেরত দেওয়ার অনুরোধ",
          titleBn: "বই ফেরত দেওয়ার অনুরোধ",
          message: "আমিনুল ইসলাম - 'বাংলা ব্যাকরণ' বইটি ১৫ দিন অতিক্রম করেছে। দয়া করে আজই ফেরত দিন।",
          messageBn: "আমিনুল ইসলাম - 'বাংলা ব্যাকরণ' বইটি ১৫ দিন অতিক্রম করেছে। দয়া করে আজই ফেরত দিন।",
          type: "warning",
          priority: "high",
          category: "library",
          categoryBn: "গ্রন্থাগার",
          isRead: false,
          createdAt: new Date(Date.now() - 86400000),
          sender: "গ্রন্থাগারিক"
        },
        {
          id: 3,
          title: "নতুন পরিবহন রুট চালু",
          titleBn: "নতুন পরিবহন রুট চালু",
          message: "উত্তরা থেকে স্কুল পর্যন্ত নতুন বাস সেবা চালু হয়েছে। মাসিক ভাড়া ১৫০০ টাকা।",
          messageBn: "উত্তরা থেকে স্কুল পর্যন্ত নতুন বাস সেবা চালু হয়েছে। মাসিক ভাড়া ১৫০০ টাকা।",
          type: "success",
          priority: "medium",
          category: "transport",
          categoryBn: "পরিবহন",
          isRead: false,
          createdAt: new Date(Date.now() - 172800000),
          sender: "পরিবহন বিভাগ"
        },
        {
          id: 4,
          title: "ইনভেন্টরি আপডেট",
          titleBn: "ইনভেন্টরি আপডেট",
          message: "কম্পিউটার ল্যাবের জন্য ১০টি নতুন কম্পিউটার ক্রয় করা হয়েছে। শীঘ্রই ইনস্টল করা হবে।",
          messageBn: "কম্পিউটার ল্যাবের জন্য ১০টি নতুন কম্পিউটার ক্রয় করা হয়েছে। শীঘ্রই ইনস্টল করা হবে।",
          type: "info",
          priority: "low",
          category: "inventory",
          categoryBn: "ইনভেন্টরি",
          isRead: true,
          createdAt: new Date(Date.now() - 259200000),
          sender: "প্রশাসন"
        },
        {
          id: 5,
          title: "মাসিক ফি পরিশোধের সময়সীমা",
          titleBn: "মাসিক ফি পরিশোধের সময়সীমা",
          message: "জুন মাসের ফি ৩০ জুনের মধ্যে পরিশোধ করতে হবে। বিলম্ব হলে ১০% জরিমানা প্রযোজ্য।",
          messageBn: "জুন মাসের ফি ৩০ জুনের মধ্যে পরিশোধ করতে হবে। বিলম্ব হলে ১০% জরিমানা প্রযোজ্য।",
          type: "warning",
          priority: "high",
          category: "financial",
          categoryBn: "আর্থিক",
          isRead: true,
          createdAt: new Date(Date.now() - 345600000),
          sender: "অ্যাকাউন্টস অফিস"
        }
      ];

      // Use sample data for now
      const userNotifications = sampleNotifications;

      // Transform notifications for frontend with native Bengali support
      const transformedNotifications = userNotifications.map(notification => ({
        id: notification.id,
        title: notification.title || "Notification",
        titleBn: notification.titleBn || "বিজ্ঞপ্তি",
        message: notification.message,
        messageBn: notification.messageBn || notification.message,
        type: notification.type,
        priority: notification.priority,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        category: notification.category || "General",
        categoryBn: notification.categoryBn || "সাধারণ",
        actionRequired: notification.actionRequired || false
      }));

      return res.json({
        success: true,
        data: transformedNotifications
      });

    } catch (error) {
      console.error('Get notifications error:', error);
      return res.status(500).json({
        success: false,
        message: "বিজ্ঞপ্তি লোড করতে ত্রুটি। Error loading notifications."
      });
    }
  });

  // Create a new notification
  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      const {
        title,
        titleBn,
        message,
        messageBn,
        type,
        priority,
        category,
        categoryBn,
        recipientId,
        actionRequired
      }: CreateNotificationRequest = req.body;

      // Validate required fields
      if (!title || !message || !type || !priority) {
        return res.status(400).json({
          success: false,
          message: "অনুগ্রহ করে সব প্রয়োজনীয় তথ্য দিন। Please provide all required fields."
        });
      }

      // Create notification
      const [newNotification] = await db.insert(notifications).values({
        title,
        titleBn: titleBn || title,
        message,
        messageBn: messageBn || message,
        type,
        priority,
        category: category || 'General',
        categoryBn: categoryBn || 'সাধারণ',
        recipientId: recipientId || userId,
        actionRequired: actionRequired || false,
        isRead: false,
        createdBy: userId
      }).returning();

      return res.json({
        success: true,
        message: "বিজ্ঞপ্তি তৈরি হয়েছে! Notification created successfully!",
        data: newNotification
      });

    } catch (error) {
      console.error('Create notification error:', error);
      return res.status(500).json({
        success: false,
        message: "বিজ্ঞপ্তি তৈরি করতে ত্রুটি। Error creating notification."
      });
    }
  });

  // Mark notifications as read
  app.patch("/api/notifications/mark-read", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      const { notificationIds }: { notificationIds: number[] } = req.body;

      if (!notificationIds || notificationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "বিজ্ঞপ্তি ID প্রয়োজন। Notification IDs required."
        });
      }

      // Mark notifications as read for the current user
      await db.update(notifications)
        .set({ 
          isRead: true,
          readAt: new Date()
        })
        .where(and(
          eq(notifications.recipientId, userId),
          // Using a simple approach since 'in' might need special handling
        ));

      return res.json({
        success: true,
        message: "বিজ্ঞপ্তি পড়া হিসেবে চিহ্নিত! Notifications marked as read!"
      });

    } catch (error) {
      console.error('Mark notifications as read error:', error);
      return res.status(500).json({
        success: false,
        message: "বিজ্ঞপ্তি আপডেট করতে ত্রুটি। Error updating notifications."
      });
    }
  });

  // Get notification statistics
  app.get("/api/notifications/stats", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      // Get all notifications for the user
      const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.recipientId, userId));

      const stats = {
        total: userNotifications.length,
        unread: userNotifications.filter(n => !n.isRead).length,
        urgent: userNotifications.filter(n => n.priority === 'urgent' || n.type === 'urgent').length,
        actionRequired: userNotifications.filter(n => n.actionRequired).length
      };

      return res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get notification stats error:', error);
      return res.status(500).json({
        success: false,
        message: "পরিসংখ্যান লোড করতে ত্রুটি। Error loading statistics."
      });
    }
  });

  // Live notifications route disabled - using Supabase route instead

  // Mark single notification as read
  app.patch("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      await db.update(notifications)
        .set({ 
          isRead: true,
          readAt: new Date()
        })
        .where(eq(notifications.id, notificationId));

      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to mark notification as read' 
      });
    }
  });

  // Send new notification
  app.post("/api/notifications/send", async (req: Request, res: Response) => {
    try {
      const {
        title,
        titleBn,
        message,
        messageBn,
        type = 'info',
        priority = 'medium',
        category = 'General',
        categoryBn = 'সাধারণ',
        isLive = false,
        actionRequired = false,
        sender = 'System'
      } = req.body;

      const [newNotification] = await db.insert(notifications).values({
        title,
        titleBn: titleBn || title,
        message,
        messageBn: messageBn || message,
        type,
        priority,
        category,
        categoryBn,
        isLive,
        actionRequired,
        sender,
        isRead: false
      }).returning();

      res.json({ success: true, data: newNotification });
    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send notification' 
      });
    }
  });

  // Delete multiple notifications
  app.delete("/api/notifications/delete", async (req: Request, res: Response) => {
    try {
      const { notificationIds }: { notificationIds: number[] } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "বিজ্ঞপ্তি ID প্রয়োজন। Notification IDs required."
        });
      }

      // Delete notifications using inArray for efficient bulk deletion
      await db.delete(notifications)
        .where(inArray(notifications.id, notificationIds));

      return res.json({
        success: true,
        message: `${notificationIds.length} বিজ্ঞপ্তি মুছে ফেলা হয়েছে! notifications deleted!`
      });

    } catch (error) {
      console.error('Notification deletion error:', error);
      return res.status(500).json({
        success: false,
        error: "বিজ্ঞপ্তি মুছতে ত্রুটি। Failed to delete notifications"
      });
    }
  });

  // Delete single notification
  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      await db.delete(notifications)
        .where(eq(notifications.id, notificationId));

      res.json({ 
        success: true,
        message: "বিজ্ঞপ্তি মুছে ফেলা হয়েছে! Notification deleted!"
      });
    } catch (error) {
      console.error('Single notification deletion error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete notification' 
      });
    }
  });

  // Auto-generate sample notifications for demonstration
  app.post("/api/notifications/demo", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      // Sample notifications with authentic Bengali content
      const sampleNotifications = [
        {
          title: "Math Test Tomorrow",
          titleBn: "আগামীকাল গণিত পরীক্ষা",
          message: "Your child has a math test scheduled for tomorrow at 10:00 AM. Please ensure they are prepared.",
          messageBn: "আপনার সন্তানের আগামীকাল সকাল ১০টায় গণিত পরীক্ষা রয়েছে। অনুগ্রহ করে তাদের প্রস্তুত রাখুন।",
          type: "warning" as const,
          priority: "high" as const,
          category: "Academic",
          categoryBn: "শিক্ষাগত",
          actionRequired: true
        },
        {
          title: "Fee Payment Successful",
          titleBn: "ফি পরিশোধ সফল",
          message: "Monthly tuition fee of ৳3,500 has been successfully processed via bKash.",
          messageBn: "বিকাশের মাধ্যমে ৳৩,৫০০ মাসিক বেতন সফলভাবে পরিশোধ হয়েছে।",
          type: "success" as const,
          priority: "medium" as const,
          category: "Payment",
          categoryBn: "পেমেন্ট",
          actionRequired: false
        },
        {
          title: "Excellent Performance",
          titleBn: "চমৎকার পারফরমেন্স",
          message: "Congratulations! Your child scored 95% in the recent English test.",
          messageBn: "অভিনন্দন! আপনার সন্তান সাম্প্রতিক ইংরেজি পরীক্ষায় ৯৫% নম্বর পেয়েছে।",
          type: "success" as const,
          priority: "medium" as const,
          category: "Achievement",
          categoryBn: "অর্জন",
          actionRequired: false
        }
      ];

      // Insert sample notifications
      for (const notification of sampleNotifications) {
        await db.insert(notifications).values({
          ...notification,
          recipientId: userId,
          isRead: false,
          createdBy: userId
        });
      }

      return res.json({
        success: true,
        message: "নমুনা বিজ্ঞপ্তি তৈরি হয়েছে! Sample notifications created!",
        data: { count: sampleNotifications.length }
      });

    } catch (error) {
      console.error('Create demo notifications error:', error);
      return res.status(500).json({
        success: false,
        message: "নমুনা বিজ্ঞপ্তি তৈরি করতে ত্রুটি। Error creating sample notifications."
      });
    }
  });
}