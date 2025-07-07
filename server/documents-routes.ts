import { Express, Request, Response } from 'express';
import { supabase } from '../shared/supabase';
import { db } from './db';
import { sql } from 'drizzle-orm';

export function registerDocumentsRoutes(app: Express) {
  
  // Get individual document template by type or ID - reuses working templates endpoint
  app.get('/api/documents/templates/:docType', async (req: Request, res: Response) => {
    try {
      const { docType } = req.params;
      
      // Check if docType is numeric (ID) or string (type)
      const isNumericId = /^\d+$/.test(docType);
      
      // Query by either ID or type - using the same structure as the working templates endpoint
      const template = await db.execute(sql`
        SELECT 
          dt.id,
          dt.name,
          dt.type,
          dt.category,
          dt.description,
          dt.required_credits,
          dt.is_active,
          COALESCE(dg_stats.generation_count, 0) as generated,
          CASE 
            WHEN dg_stats.generation_count > 50 THEN true 
            ELSE false 
          END as is_popular
        FROM document_templates dt
        LEFT JOIN (
          SELECT 
            document_type,
            COUNT(*) as generation_count
          FROM document_generations
          GROUP BY document_type
        ) dg_stats ON dt.type = dg_stats.document_type
        WHERE ${isNumericId ? sql`dt.id = ${parseInt(docType)}` : sql`dt.type = ${docType}`} 
        AND dt.is_active = true
        LIMIT 1
      `);

      if (!template.rows || template.rows.length === 0) {
        return res.status(404).json({ error: 'Document template not found' });
      }

      const templateData = template.rows[0] as any;
      
      if (!templateData) {
        return res.status(404).json({ error: 'Document template not found' });
      }
      
      // Use the same enhancement logic as the templates endpoint
      const enhanced = {
        id: templateData.id,
        type: templateData.type,
        name: templateData.name,
        nameBn: getBengaliName(templateData.type),
        description: templateData.description,
        descriptionBn: getBengaliDescription(templateData.type),
        category: templateData.category,
        creditsRequired: templateData.required_credits,
        generated: templateData.generated,
        isPopular: templateData.is_popular,
        icon: getDocumentIcon(templateData.type),
        difficulty: getDifficulty(templateData.type),
        estimatedTime: getEstimatedTime(templateData.type),
        path: `/documents/${templateData.type}`,
        fields: JSON.stringify(['student_name', 'student_id', 'class', 'school_name']),
        templateData: JSON.stringify({
          size: 'a4',
          layout: 'standard',
          fields: ['student_name', 'student_id', 'class', 'school_name']
        }),
        isActive: templateData.is_active
      };
      
      res.json(enhanced);

    } catch (error) {
      console.error('Error fetching document template:', error);
      // Fallback: return a basic template structure
      res.status(500).json({ error: 'Failed to fetch document template' });
    }
  });

  // Get document templates with generation statistics
  app.get('/api/documents/templates', async (req: Request, res: Response) => {
    try {
      // Get templates from database
      const templates = await db.execute(sql`
        SELECT 
          dt.id,
          dt.name,
          dt.type,
          dt.category,
          dt.description,
          dt.required_credits,
          dt.is_active,
          COALESCE(dg_stats.generation_count, 0) as generated,
          CASE 
            WHEN dg_stats.generation_count > 50 THEN true 
            ELSE false 
          END as is_popular
        FROM document_templates dt
        LEFT JOIN (
          SELECT 
            document_type,
            COUNT(*) as generation_count
          FROM document_generations
          GROUP BY document_type
        ) dg_stats ON dt.type = dg_stats.document_type
        WHERE dt.is_active = true
        ORDER BY dg_stats.generation_count DESC NULLS LAST
      `);

      // Add Bengali names and additional metadata
      const enhancedTemplates = templates.rows.map((template: any) => ({
        id: template.id,
        type: template.type,
        name: template.name,
        nameBn: getBengaliName(template.type),
        description: template.description,
        descriptionBn: getBengaliDescription(template.type),
        category: template.category,
        creditsRequired: template.required_credits,
        generated: template.generated,
        isPopular: template.is_popular,
        icon: getDocumentIcon(template.type),
        difficulty: getDifficulty(template.type),
        estimatedTime: getEstimatedTime(template.type),
        path: `/documents/${template.type}`
      }));

      res.json(enhancedTemplates);
    } catch (error: any) {
      console.error('Error fetching document templates:', error);
      res.status(500).json({ error: 'Failed to fetch document templates' });
    }
  });

  // Get document generation statistics
  app.get('/api/documents/stats', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get user's document generation statistics
      const stats = await db.execute(sql`
        SELECT 
          COUNT(*) as total_generated,
          SUM(credits_used) as credits_used,
          COUNT(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN 1 END) as monthly_used
        FROM document_generations 
        WHERE user_id = ${userId}
      `);

      // Get user's remaining credits
      const userCredits = await db.execute(sql`
        SELECT 
          COALESCE(SUM(amount), 500) as credits_remaining
        FROM credit_transactions 
        WHERE school_instance_id = 1
      `);

      const result = {
        totalGenerated: Number(stats.rows[0]?.total_generated) || 0,
        creditsUsed: Number(stats.rows[0]?.credits_used) || 0,
        creditsRemaining: Number(userCredits.rows[0]?.credits_remaining) || 500,
        monthlyLimit: 500,
        monthlyUsed: Number(stats.rows[0]?.monthly_used) || 0
      };

      res.json(result);
    } catch (error: any) {
      console.error('Error fetching document stats:', error);
      res.status(500).json({ error: 'Failed to fetch document statistics' });
    }
  });

  // Get recent document generations
  app.get('/api/documents/recent', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const recentGenerations = await db.execute(sql`
        SELECT 
          dg.document_type,
          dg.document_name,
          dg.credits_used,
          dg.created_at,
          dt.name as template_name
        FROM document_generations dg
        LEFT JOIN document_templates dt ON dg.document_type = dt.type
        WHERE dg.user_id = ${userId}
        ORDER BY dg.created_at DESC
        LIMIT 10
      `);

      const activities = recentGenerations.rows.map((generation: any) => ({
        title: 'ডকুমেন্ট তৈরি সম্পন্ন',
        description: `${getBengaliName(generation.document_type)} - ${generation.credits_used} ক্রেডিট ব্যবহৃত`,
        time: new Date(generation.created_at).toLocaleDateString('bn-BD'),
        type: 'success'
      }));

      res.json(activities);
    } catch (error: any) {
      console.error('Error fetching recent documents:', error);
      res.status(500).json({ error: 'Failed to fetch recent documents' });
    }
  });

  // Generate document and track in database
  app.post('/api/documents/generate', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { documentType, documentData } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get template details
      const template = await db.execute(sql`
        SELECT required_credits, name 
        FROM document_templates 
        WHERE type = ${documentType} AND is_active = true
      `);

      if (template.rows.length === 0) {
        return res.status(404).json({ error: 'Document template not found' });
      }

      const creditsRequired = template.rows[0].required_credits;

      // Check user's available credits  
      const userCredits = await db.execute(sql`
        SELECT COALESCE(SUM(amount), 500) as available_credits
        FROM credit_transactions 
        WHERE school_instance_id = 1
      `);

      const availableCredits = Number(userCredits.rows[0]?.available_credits) || 500;

      if (availableCredits < creditsRequired) {
        return res.status(400).json({ 
          error: 'Insufficient credits',
          required: creditsRequired,
          available: availableCredits
        });
      }

      // Record document generation
      await db.execute(sql`
        INSERT INTO document_generations (
          user_id, 
          document_type, 
          document_name, 
          credits_used, 
          status, 
          metadata
        ) VALUES (
          ${userId},
          ${documentType},
          ${template.rows[0].name},
          ${creditsRequired},
          'completed',
          ${JSON.stringify(documentData)}
        )
      `);

      // Deduct credits
      await db.execute(sql`
        INSERT INTO credit_transactions (
          school_instance_id,
          type,
          amount,
          description,
          reference
        ) VALUES (
          1,
          'usage',
          ${-creditsRequired},
          ${'Document generation: ' + template.rows[0].name},
          ${documentType}
        )
      `);

      res.json({
        success: true,
        message: 'Document generated successfully',
        creditsUsed: creditsRequired,
        remainingCredits: availableCredits - creditsRequired
      });

    } catch (error: any) {
      console.error('Error generating document:', error);
      res.status(500).json({ error: 'Failed to generate document' });
    }
  });
}

