import { Express, Request, Response } from 'express';
import { db } from '@db/index';
import { sql } from 'drizzle-orm';

export function registerSimpleClassRoutes(app: Express) {
  // Get all class routines
  app.get('/api/class-routines', async (req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          id, 
          class_name as "className", 
          section, 
          academic_year as "academicYear", 
          institute_name as "instituteName", 
          class_teacher as "classTeacher", 
          effective_date as "effectiveDate", 
          status, 
          created_at as "createdAt", 
          updated_at as "updatedAt" 
        FROM class_routines 
        ORDER BY created_at DESC
      `);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching class routines:', error);
      res.status(500).json({ message: 'Failed to fetch class routines' });
    }
  });

  // Get class routine stats
  app.get('/api/class-routines/stats', async (req: Request, res: Response) => {
    try {
      const result = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
          COUNT(DISTINCT class_teacher) as teachers
        FROM class_routines
      `;
      
      const stats = result[0];
      res.json({
        total: parseInt(stats.total),
        active: parseInt(stats.active),
        draft: parseInt(stats.draft),
        teachers: parseInt(stats.teachers)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Create new class routine
  app.post('/api/class-routines', async (req: Request, res: Response) => {
    try {
      const { routine } = req.body;
      
      const result = await sql`
        INSERT INTO class_routines 
        (class_name, section, academic_year, institute_name, class_teacher, effective_date, status)
        VALUES (${routine.className}, ${routine.section}, ${routine.academicYear}, ${routine.instituteName}, ${routine.classTeacher}, ${routine.effectiveDate}, 'draft')
        RETURNING 
          id, 
          class_name as "className", 
          section, 
          academic_year as "academicYear", 
          institute_name as "instituteName", 
          class_teacher as "classTeacher", 
          effective_date as "effectiveDate", 
          status, 
          created_at as "createdAt"
      `;
      
      res.json(result[0]);
    } catch (error) {
      console.error('Error creating class routine:', error);
      res.status(500).json({ message: 'Failed to create class routine' });
    }
  });
}