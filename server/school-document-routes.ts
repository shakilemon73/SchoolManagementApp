import { Express, Request, Response } from 'express';
import { db } from './db';
import { 
  documentTemplates, 
  generatedDocuments, 
  documentStats, 
  users,
  schoolDocumentPermissions,
  schools,
  InsertDocumentTemplate
} from '../shared/schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';

export function registerSchoolDocumentRoutes(app: Express) {
  
  // Helper function to check if school has permission for document type
  async function checkDocumentPermission(schoolId: number, documentTypeId: number) {
    const permission = await db
      .select()
      .from(schoolDocumentPermissions)
      .where(and(
        eq(schoolDocumentPermissions.schoolId, schoolId),
        eq(schoolDocumentPermissions.documentTypeId, documentTypeId),
        eq(schoolDocumentPermissions.isAllowed, true)
      ))
      .limit(1);
    
    return permission.length > 0 ? permission[0] : null;
  }
  
  // Get document templates for a specific school (only allowed ones)
  app.get('/api/schools/:schoolId/documents/templates', async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const { category, search, isActive, lang } = req.query;
      
      // Get only document templates that the school has permission to use
      let baseQuery = db
        .select({
          id: documentTemplates.id,
          documentId: documentTemplates.type,
          name: documentTemplates.name,
          nameBn: documentTemplates.nameBn,
          category: documentTemplates.category,
          subcategory: documentTemplates.subcategory,
          description: documentTemplates.description,
          descriptionBn: documentTemplates.descriptionBn,
          icon: documentTemplates.icon,
          creditsRequired: documentTemplates.creditsRequired,
          usageCount: documentTemplates.usageCount,
          lastUsed: documentTemplates.lastUsed,
          difficulty: documentTemplates.difficulty,
          estimatedTime: documentTemplates.estimatedTime,
          isActive: documentTemplates.isActive,
          isPopular: documentTemplates.isPopular,
          creditsPerUse: schoolDocumentPermissions.creditsPerUse,
          grantedAt: schoolDocumentPermissions.grantedAt
        })
        .from(documentTemplates)
        .innerJoin(
          schoolDocumentPermissions,
          and(
            eq(documentTemplates.id, schoolDocumentPermissions.documentTypeId),
            eq(schoolDocumentPermissions.schoolId, schoolId),
            eq(schoolDocumentPermissions.isAllowed, true)
          )
        );

      // Add filters
      const conditions = [eq(documentTemplates.isActive, true)];
      
      if (category && category !== 'all') {
        conditions.push(eq(documentTemplates.category, category as string));
      }
      if (isActive !== undefined) {
        conditions.push(eq(documentTemplates.isActive, isActive === 'true'));
      }

      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      // Apply search filter
      if (search) {
        const searchTerm = `%${search}%`;
        baseQuery = baseQuery.where(
          sql`${documentTemplates.name} ILIKE ${searchTerm} OR 
              ${documentTemplates.nameBn} ILIKE ${searchTerm} OR 
              ${documentTemplates.description} ILIKE ${searchTerm} OR 
              ${documentTemplates.descriptionBn} ILIKE ${searchTerm}`
        );
      }

      const templates = await baseQuery.orderBy(desc(documentTemplates.usageCount));
      
      res.json(templates);
    } catch (error) {
      console.error('Error fetching school document templates:', error);
      res.status(500).json({ 
        error: 'Failed to fetch document templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate document for a specific school (with permission check)
  app.post('/api/schools/:schoolId/documents/generate', async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const { templateId, documentData, generatedBy } = req.body;
      
      // Check if school has permission to use this document type
      const permission = await checkDocumentPermission(schoolId, templateId);
      if (!permission) {
        return res.status(403).json({ 
          error: 'Access denied: School does not have permission to use this document type',
          code: 'PERMISSION_DENIED'
        });
      }
      
      // Verify template exists and is active
      const template = await db
        .select()
        .from(documentTemplates)
        .where(and(
          eq(documentTemplates.id, templateId),
          eq(documentTemplates.isActive, true)
        ))
        .limit(1);

      if (template.length === 0) {
        return res.status(404).json({ error: 'Document template not found or inactive' });
      }

      // Create generated document record
      const [generatedDoc] = await db
        .insert(generatedDocuments)
        .values({
          templateId,
          documentData: JSON.stringify(documentData),
          generatedBy: generatedBy || 'system',
          status: 'completed',
          schoolId
        })
        .returning();

      // Update document stats
      await db
        .insert(documentStats)
        .values({
          templateId,
          totalGenerated: 1,
          lastGenerated: new Date(),
          schoolId
        })
        .onConflictDoUpdate({
          target: [documentStats.templateId, documentStats.schoolId],
          set: {
            totalGenerated: sql`${documentStats.totalGenerated} + 1`,
            lastGenerated: new Date()
          }
        });

      res.json({
        success: true,
        document: generatedDoc,
        creditsUsed: permission.creditsPerUse,
        message: 'Document generated successfully'
      });
    } catch (error) {
      console.error('Error generating school document:', error);
      res.status(500).json({ 
        error: 'Failed to generate document',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get document generation history for a school
  app.get('/api/schools/:schoolId/documents/history', async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const history = await db
        .select({
          id: generatedDocuments.id,
          templateId: generatedDocuments.templateId,
          templateName: documentTemplates.name,
          templateNameBn: documentTemplates.nameBn,
          generatedBy: generatedDocuments.generatedBy,
          createdAt: generatedDocuments.createdAt,
          status: generatedDocuments.status
        })
        .from(generatedDocuments)
        .leftJoin(documentTemplates, eq(generatedDocuments.templateId, documentTemplates.id))
        .where(eq(generatedDocuments.schoolId, schoolId))
        .orderBy(desc(generatedDocuments.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(generatedDocuments)
        .where(eq(generatedDocuments.schoolId, schoolId));

      res.json({
        documents: history,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching school document history:', error);
      res.status(500).json({ 
        error: 'Failed to fetch document history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get document stats for a school
  app.get('/api/schools/:schoolId/documents/stats', async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      
      const stats = await db
        .select({
          templateId: documentStats.templateId,
          templateName: documentTemplates.name,
          templateNameBn: documentTemplates.nameBn,
          totalGenerated: documentStats.totalGenerated,
          lastGenerated: documentStats.lastGenerated
        })
        .from(documentStats)
        .leftJoin(documentTemplates, eq(documentStats.templateId, documentTemplates.id))
        .where(eq(documentStats.schoolId, schoolId))
        .orderBy(desc(documentStats.totalGenerated));

      res.json(stats);
    } catch (error) {
      console.error('Error fetching school document stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch document stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Track document usage for a specific school (with permission check)
  app.post('/api/schools/:schoolId/documents/track-usage', async (req: Request, res: Response) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const { documentId } = req.body;

      if (!documentId) {
        return res.status(400).json({ error: 'Document ID is required' });
      }

      // Check if school has permission to use this document type
      const permission = await checkDocumentPermission(schoolId, parseInt(documentId));
      if (!permission) {
        return res.status(403).json({ 
          error: 'Access denied: School does not have permission to track usage for this document type',
          code: 'PERMISSION_DENIED'
        });
      }

      // Update usage count and last used timestamp
      const result = await db
        .update(documentTemplates)
        .set({
          usageCount: sql`${documentTemplates.usageCount} + 1`,
          lastUsed: new Date()
        })
        .where(eq(documentTemplates.id, parseInt(documentId)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Document template not found' });
      }

      res.json({ 
        message: 'Usage tracked successfully',
        schoolId,
        usageCount: result[0].usageCount,
        lastUsed: result[0].lastUsed
      });
    } catch (error) {
      console.error('Error tracking usage for school:', error);
      res.status(500).json({ 
        error: 'Failed to track usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}