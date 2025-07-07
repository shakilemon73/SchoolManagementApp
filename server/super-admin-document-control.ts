import { Express, Request, Response } from 'express';
import { db } from './db';
import { 
  documentTemplates, 
  schoolDocumentPermissions,
  schools,
  InsertSchoolDocumentPermission
} from '../shared/schema';
import { eq, desc, and, sql, count, inArray } from 'drizzle-orm';

// Super Admin middleware - only you can access these routes
const requireSuperAdmin = async (req: Request, res: Response, next: any) => {
  const superAdminKey = req.headers['x-super-admin-key'];
  
  // Check against your provider master key
  if (superAdminKey !== process.env.SUPER_ADMIN_KEY) {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  
  next();
};

export function registerSuperAdminDocumentControl(app: Express) {
  
  // Get all 57 document types (master list)
  app.get('/api/super-admin/document-types', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const documentTypes = await db
        .select({
          id: documentTemplates.id,
          type: documentTemplates.type,
          name: documentTemplates.name,
          nameBn: documentTemplates.nameBn,
          category: documentTemplates.category,
          description: documentTemplates.description,
          creditsRequired: documentTemplates.creditsRequired,
          isActive: documentTemplates.isActive
        })
        .from(documentTemplates)
        .orderBy(documentTemplates.category, documentTemplates.name);

      res.json({
        total: documentTypes.length,
        documentTypes
      });
    } catch (error) {
      console.error('Error fetching document types:', error);
      res.status(500).json({ error: 'Failed to fetch document types' });
    }
  });

  // Get all schools with their document permissions
  app.get('/api/super-admin/schools/permissions', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const schoolsWithPermissions = await db
        .select({
          schoolId: schools.id,
          schoolName: schools.schoolName,
          contactEmail: schools.contactEmail,
          status: schools.status,
          documentTypeId: schoolDocumentPermissions.documentTypeId,
          documentTypeName: documentTemplates.name,
          documentTypeNameBn: documentTemplates.nameBn,
          permissionGranted: schoolDocumentPermissions.isAllowed,
          creditsPerUse: schoolDocumentPermissions.creditsPerUse,
          grantedAt: schoolDocumentPermissions.grantedAt
        })
        .from(schools)
        .leftJoin(schoolDocumentPermissions, eq(schools.id, schoolDocumentPermissions.schoolId))
        .leftJoin(documentTemplates, eq(schoolDocumentPermissions.documentTypeId, documentTemplates.id))
        .orderBy(schools.schoolName, documentTemplates.name);

      // Group by school
      const groupedBySchool = schoolsWithPermissions.reduce((acc: any, row) => {
        if (!acc[row.schoolId]) {
          acc[row.schoolId] = {
            schoolId: row.schoolId,
            schoolName: row.schoolName,
            contactEmail: row.contactEmail,
            status: row.status,
            permissions: []
          };
        }
        
        if (row.documentTypeId) {
          acc[row.schoolId].permissions.push({
            documentTypeId: row.documentTypeId,
            documentTypeName: row.documentTypeName,
            documentTypeNameBn: row.documentTypeNameBn,
            isAllowed: row.permissionGranted,
            creditsPerUse: row.creditsPerUse,
            grantedAt: row.grantedAt
          });
        }
        
        return acc;
      }, {});

      res.json(Object.values(groupedBySchool));
    } catch (error) {
      console.error('Error fetching school permissions:', error);
      res.status(500).json({ error: 'Failed to fetch school permissions' });
    }
  });

  // Grant document access to a school
  app.post('/api/super-admin/schools/:schoolId/grant-document/:documentTypeId', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { schoolId, documentTypeId } = req.params;
      const { creditsPerUse = 1 } = req.body;

      // Check if permission already exists
      const existingPermission = await db
        .select()
        .from(schoolDocumentPermissions)
        .where(
          and(
            eq(schoolDocumentPermissions.schoolId, parseInt(schoolId)),
            eq(schoolDocumentPermissions.documentTypeId, parseInt(documentTypeId))
          )
        );

      if (existingPermission.length > 0) {
        // Update existing permission
        await db
          .update(schoolDocumentPermissions)
          .set({
            isAllowed: true,
            creditsPerUse: creditsPerUse,
            grantedAt: new Date()
          })
          .where(
            and(
              eq(schoolDocumentPermissions.schoolId, parseInt(schoolId)),
              eq(schoolDocumentPermissions.documentTypeId, parseInt(documentTypeId))
            )
          );
      } else {
        // Create new permission
        const newPermission: InsertSchoolDocumentPermission = {
          schoolId: parseInt(schoolId),
          documentTypeId: parseInt(documentTypeId),
          isAllowed: true,
          creditsPerUse: creditsPerUse,
          grantedAt: new Date()
        };

        await db
          .insert(schoolDocumentPermissions)
          .values(newPermission);
      }

      res.json({ 
        message: 'Document access granted successfully',
        schoolId,
        documentTypeId,
        creditsPerUse
      });
    } catch (error) {
      console.error('Error granting document access:', error);
      res.status(500).json({ error: 'Failed to grant document access' });
    }
  });

  // Revoke document access from a school
  app.delete('/api/super-admin/schools/:schoolId/revoke-document/:documentTypeId', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { schoolId, documentTypeId } = req.params;

      await db
        .update(schoolDocumentPermissions)
        .set({
          isAllowed: false,
          revokedAt: new Date()
        })
        .where(
          and(
            eq(schoolDocumentPermissions.schoolId, parseInt(schoolId)),
            eq(schoolDocumentPermissions.documentTypeId, parseInt(documentTypeId))
          )
        );

      res.json({ 
        message: 'Document access revoked successfully',
        schoolId,
        documentTypeId
      });
    } catch (error) {
      console.error('Error revoking document access:', error);
      res.status(500).json({ error: 'Failed to revoke document access' });
    }
  });

  // Bulk grant/revoke permissions for a school
  app.post('/api/super-admin/schools/:schoolId/bulk-permissions', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { documentTypeIds, action, creditsPerUse = 1 } = req.body; // action: 'grant' or 'revoke'

      if (action === 'grant') {
        const permissions = documentTypeIds.map((documentTypeId: number) => ({
          schoolId: parseInt(schoolId),
          documentTypeId,
          isAllowed: true,
          creditsPerUse,
          grantedAt: new Date()
        }));

        await db
          .insert(schoolDocumentPermissions)
          .values(permissions)
          .onConflictDoUpdate({
            target: [schoolDocumentPermissions.schoolId, schoolDocumentPermissions.documentTypeId],
            set: {
              isAllowed: true,
              creditsPerUse,
              grantedAt: new Date()
            }
          });
      } else if (action === 'revoke') {
        await db
          .update(schoolDocumentPermissions)
          .set({
            isAllowed: false,
            revokedAt: new Date()
          })
          .where(
            and(
              eq(schoolDocumentPermissions.schoolId, parseInt(schoolId)),
              inArray(schoolDocumentPermissions.documentTypeId, documentTypeIds)
            )
          );
      }

      res.json({ 
        message: `Document access ${action}ed successfully`,
        schoolId,
        documentCount: documentTypeIds.length
      });
    } catch (error) {
      console.error('Error updating bulk permissions:', error);
      res.status(500).json({ error: 'Failed to update permissions' });
    }
  });

  // Get permission status for a specific school and document type
  app.get('/api/super-admin/schools/:schoolId/document/:documentTypeId/permission', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { schoolId, documentTypeId } = req.params;

      const permission = await db
        .select({
          isAllowed: schoolDocumentPermissions.isAllowed,
          creditsPerUse: schoolDocumentPermissions.creditsPerUse,
          grantedAt: schoolDocumentPermissions.grantedAt,
          revokedAt: schoolDocumentPermissions.revokedAt,
          documentName: documentTemplates.name,
          documentNameBn: documentTemplates.nameBn
        })
        .from(schoolDocumentPermissions)
        .leftJoin(documentTemplates, eq(schoolDocumentPermissions.documentTypeId, documentTemplates.id))
        .where(
          and(
            eq(schoolDocumentPermissions.schoolId, parseInt(schoolId)),
            eq(schoolDocumentPermissions.documentTypeId, parseInt(documentTypeId))
          )
        )
        .limit(1);

      if (permission.length === 0) {
        return res.json({
          hasPermission: false,
          isAllowed: false,
          message: 'No permission record found'
        });
      }

      res.json({
        hasPermission: true,
        ...permission[0]
      });
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({ error: 'Failed to check permission' });
    }
  });

  // Analytics for super admin
  app.get('/api/super-admin/analytics/document-usage', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const analytics = await db
        .select({
          documentTypeId: documentTemplates.id,
          documentName: documentTemplates.name,
          documentNameBn: documentTemplates.nameBn,
          category: documentTemplates.category,
          totalSchoolsWithAccess: sql<number>`COUNT(CASE WHEN ${schoolDocumentPermissions.isAllowed} = true THEN 1 END)`,
          totalUsage: sql<number>`COALESCE(SUM(${documentTemplates.usageCount}), 0)`,
          averageCreditsPerUse: sql<number>`AVG(${schoolDocumentPermissions.creditsPerUse})`
        })
        .from(documentTemplates)
        .leftJoin(schoolDocumentPermissions, eq(documentTemplates.id, schoolDocumentPermissions.documentTypeId))
        .groupBy(documentTemplates.id, documentTemplates.name, documentTemplates.nameBn, documentTemplates.category)
        .orderBy(sql`totalUsage DESC`);

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });
}