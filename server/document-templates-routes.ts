import { Express, Request, Response } from 'express';
import { db } from '../db/index.js';
import { documentTemplates, documentTemplatesInsertSchema } from '../shared/schema.js';
import { eq, desc, and, like, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

export function registerDocumentTemplatesRoutes(app: Express) {
  // Get all document templates
  app.get('/api/document-templates', async (req: Request, res: Response) => {
    try {
      // Return fallback templates for now until table is properly created
      const fallbackTemplates = [
        {
          id: 1,
          name: 'Standard ID Card',
          nameBn: 'স্ট্যান্ডার্ড আইডি কার্ড',
          type: 'idCard',
          category: 'student_documents',
          categoryBn: 'ছাত্র ডকুমেন্ট',
          description: 'Professional student ID card with photo and QR code',
          descriptionBn: 'ছবি এবং QR কোড সহ পেশাদার শিক্ষার্থী আইডি কার্ড',
          isDefault: true,
          isActive: true,
          isFavorite: true,
          usageCount: 345,
          lastUsed: '২ ঘন্টা আগে',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-11-20'),
          thumbnailColor: '#3b82f6',
          settings: {
            showLogo: true,
            showSignature: false,
            showQR: true,
            colorScheme: 'blue',
            layout: 'standard',
            fontSize: 'medium',
            orientation: 'portrait'
          },
          createdBy: 'System Admin',
          version: '1.2',
          tags: ['id', 'student', 'card', 'standard']
        },
        {
          id: 2,
          name: 'HSC Admit Card',
          nameBn: 'HSC প্রবেশপত্র',
          type: 'admitCard',
          category: 'exam_documents',
          categoryBn: 'পরীক্ষার ডকুমেন্ট',
          description: 'HSC examination admit card template',
          descriptionBn: 'HSC পরীক্ষার প্রবেশপত্র টেমপ্লেট',
          isDefault: false,
          isActive: true,
          isFavorite: false,
          usageCount: 156,
          lastUsed: '৫ ঘন্টা আগে',
          createdAt: new Date('2023-02-10'),
          updatedAt: new Date('2023-11-18'),
          thumbnailColor: '#059669',
          settings: {
            showLogo: true,
            showSignature: true,
            showQR: false,
            colorScheme: 'green',
            layout: 'official',
            fontSize: 'large',
            orientation: 'portrait'
          },
          createdBy: 'Education Board',
          version: '2.0',
          tags: ['hsc', 'admit', 'exam', 'board']
        },
        {
          id: 3,
          name: 'Class Routine',
          nameBn: 'ক্লাস রুটিন',
          type: 'classRoutine',
          category: 'academic_documents',
          categoryBn: 'শিক্ষাগত ডকুমেন্ট',
          description: 'Weekly class schedule template',
          descriptionBn: 'সাপ্তাহিক ক্লাস সময়সূচী টেমপ্লেট',
          isDefault: false,
          isActive: true,
          isFavorite: true,
          usageCount: 89,
          lastUsed: '১ দিন আগে',
          createdAt: new Date('2023-03-05'),
          updatedAt: new Date('2023-11-15'),
          thumbnailColor: '#dc2626',
          settings: {
            showLogo: true,
            showSignature: false,
            showQR: false,
            colorScheme: 'red',
            layout: 'table',
            fontSize: 'small',
            orientation: 'landscape'
          },
          createdBy: 'Academic Department',
          version: '1.5',
          tags: ['class', 'routine', 'schedule', 'weekly']
        },
        {
          id: 4,
          name: 'Certificate Template',
          nameBn: 'সার্টিফিকেট টেমপ্লেট',
          type: 'certificate',
          category: 'achievement_documents',
          categoryBn: 'অর্জন ডকুমেন্ট',
          description: 'Academic achievement certificate',
          descriptionBn: 'শিক্ষাগত অর্জনের সার্টিফিকেট',
          isDefault: false,
          isActive: true,
          isFavorite: false,
          usageCount: 234,
          lastUsed: '৩ দিন আগে',
          createdAt: new Date('2023-04-12'),
          updatedAt: new Date('2023-11-10'),
          thumbnailColor: '#7c3aed',
          settings: {
            showLogo: true,
            showSignature: true,
            showQR: true,
            colorScheme: 'purple',
            layout: 'decorative',
            fontSize: 'large',
            orientation: 'landscape'
          },
          createdBy: 'Principal',
          version: '1.2',
          tags: ['certificate', 'achievement', 'award', 'recognition']
        }
      ];

      res.json(fallbackTemplates);
    } catch (error) {
      console.error('Error fetching document templates:', error);
      res.status(500).json({ error: 'Failed to fetch document templates' });
    }
  });

  // Get document template by ID
  app.get('/api/document-templates/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const template = await db.select().from(documentTemplates)
        .where(eq(documentTemplates.id, parseInt(id)))
        .limit(1);

      if (template.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template[0]);
    } catch (error) {
      console.error('Error fetching document template:', error);
      res.status(500).json({ error: 'Failed to fetch document template' });
    }
  });

  // Create new document template
  app.post('/api/document-templates', async (req: Request, res: Response) => {
    try {
      const validatedData = documentTemplatesInsertSchema.parse(req.body);
      
      const newTemplate = await db.insert(documentTemplates)
        .values(validatedData)
        .returning();

      res.status(201).json(newTemplate[0]);
    } catch (error) {
      console.error('Error creating document template:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid template data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create document template' });
    }
  });

  // Update document template
  app.patch('/api/document-templates/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedTemplate = await db.update(documentTemplates)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(documentTemplates.id, parseInt(id)))
        .returning();

      if (updatedTemplate.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(updatedTemplate[0]);
    } catch (error) {
      console.error('Error updating document template:', error);
      res.status(500).json({ error: 'Failed to update document template' });
    }
  });

  // Delete document template
  app.delete('/api/document-templates/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const deletedTemplate = await db.delete(documentTemplates)
        .where(eq(documentTemplates.id, parseInt(id)))
        .returning();

      if (deletedTemplate.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting document template:', error);
      res.status(500).json({ error: 'Failed to delete document template' });
    }
  });

  // Toggle template favorite status
  app.patch('/api/document-templates/:id/favorite', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const template = await db.select().from(documentTemplates)
        .where(eq(documentTemplates.id, parseInt(id)))
        .limit(1);

      if (template.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const updatedTemplate = await db.update(documentTemplates)
        .set({ 
          isFavorite: !template[0].isFavorite,
          updatedAt: new Date()
        })
        .where(eq(documentTemplates.id, parseInt(id)))
        .returning();

      res.json(updatedTemplate[0]);
    } catch (error) {
      console.error('Error toggling template favorite:', error);
      res.status(500).json({ error: 'Failed to toggle template favorite' });
    }
  });

  // Increment template usage count
  app.patch('/api/document-templates/:id/use', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const template = await db.select().from(documentTemplates)
        .where(eq(documentTemplates.id, parseInt(id)))
        .limit(1);

      if (template.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const updatedTemplate = await db.update(documentTemplates)
        .set({ 
          usageCount: template[0].usageCount + 1,
          lastUsed: new Date(),
          updatedAt: new Date()
        })
        .where(eq(documentTemplates.id, parseInt(id)))
        .returning();

      res.json(updatedTemplate[0]);
    } catch (error) {
      console.error('Error updating template usage:', error);
      res.status(500).json({ error: 'Failed to update template usage' });
    }
  });

  // Get template statistics
  app.get('/api/document-templates/stats', async (req: Request, res: Response) => {
    try {
      const allTemplates = await db.select().from(documentTemplates);
      
      const stats = {
        totalTemplates: allTemplates.length,
        activeTemplates: allTemplates.filter(t => t.isActive).length,
        popularTemplates: allTemplates.filter(t => t.usageCount > 200).length,
        totalUsage: allTemplates.reduce((sum, t) => sum + t.usageCount, 0),
        weeklyGrowth: 12.8, // This would be calculated based on historical data
        favoriteCount: allTemplates.filter(t => t.isFavorite).length
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching template statistics:', error);
      res.status(500).json({ error: 'Failed to fetch template statistics' });
    }
  });
}