import { Express, Request, Response } from 'express';
import { db } from './db';
import { documentTemplates, users } from '../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

export function registerDocumentPermissionRoutes(app: Express) {
  // Get all document templates for admin
  app.get('/api/admin/document-templates', async (req: Request, res: Response) => {
    try {
      const templates = await db
        .select({
          id: documentTemplates.id,
          name: documentTemplates.name,
          nameBn: documentTemplates.nameBn,
          category: documentTemplates.category,
          type: documentTemplates.type,
          icon: documentTemplates.icon,
          description: documentTemplates.description,
          descriptionBn: documentTemplates.descriptionBn,
          creditsRequired: documentTemplates.creditsRequired,
          isActive: documentTemplates.isActive
        })
        .from(documentTemplates)
        .where(eq(documentTemplates.isActive, true))
        .orderBy(documentTemplates.category, documentTemplates.name);

      res.json(templates);
    } catch (error) {
      console.error('Error fetching document templates:', error);
      res.status(500).json({ error: 'Failed to fetch document templates' });
    }
  });

  // Get document permissions for a specific target
  app.get('/api/admin/document-permissions', async (req: Request, res: Response) => {
    try {
      const { target, type } = req.query;
      
      let permissions;
      
      if (type === 'user') {
        permissions = await db.execute(`
          SELECT dp.*, dt.name, dt.name_bn, dt.category, dt.icon
          FROM document_permissions dp
          JOIN document_templates dt ON dp.document_template_id = dt.id
          WHERE dp.user_id = $1 AND dt.is_active = true
        `, [parseInt(target as string)]);
      } else {
        // School or default permissions
        permissions = await db.execute(`
          SELECT dp.*, dt.name, dt.name_bn, dt.category, dt.icon
          FROM document_permissions dp
          JOIN document_templates dt ON dp.document_template_id = dt.id
          WHERE dp.school_id = $1 AND dt.is_active = true
        `, [target as string]);
      }

      const formattedPermissions = permissions.rows.map((row: any) => ({
        documentTemplateId: row.document_template_id,
        isEnabled: row.is_enabled,
        creditsOverride: row.credits_override,
        name: row.name,
        nameBn: row.name_bn,
        category: row.category,
        icon: row.icon
      }));

      res.json(formattedPermissions);
    } catch (error) {
      console.error('Error fetching document permissions:', error);
      res.status(500).json({ error: 'Failed to fetch document permissions' });
    }
  });

  // Update document permission
  app.post('/api/admin/document-permissions', async (req: Request, res: Response) => {
    try {
      const { target, targetType, documentId, isEnabled, creditsOverride } = req.body;

      const upsertData = {
        document_template_id: documentId,
        is_enabled: isEnabled,
        credits_override: creditsOverride,
        updated_at: new Date()
      };

      if (targetType === 'user') {
        await db.execute(`
          INSERT INTO document_permissions (user_id, document_template_id, is_enabled, credits_override, updated_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, document_template_id)
          DO UPDATE SET 
            is_enabled = $3,
            credits_override = $4,
            updated_at = $5
        `, [parseInt(target), documentId, isEnabled, creditsOverride, new Date()]);
      } else {
        await db.execute(`
          INSERT INTO document_permissions (school_id, document_template_id, is_enabled, credits_override, updated_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (school_id, document_template_id)
          DO UPDATE SET 
            is_enabled = $3,
            credits_override = $4,
            updated_at = $5
        `, [target, documentId, isEnabled, creditsOverride, new Date()]);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating document permission:', error);
      res.status(500).json({ error: 'Failed to update document permission' });
    }
  });

  // Bulk update permissions by category
  app.post('/api/admin/document-permissions/bulk', async (req: Request, res: Response) => {
    try {
      const { target, targetType, category, isEnabled } = req.body;

      // Get all document IDs in the category
      const categoryDocs = await db
        .select({ id: documentTemplates.id })
        .from(documentTemplates)
        .where(and(
          eq(documentTemplates.category, category),
          eq(documentTemplates.isActive, true)
        ));

      const documentIds = categoryDocs.map(doc => doc.id);

      if (documentIds.length === 0) {
        return res.json({ success: true, message: 'No documents found in category' });
      }

      // Bulk upsert permissions
      for (const docId of documentIds) {
        if (targetType === 'user') {
          await db.execute(`
            INSERT INTO document_permissions (user_id, document_template_id, is_enabled, updated_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, document_template_id)
            DO UPDATE SET 
              is_enabled = $3,
              updated_at = $4
          `, [parseInt(target), docId, isEnabled, new Date()]);
        } else {
          await db.execute(`
            INSERT INTO document_permissions (school_id, document_template_id, is_enabled, updated_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (school_id, document_template_id)
            DO UPDATE SET 
              is_enabled = $3,
              updated_at = $4
          `, [target, docId, isEnabled, new Date()]);
        }
      }

      res.json({ success: true, updated: documentIds.length });
    } catch (error) {
      console.error('Error bulk updating document permissions:', error);
      res.status(500).json({ error: 'Failed to bulk update document permissions' });
    }
  });

  // Get permission status for a specific document and user/school
  app.get('/api/documents/check-permission/:documentId', async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;
      const userId = req.session?.user?.id;
      const schoolId = req.session?.user?.schoolId || 'default';

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Check user-specific permission first
      const userPermission = await db.execute(`
        SELECT is_enabled, credits_override
        FROM document_permissions
        WHERE user_id = $1 AND document_template_id = $2
      `, [userId, parseInt(documentId)]);

      if (userPermission.rows.length > 0) {
        const perm = userPermission.rows[0];
        return res.json({
          isEnabled: perm.is_enabled,
          creditsRequired: perm.credits_override || 1
        });
      }

      // Check school-specific permission
      const schoolPermission = await db.execute(`
        SELECT is_enabled, credits_override
        FROM document_permissions
        WHERE school_id = $1 AND document_template_id = $2
      `, [schoolId, parseInt(documentId)]);

      if (schoolPermission.rows.length > 0) {
        const perm = schoolPermission.rows[0];
        return res.json({
          isEnabled: perm.is_enabled,
          creditsRequired: perm.credits_override || 1
        });
      }

      // Check default permission
      const defaultPermission = await db.execute(`
        SELECT is_enabled, credits_override
        FROM document_permissions
        WHERE school_id = 'default' AND document_template_id = $1
      `, [parseInt(documentId)]);

      if (defaultPermission.rows.length > 0) {
        const perm = defaultPermission.rows[0];
        return res.json({
          isEnabled: perm.is_enabled,
          creditsRequired: perm.credits_override || 1
        });
      }

      // Default to enabled if no permission record exists
      res.json({
        isEnabled: true,
        creditsRequired: 1
      });
    } catch (error) {
      console.error('Error checking document permission:', error);
      res.status(500).json({ error: 'Failed to check document permission' });
    }
  });

  // Get all users with document access summary
  app.get('/api/admin/user-document-access', async (req: Request, res: Response) => {
    try {
      const usersWithAccess = await db.execute(`
        SELECT 
          u.id,
          u.username,
          u.role,
          u.school_id,
          COUNT(CASE WHEN dp.is_enabled = true THEN 1 END) as enabled_documents,
          COUNT(dp.id) as total_permissions
        FROM users u
        LEFT JOIN document_permissions dp ON u.id = dp.user_id
        WHERE u.role != 'super_admin'
        GROUP BY u.id, u.username, u.role, u.school_id
        ORDER BY u.username
      `);

      res.json(usersWithAccess.rows);
    } catch (error) {
      console.error('Error fetching user document access:', error);
      res.status(500).json({ error: 'Failed to fetch user document access' });
    }
  });

  // Get document usage statistics
  app.get('/api/admin/document-usage-stats', async (req: Request, res: Response) => {
    try {
      const stats = await db.execute(`
        SELECT 
          dt.id,
          dt.name,
          dt.name_bn,
          dt.category,
          dt.icon,
          COUNT(CASE WHEN dp.is_enabled = true THEN 1 END) as enabled_for_users,
          COUNT(dp.id) as total_permissions,
          (COUNT(CASE WHEN dp.is_enabled = true THEN 1 END) * 100.0 / NULLIF(COUNT(dp.id), 0)) as enabled_percentage
        FROM document_templates dt
        LEFT JOIN document_permissions dp ON dt.id = dp.document_template_id
        WHERE dt.is_active = true
        GROUP BY dt.id, dt.name, dt.name_bn, dt.category, dt.icon
        ORDER BY enabled_percentage DESC, dt.name
      `);

      res.json(stats.rows);
    } catch (error) {
      console.error('Error fetching document usage stats:', error);
      res.status(500).json({ error: 'Failed to fetch document usage stats' });
    }
  });
}