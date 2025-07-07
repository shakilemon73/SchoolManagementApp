import { Express, Request, Response } from 'express';
import { supabase } from '../shared/supabase';

interface DocumentTemplate {
  id: number;
  name: string;
  name_bn: string;
  type: string;
  category: string;
  description: string;
  description_bn: string;
  icon: string;
  required_credits: number;
  usage_count: number;
  last_used: string;
  difficulty: string;
  estimated_time: string;
  is_active: boolean;
  is_popular: boolean;
}

export function registerSupabaseDocumentDashboard(app: Express) {
  
  // Get document templates from Supabase
  app.get('/api/supabase/documents/templates', async (req: Request, res: Response) => {
    try {
      const { category, search, isActive, lang } = req.query;
      
      let query = supabase
        .from('document_templates')
        .select(`
          id,
          name,
          name_bn,
          type,
          category,
          description,
          description_bn,
          icon,
          required_credits,
          usage_count,
          last_used,
          difficulty,
          estimated_time,
          is_active,
          is_popular
        `);

      // Add filters
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (isActive !== undefined) {
        query = query.eq('is_active', isActive === 'true');
      }

      // Execute query
      const { data: templates, error } = await query
        .order('is_popular', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Process templates for language preference
      const processedTemplates = templates?.map(template => {
        const isBengali = lang === 'bn';
        return {
          id: template.id,
          documentId: template.type,
          name: isBengali && template.name_bn ? template.name_bn : template.name,
          nameBn: template.name_bn,
          category: template.category,
          description: isBengali && template.description_bn ? template.description_bn : template.description,
          descriptionBn: template.description_bn,
          icon: template.icon,
          creditsRequired: template.required_credits || 1,
          usageCount: template.usage_count || 0,
          lastUsed: template.last_used,
          difficulty: template.difficulty,
          estimatedTime: template.estimated_time,
          isActive: template.is_active,
          isPopular: template.is_popular,
          generated: 0 // Default value for compatibility
        };
      }) || [];

      // Filter by search if provided
      let filteredTemplates = processedTemplates;
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredTemplates = processedTemplates.filter(template => 
          template.name?.toLowerCase().includes(searchTerm) ||
          template.description?.toLowerCase().includes(searchTerm)
        );
      }

      res.json(filteredTemplates);
    } catch (error) {
      console.error('Error fetching document templates from Supabase:', error);
      res.status(500).json({ error: 'Failed to fetch document templates' });
    }
  });

  // Get document categories from Supabase
  app.get('/api/supabase/documents/categories', async (req: Request, res: Response) => {
    try {
      const { data: categories, error } = await supabase
        .from('document_templates')
        .select('category, is_active')
        .eq('is_active', true);

      if (error) throw error;

      // Count documents per category
      const categoryStats = categories?.reduce((acc: any, template) => {
        const category = template.category;
        if (!acc[category]) {
          acc[category] = { name: category, count: 0 };
        }
        acc[category].count++;
        return acc;
      }, {});

      const categoryArray = Object.values(categoryStats || {});
      res.json(categoryArray);
    } catch (error) {
      console.error('Error fetching categories from Supabase:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // Get user document statistics from Supabase
  app.get('/api/supabase/documents/user-stats', async (req: Request, res: Response) => {
    try {
      // Return mock stats for now since user system needs authentication
      const stats = {
        creditsAvailable: 100,
        documentsGenerated: 0,
        favoriteDocuments: [],
        recentActivity: []
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats from Supabase:', error);
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  });

  // Create document templates in Supabase
  app.post('/api/supabase/documents/templates', async (req: Request, res: Response) => {
    try {
      const templateData = req.body;
      
      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          name: templateData.name,
          name_bn: templateData.nameBn,
          type: templateData.type,
          category: templateData.category,
          description: templateData.description,
          description_bn: templateData.descriptionBn,
          icon: templateData.icon,
          required_credits: templateData.creditsRequired || 1,
          is_active: true,
          difficulty: templateData.difficulty || 'easy',
          estimated_time: templateData.estimatedTime
        })
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error creating document template in Supabase:', error);
      res.status(500).json({ error: 'Failed to create document template' });
    }
  });

  // Update document template in Supabase
  app.patch('/api/supabase/documents/templates/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const { data, error } = await supabase
        .from('document_templates')
        .update({
          name: updateData.name,
          name_bn: updateData.nameBn,
          description: updateData.description,
          description_bn: updateData.descriptionBn,
          is_active: updateData.isActive,
          is_popular: updateData.isPopular,
          required_credits: updateData.creditsRequired
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error updating document template in Supabase:', error);
      res.status(500).json({ error: 'Failed to update document template' });
    }
  });

  // Check Supabase connection health (public endpoint)
  app.get('/api/public/supabase/health', async (req: Request, res: Response) => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic Supabase connectivity
      const { data, error } = await (supabase as any)
        .from('document_templates')
        .select('id')
        .limit(1);

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      res.json({ 
        status: 'connected', 
        supabaseHealth: 'operational',
        message: 'Document dashboard is fully connected to Supabase',
        dataAvailable: data ? data.length > 0 : false
      });
    } catch (error: any) {
      console.error('Supabase health check failed:', error);
      res.status(500).json({ 
        status: 'error', 
        supabaseHealth: 'failed',
        error: error?.message || 'Unknown error',
        details: 'Check if document_templates table exists in Supabase'
      });
    }
  });
}