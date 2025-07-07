import { Express, Request, Response } from 'express';
import { supabase } from '../shared/supabase';

// Video Conference Routes with Supabase
export function registerSupabaseVideoConferenceRoutes(app: Express) {
  // Get all video conferences
  app.get('/api/video-conferences', async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('video_conferences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching video conferences:', error);
      res.status(500).json({ error: 'Failed to fetch video conferences' });
    }
  });

  // Create new video conference
  app.post('/api/video-conferences', async (req: Request, res: Response) => {
    try {
      const { name, nameBn, subject, host, startTime, maxParticipants } = req.body;
      
      const { data, error } = await supabase
        .from('video_conferences')
        .insert({
          name,
          name_bn: nameBn,
          subject,
          host,
          start_time: startTime,
          max_participants: maxParticipants,
          meeting_id: `MEET_${Date.now()}`,
          status: 'upcoming'
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
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

      const { data, error } = await supabase
        .from('video_conferences')
        .update({ 
          status, 
          is_recording: isRecording,
          end_time: status === 'ended' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating video conference:', error);
      res.status(500).json({ error: 'Failed to update video conference' });
    }
  });
}

// Enhanced Notifications Routes with Supabase
export function registerSupabaseNotificationsRoutes(app: Express) {
  // Get all notifications
  app.get('/api/enhanced-notifications', async (req: Request, res: Response) => {
    try {
      const { priority, type, isRead } = req.query;
      
      let query = supabase.from('enhanced_notifications').select('*');
      
      if (priority) query = query.eq('priority', priority);
      if (type) query = query.eq('type', type);
      if (isRead !== undefined) query = query.eq('is_read', isRead === 'true');

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Create new notification
  app.post('/api/enhanced-notifications', async (req: Request, res: Response) => {
    try {
      const { title, titleBn, message, messageBn, type, priority, userId } = req.body;
      
      const { data, error } = await supabase
        .from('enhanced_notifications')
        .insert({
          title,
          title_bn: titleBn,
          message,
          message_bn: messageBn,
          type: type || 'info',
          priority: priority || 'medium',
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  // Mark notification as read
  app.patch('/api/enhanced-notifications/:id/read', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('enhanced_notifications')
        .update({ 
          is_read: true
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });
}

// Payment Gateway Routes with Supabase
export function registerSupabasePaymentRoutes(app: Express) {
  // Get all payment transactions
  app.get('/api/enhanced-payments', async (req: Request, res: Response) => {
    try {
      const { status, paymentMethod } = req.query;
      
      let query = supabase.from('payment_transactions').select('*');
      
      if (status) query = query.eq('status', status);
      if (paymentMethod) query = query.eq('payment_method', paymentMethod);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  // Create new payment transaction
  app.post('/api/enhanced-payments', async (req: Request, res: Response) => {
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
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          transaction_id: `TXN_${Date.now()}`,
          amount,
          payment_method: paymentMethod,
          payer_name: payerName,
          payer_phone: payerPhone,
          description,
          description_bn: descriptionBn,
          student_id: studentId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  });

  // Update payment status
  app.patch('/api/enhanced-payments/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { data, error } = await supabase
        .from('payment_transactions')
        .update({ 
          status,
          completed_at: status === 'success' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ error: 'Failed to update payment' });
    }
  });

  // Get payment statistics
  app.get('/api/enhanced-payments/stats', async (req: Request, res: Response) => {
    try {
      const { data: allTransactions, error: allError } = await supabase
        .from('payment_transactions')
        .select('id, amount, status');

      if (allError) throw allError;

      const totalTransactions = allTransactions?.length || 0;
      const successfulTransactions = allTransactions?.filter(t => t.status === 'success').length || 0;
      const totalAmount = allTransactions?.filter(t => t.status === 'success')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      res.json({
        totalTransactions,
        successfulTransactions,
        totalAmount
      });
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      res.status(500).json({ error: 'Failed to fetch payment stats' });
    }
  });
}

// Document Templates Routes with Supabase
export function registerSupabaseTemplatesRoutes(app: Express) {
  // Get all document templates
  app.get('/api/enhanced-templates', async (req: Request, res: Response) => {
    try {
      const { type, category, isActive } = req.query;
      
      let query = supabase.from('document_templates').select('*');
      
      if (type) query = query.eq('type', type);
      if (category) query = query.eq('category', category);
      if (isActive !== undefined) query = query.eq('is_active', isActive === 'true');

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  // Create new template
  app.post('/api/enhanced-templates', async (req: Request, res: Response) => {
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
      
      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          name,
          name_bn: nameBn,
          type,
          description,
          description_bn: descriptionBn,
          category,
          category_bn: categoryBn,
          settings,
          created_by: createdBy,
          tags,
          is_default: false,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  });

  // Toggle template favorite
  app.patch('/api/enhanced-templates/:id/favorite', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isFavorite } = req.body;

      const { data, error } = await supabase
        .from('document_templates')
        .update({ is_favorite: isFavorite })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating template favorite:', error);
      res.status(500).json({ error: 'Failed to update template favorite' });
    }
  });
}

// Academic Terms Routes with Supabase
export function registerSupabaseAcademicTermsRoutes(app: Express) {
  // Get all academic terms
  app.get('/api/enhanced-academic-terms', async (req: Request, res: Response) => {
    try {
      const { academicYearId, status } = req.query;
      
      let query = supabase.from('academic_terms').select('*');
      
      if (academicYearId) query = query.eq('academic_year_id', academicYearId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching academic terms:', error);
      res.status(500).json({ error: 'Failed to fetch academic terms' });
    }
  });

  // Create new academic term
  app.post('/api/enhanced-academic-terms', async (req: Request, res: Response) => {
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
      
      const { data, error } = await supabase
        .from('academic_terms')
        .insert({
          name,
          name_bn: nameBn,
          academic_year_id: academicYearId,
          start_date: startDate,
          end_date: endDate,
          description,
          description_bn: descriptionBn,
          status: 'upcoming'
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error creating academic term:', error);
      res.status(500).json({ error: 'Failed to create academic term' });
    }
  });

  // Update academic term
  app.patch('/api/enhanced-academic-terms/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const { data, error } = await supabase
        .from('academic_terms')
        .update({
          name: updateData.name,
          name_bn: updateData.nameBn,
          academic_year_id: updateData.academicYearId,
          start_date: updateData.startDate,
          end_date: updateData.endDate,
          description: updateData.description,
          description_bn: updateData.descriptionBn,
          status: updateData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating academic term:', error);
      res.status(500).json({ error: 'Failed to update academic term' });
    }
  });

  // Delete academic term
  app.delete('/api/enhanced-academic-terms/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const { error } = await supabase
        .from('academic_terms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ message: 'Academic term deleted successfully' });
    } catch (error) {
      console.error('Error deleting academic term:', error);
      res.status(500).json({ error: 'Failed to delete academic term' });
    }
  });

  // Toggle academic term status
  app.patch('/api/enhanced-academic-terms/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const { data, error } = await supabase
        .from('academic_terms')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating academic term status:', error);
      res.status(500).json({ error: 'Failed to update term status' });
    }
  });
}

// School Settings Routes with Supabase
export function registerSupabaseSchoolSettingsRoutes(app: Express) {
  // Get school settings
  app.get('/api/enhanced-school/settings', async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      res.json(data || null);
    } catch (error) {
      console.error('Error fetching school settings:', error);
      res.status(500).json({ error: 'Failed to fetch school settings' });
    }
  });

  // Update school info
  app.put('/api/enhanced-school/info', async (req: Request, res: Response) => {
    try {
      const updateData = req.body;
      
      const { data, error } = await supabase
        .from('school_settings')
        .upsert({ 
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating school info:', error);
      res.status(500).json({ error: 'Failed to update school info' });
    }
  });

  // Update school branding
  app.put('/api/enhanced-school/branding', async (req: Request, res: Response) => {
    try {
      const { primaryColor, secondaryColor, accentColor, motto, mottoBn, useWatermark, useLetterhead } = req.body;
      
      const { data, error } = await supabase
        .from('school_settings')
        .upsert({ 
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
          motto,
          motto_bn: mottoBn,
          use_watermark: useWatermark,
          use_letterhead: useLetterhead,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating school branding:', error);
      res.status(500).json({ error: 'Failed to update school branding' });
    }
  });
}