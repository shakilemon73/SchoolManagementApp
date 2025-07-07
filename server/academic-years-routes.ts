import { Express, Request, Response } from 'express';
import { db } from '../db/index';
import { academicYears, academicTerms } from '../shared/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export function registerAcademicYearsRoutes(app: Express) {
  // Get academic years statistics - placed first to avoid route conflicts
  app.get('/api/academic-years/stats', async (req: Request, res: Response) => {
    try {
      const stats = await db.select({
        totalYears: sql<number>`count(*)`,
        activeYears: sql<number>`count(*) filter (where is_active = true)`,
        completedYears: sql<number>`count(*) filter (where status = 'completed')`,
        currentYear: sql<number>`count(*) filter (where is_current = true)`,
      }).from(academicYears);

      const termsStats = await db.select({
        totalTerms: sql<number>`count(*)`,
        currentTerms: sql<number>`count(*) filter (where status = 'ongoing')`,
      }).from(academicTerms);

      res.json({
        ...stats[0],
        ...termsStats[0],
        totalStudents: 0 // Will be calculated from actual student data
      });
    } catch (error) {
      console.error('Error fetching academic years stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // Get current academic year
  app.get('/api/academic-years/current', async (req: Request, res: Response) => {
    try {
      const [currentYear] = await db.select().from(academicYears)
        .where(eq(academicYears.isCurrent, true));
      
      res.json(currentYear || null);
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      res.status(500).json({ error: 'Failed to fetch current academic year' });
    }
  });

  // Get all academic years with real database integration
  app.get('/api/academic-years', async (req: Request, res: Response) => {
    try {
      const years = await db.select().from(academicYears).orderBy(desc(academicYears.createdAt));
      res.json(years);
    } catch (error) {
      console.error('Error fetching academic years:', error);
      res.status(500).json({ error: 'Failed to fetch academic years' });
    }
  });

  // Get academic year by ID
  app.get('/api/academic-years/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [year] = await db.select().from(academicYears).where(eq(academicYears.id, parseInt(id)));
      
      if (!year) {
        return res.status(404).json({ error: 'Academic year not found' });
      }
      
      res.json(year);
    } catch (error) {
      console.error('Error fetching academic year:', error);
      res.status(500).json({ error: 'Failed to fetch academic year' });
    }
  });

  // Create new academic year
  app.post('/api/academic-years', async (req: Request, res: Response) => {
    try {
      const yearData = req.body;
      
      // If this year is marked as current, unset other current years
      if (yearData.isCurrent) {
        await db.update(academicYears).set({ isCurrent: false });
      }
      
      const [newYear] = await db.insert(academicYears).values({
        name: yearData.name,
        nameBn: yearData.nameBn,
        startDate: yearData.startDate,
        endDate: yearData.endDate,
        description: yearData.description,
        descriptionBn: yearData.descriptionBn,
        isActive: yearData.isActive || false,
        isCurrent: yearData.isCurrent || false,
        status: yearData.status || 'draft',
        schoolId: 1
      }).returning();
      
      res.json(newYear);
    } catch (error) {
      console.error('Error creating academic year:', error);
      res.status(500).json({ error: 'Failed to create academic year' });
    }
  });

  // Update academic year
  app.patch('/api/academic-years/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // If this year is marked as current, unset other current years
      if (updateData.isCurrent) {
        await db.update(academicYears).set({ isCurrent: false });
      }
      
      const [updatedYear] = await db.update(academicYears)
        .set(updateData)
        .where(eq(academicYears.id, parseInt(id)))
        .returning();
      
      res.json(updatedYear);
    } catch (error) {
      console.error('Error updating academic year:', error);
      res.status(500).json({ error: 'Failed to update academic year' });
    }
  });

  // Delete academic year
  app.delete('/api/academic-years/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if there are related terms
      const relatedTerms = await db.select().from(academicTerms)
        .where(eq(academicTerms.academicYearId, parseInt(id)));
      
      if (relatedTerms.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete academic year with existing terms' 
        });
      }
      
      await db.delete(academicYears).where(eq(academicYears.id, parseInt(id)));
      res.json({ message: 'Academic year deleted successfully' });
    } catch (error) {
      console.error('Error deleting academic year:', error);
      res.status(500).json({ error: 'Failed to delete academic year' });
    }
  });



  // Toggle academic year status
  app.patch('/api/academic-years/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const [updatedYear] = await db.update(academicYears)
        .set({ status })
        .where(eq(academicYears.id, parseInt(id)))
        .returning();
      
      res.json(updatedYear);
    } catch (error) {
      console.error('Error updating academic year status:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  // Set current academic year
  app.patch('/api/academic-years/:id/set-current', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // First, unset all current years
      await db.update(academicYears).set({ isCurrent: false });
      
      // Then set the specified year as current
      const [updatedYear] = await db.update(academicYears)
        .set({ isCurrent: true, isActive: true, status: 'active' })
        .where(eq(academicYears.id, parseInt(id)))
        .returning();
      
      res.json(updatedYear);
    } catch (error) {
      console.error('Error setting current academic year:', error);
      res.status(500).json({ error: 'Failed to set current year' });
    }
  });
}