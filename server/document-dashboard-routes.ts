import { Express, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

// Template icon mapping function
function getTemplateIcon(category: string, type: string): string {
  const iconMap: Record<string, string> = {
    // Academic
    'academic': '📚',
    'id_card': '🆔',
    'transcript': '📋',
    'progress_report': '📊',
    'routine': '📅',
    'report_card': '📑',
    'attendance_certificate': '✅',
    'study_certificate': '📜',
    'science_fair': '🔬',
    'language_certificate': '🗣️',
    
    // Examination
    'examination': '📝',
    'admit_card': '🎫',
    'mark_sheet': '📊',
    'exam_schedule': '⏰',
    
    // Certificates
    'certificate': '🏆',
    'excellence_certificate': '🥇',
    'participation_certificate': '🎖️',
    'sports_certificate': '⚽',
    'competition_certificate': '🏅',
    'graduation_certificate': '🎓',
    
    // Administrative
    'administrative': '📋',
    'character_certificate': '✨',
    'transfer_certificate': '↗️',
    'bonafide_certificate': '✅',
    'leave_application': '📄',
    'conduct_certificate': '👍',
    'migration_certificate': '🔄',
    'age_certificate': '📅',
    'name_change': '✏️',
    
    // Financial
    'financial': '💰',
    'fee_receipt': '🧾',
    'scholarship_certificate': '💰',
    'fee_waiver': '💸',
    
    // Library
    'library': '📚',
    'library_card': '📚',
    'book_receipt': '📖',
    
    // Medical
    'medical': '🏥',
    'medical_certificate': '🩺',
    'health_card': '💊',
    
    // Transport
    'transport': '🚌',
    'bus_pass': '🚌',
    
    // Staff
    'staff': '👨‍🏫',
    'teacher_id': '👩‍🏫',
    'staff_certificate': '📋',
    
    // Event
    'event': '🎉',
    'invitation': '💌',
    
    // Digital
    'digital': '💻',
    'online_certificate': '🖥️',
    'portfolio': '💼',
    
    // Communication
    'communication': '📢',
    'meeting_notice': '📅',
    
    // Other categories
    'extracurricular': '🎭',
    'safety': '🦺',
    'technology': '💻',
    'cultural': '🎨',
    'service': '🤝',
    'research': '🔬',
    'international': '🌍',
    'recognition': '🏆',
    'graduation': '🎓',
    'alumni': '👥'
  };
  
  return iconMap[type] || iconMap[category] || '📄';
}

// Create admin Supabase client instance
const createAdminSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export function registerDocumentDashboardRoutes(app: Express) {
  // Get document templates
  app.get('/api/documents/templates', async (req: Request, res: Response) => {
    try {
      const adminSupabase = createAdminSupabase();

      // Fetch all document templates from database
      const { data: templates, error } = await adminSupabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('popularity_score', { ascending: false });

      if (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ error: 'Failed to fetch templates from database' });
      }

      if (templates && templates.length > 0) {
        console.log(`✓ Successfully loaded ${templates.length} document templates from database`);
        
        // Transform the data to match frontend expectations
        const transformedTemplates = templates.map((template: any) => ({
          ...template,
          nameBn: template.name_bn,
          descriptionBn: template.description_bn,
          creditsRequired: template.credit_cost || 1,
          isPopular: (template.popularity_score || 0) > 70,
          usageCount: template.usage_count || 0,
          documentId: template.id,
          icon: getTemplateIcon(template.category, template.type),
          difficulty: (template.credit_cost || 1) <= 2 ? 'easy' : (template.credit_cost || 1) <= 4 ? 'medium' : 'advanced',
          estimatedTime: (template.credit_cost || 1) <= 2 ? '১-২ মিনিট' : (template.credit_cost || 1) <= 4 ? '২-৩ মিনিট' : '৩-৫ মিনিট'
        }));
        
        return res.json(transformedTemplates);
      }

      // Return empty array if no templates found
      console.warn('No templates found in database');
      return res.json([]);

    } catch (error: any) {
      console.error('Templates fetch error:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  });

  // Get user document stats
  app.get('/api/documents/user-stats', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.json({
          totalGenerated: 0,
          creditsUsed: 0,
          creditsRemaining: 0,
          monthlyLimit: 500,
          monthlyUsed: 0
        });
      }

      const adminSupabase = createAdminSupabase();

      // Get user's total documents generated
      const { count: totalGenerated } = await adminSupabase
        .from('generated_documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get user's current credits
      const { data: userInfo } = await adminSupabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      // Get monthly usage (documents generated this month)
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const { count: monthlyGenerated } = await adminSupabase
        .from('generated_documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('generated_at', firstDayOfMonth.toISOString());

      const stats = {
        totalGenerated: totalGenerated || 0,
        creditsUsed: 0, // We can calculate this later if needed
        creditsRemaining: userInfo?.credits || 0,
        monthlyLimit: 500,
        monthlyUsed: monthlyGenerated || 0
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching user document stats:', error);
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  });

  // Get recent generated documents
  app.get('/api/documents/recent', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.json([]);
      }

      const adminSupabase = createAdminSupabase();
      
      const { data: documents, error } = await adminSupabase
        .from('generated_documents')
        .select(`
          *,
          document_templates(name, category)
        `)
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent documents:', error);
        return res.status(500).json({ error: 'Failed to fetch recent documents' });
      }

      res.json(documents || []);
    } catch (error: any) {
      console.error('Error fetching recent documents:', error);
      return res.status(500).json({ error: 'Failed to fetch recent documents' });
    }
  });

  // Generate a new document
  app.post('/api/documents/generate', async (req: Request, res: Response) => {
    try {
      const { templateId, data: documentData } = req.body;
      const userId = (req as any).user?.id;

      if (!userId || !templateId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const adminSupabase = createAdminSupabase();

      // Get template details
      const { data: template, error: templateError } = await adminSupabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError || !template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Create new generated document
      const { data: newDocument, error: insertError } = await adminSupabase
        .from('generated_documents')
        .insert({
          user_id: userId,
          template_id: templateId,
          data: documentData,
          status: 'completed',
          generated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating document:', insertError);
        return res.status(500).json({ error: 'Failed to generate document' });
      }

      // Update template usage stats
      await adminSupabase
        .from('document_templates')
        .update({ 
          usage_count: (template.usage_count || 0) + 1,
          last_used: new Date().toISOString()
        })
        .eq('id', templateId);

      res.json({ 
        success: true, 
        document: newDocument,
        message: 'Document generated successfully' 
      });
    } catch (error: any) {
      console.error('Error generating document:', error);
      return res.status(500).json({ error: 'Failed to generate document' });
    }
  });

  // Seed document templates
  app.post('/api/documents/seed-templates', async (req: Request, res: Response) => {
    try {
      const sampleTemplates = [
        {
          name: 'Student ID Card',
          name_bn: 'ছাত্র পরিচয়পত্র',
          category: 'identity',
          type: 'id_card',
          description: 'Generate student identification cards',
          description_bn: 'ছাত্র পরিচয়পত্র তৈরি করুন',
          template: {
            fields: ['name', 'studentId', 'class', 'section', 'photo'],
            layout: 'standard_id_card'
          },
          is_active: true,
          credit_cost: 2,
          popularity_score: 95
        },
        {
          name: 'Admit Card',
          name_bn: 'প্রবেশপত্র',
          category: 'examination',
          type: 'admit_card',
          description: 'Generate examination admit cards',
          description_bn: 'পরীক্ষার প্রবেশপত্র তৈরি করুন',
          template: {
            fields: ['name', 'rollNumber', 'examName', 'examDate', 'center'],
            layout: 'admit_card_layout'
          },
          is_active: true,
          credit_cost: 3,
          popularity_score: 88
        },
        {
          name: 'Certificate',
          name_bn: 'সনদপত্র',
          category: 'certificate',
          type: 'certificate',
          description: 'Generate various certificates',
          description_bn: 'বিভিন্ন সনদপত্র তৈরি করুন',
          template: {
            fields: ['recipientName', 'certificateType', 'date', 'authority'],
            layout: 'certificate_layout'
          },
          is_active: true,
          credit_cost: 5,
          popularity_score: 82
        }
      ];

      const adminSupabase = createAdminSupabase();
      
      const { data, error } = await adminSupabase
        .from('document_templates')
        .upsert(sampleTemplates, { onConflict: 'name' })
        .select();

      if (error) {
        console.error('Error seeding templates:', error);
        return res.status(500).json({ error: 'Failed to seed templates' });
      }

      res.json({ 
        success: true, 
        count: data?.length || 0,
        message: 'Templates seeded successfully' 
      });
    } catch (error: any) {
      console.error('Error seeding templates:', error);
      return res.status(500).json({ error: 'Failed to seed templates' });
    }
  });

  // Track document usage
  app.post('/api/documents/track-usage', async (req: Request, res: Response) => {
    try {
      const { templateId, action } = req.body;
      const userId = (req as any).user?.id;

      if (!templateId || !action) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Update template stats based on action
      if (action === 'view') {
        await supabase
          .from('document_templates')
          .update({ last_used: new Date().toISOString() })
          .eq('id', templateId);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error tracking usage:', error);
      return res.status(500).json({ error: 'Failed to track usage' });
    }
  });
}