// Helper functions for Bengali translations and metadata
function getBengaliName(type: string): string {
  const names: Record<string, string> = {
    'student-id-cards': 'শিক্ষার্থী আইডি কার্ড',
    'admit-cards': 'এডমিট কার্ড',
    'fee-receipts': 'ফি রসিদ',
    'marksheets': 'মার্কশীট',
    'teacher-id-cards': 'শিক্ষক আইডি কার্ড',
    'class-routines': 'ক্লাস রুটিন',
    'testimonials': 'প্রশংসাপত্র',
    'result-sheets': 'রেজাল্ট শিট',
    'transfer-certificates': 'স্থানান্তর সনদপত্র'
  };
  return names[type] || type;
}

function getBengaliDescription(type: string): string {
  const descriptions: Record<string, string> = {
    'student-id-cards': 'পেশাদার শিক্ষার্থী পরিচয়পত্র তৈরি করুন',
    'admit-cards': 'পরীক্ষার প্রবেশপত্র তৈরি করুন',
    'fee-receipts': 'শিক্ষার্থীদের ফি রসিদ তৈরি করুন',
    'marksheets': 'একাডেমিক মার্কশীট তৈরি করুন',
    'teacher-id-cards': 'পেশাদার শিক্ষক পরিচয়পত্র তৈরি করুন',
    'class-routines': 'ক্লাসের সময়সূচী তৈরি করুন'
  };
  return descriptions[type] || 'ডকুমেন্ট তৈরি করুন';
}

function getDocumentIcon(type: string): string {
  const icons: Record<string, string> = {
    'student-id-cards': '🪪',
    'admit-cards': '🎫',
    'fee-receipts': '🧾',
    'marksheets': '📊',
    'teacher-id-cards': '👨‍🏫',
    'class-routines': '📅'
  };
  return icons[type] || '📄';
}

function getDifficulty(type: string): string {
  const difficulties: Record<string, string> = {
    'student-id-cards': 'easy',
    'admit-cards': 'easy',
    'fee-receipts': 'easy',
    'marksheets': 'medium',
    'teacher-id-cards': 'easy',
    'class-routines': 'medium'
  };
  return difficulties[type] || 'medium';
}

function getEstimatedTime(type: string): string {
  const times: Record<string, string> = {
    'student-id-cards': '২-৩ মিনিট',
    'admit-cards': '১-২ মিনিট',
    'fee-receipts': '১ মিনিট',
    'marksheets': '৩-৫ মিনিট',
    'teacher-id-cards': '২-৩ মিনিট',
    'class-routines': '৫-৭ মিনিট'
  };
  return times[type] || '২-৩ মিনিট';
}