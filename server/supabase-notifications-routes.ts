import { Express, Request, Response } from "express";
import { supabase } from "../shared/supabase";

export function registerSupabaseNotificationRoutes(app: Express) {
  // Get all notifications
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      console.log('Raw notifications from Supabase:', notifications?.slice(0, 2));

      const formattedNotifications = notifications?.map(notification => ({
        id: notification.id,
        title: notification.title,
        titleBn: notification.title_bn,
        message: notification.message,
        messageBn: notification.message_bn,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        categoryBn: notification.category_bn,
        isRead: notification.is_read,
        isLive: notification.is_live || false,
        actionRequired: notification.action_required,
        sender: notification.sender,
        createdAt: notification.created_at
      })) || [];

      res.json(formattedNotifications);
    } catch (error) {
      console.error('Notifications fetch error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch notifications' 
      });
    }
  });

  // Get live notifications specifically
  app.get("/api/notifications/live", async (req: Request, res: Response) => {
    try {
      // Since is_live column doesn't exist yet, get recent notifications as "live"
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedNotifications = notifications?.map(notification => ({
        id: notification.id,
        title: notification.title,
        titleBn: notification.title_bn,
        message: notification.message,
        messageBn: notification.message_bn,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        categoryBn: notification.category_bn,
        isRead: notification.is_read,
        isLive: true, // Treat all recent notifications as live for now
        actionRequired: notification.action_required,
        sender: notification.created_by ? `User ${notification.created_by}` : 'System',
        createdAt: notification.created_at
      })) || [];

      res.json(formattedNotifications);
    } catch (error) {
      console.error('Live notifications fetch error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch live notifications' 
      });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const { data: updatedNotification, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: updatedNotification
      });
    } catch (error) {
      console.error('Notification update error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update notification' 
      });
    }
  });

  // Create new notification
  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      const { data: newNotification, error } = await supabase
        .from('notifications')
        .insert([{
          title: req.body.title,
          title_bn: req.body.titleBn,
          message: req.body.message,
          message_bn: req.body.messageBn,
          type: req.body.type || 'info',
          priority: req.body.priority || 'medium',
          category: req.body.category,
          category_bn: req.body.categoryBn,
          recipient_id: req.body.recipientId,
          sender: req.body.sender,
          action_required: req.body.actionRequired || false
        }])
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: newNotification
      });
    } catch (error) {
      console.error('Notification creation error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create notification' 
      });
    }
  });

  // Get notification statistics
  app.get("/api/notifications/stats", async (req: Request, res: Response) => {
    try {
      const { count: totalNotifications } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

      const { count: unreadNotifications } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      const { count: actionRequired } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('action_required', true)
        .eq('is_read', false);

      res.json({
        success: true,
        data: {
          total: totalNotifications || 0,
          unread: unreadNotifications || 0,
          actionRequired: actionRequired || 0
        }
      });
    } catch (error) {
      console.error('Notification stats error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch notification statistics' 
      });
    }
  });

  // Delete multiple notifications (bulk delete)
  app.delete("/api/notifications/delete", async (req: Request, res: Response) => {
    try {
      const { notificationIds }: { notificationIds: number[] } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "বিজ্ঞপ্তি ID প্রয়োজন। Notification IDs required."
        });
      }

      console.log('Attempting to delete notification IDs:', notificationIds);

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)
        .select();

      console.log('Delete operation result:', { data, error });

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      res.json({
        success: true,
        message: `${notificationIds.length} বিজ্ঞপ্তি মুছে ফেলা হয়েছে! notifications deleted!`,
        deletedCount: data?.length || 0
      });
    } catch (error) {
      console.error('Bulk notification deletion error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete notifications' 
      });
    }
  });

  // Delete single notification
  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'বিজ্ঞপ্তি মুছে ফেলা হয়েছে! Notification deleted!'
      });
    } catch (error) {
      console.error('Single notification deletion error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete notification' 
      });
    }
  });
}