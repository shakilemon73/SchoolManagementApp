import { Express, Request, Response } from 'express';
import { db } from './db';
import { classRoutines, routinePeriods, teachers, students, classes } from '../shared/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const classRoutineSchema = z.object({
  className: z.string().min(1),
  section: z.string().min(1),
  academicYear: z.string().min(1),
  semester: z.string().optional(),
  instituteName: z.string().min(1),
  instituteAddress: z.string().optional(),
  classTeacher: z.string().min(1),
  totalStudents: z.number().optional(),
  effectiveDate: z.string(),
  weekStructure: z.enum(['5-day', '6-day']).default('6-day'),
  periodsPerDay: z.number().min(5).max(10).default(7),
  periodDuration: z.number().min(30).max(60).default(45),
  startTime: z.string().default('08:00'),
  includeBreaks: z.boolean().default(true),
  prayerBreaks: z.any().optional(),
  template: z.enum(['standard', 'compact', 'detailed', 'wall']).default('standard'),
  colorCoding: z.boolean().default(true),
  showTeacherNames: z.boolean().default(true),
  showRoomNumbers: z.boolean().default(false),
  languageOption: z.enum(['english', 'bengali', 'bilingual']).default('bilingual'),
  paperSize: z.enum(['A4', 'A3', 'Letter']).default('A4'),
  orientation: z.enum(['portrait', 'landscape']).default('landscape'),
});

const routinePeriodSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  periodNumber: z.number().min(1),
  startTime: z.string(),
  endTime: z.string(),
  subject: z.string().min(1),
  subjectBn: z.string().optional(),
  teacherId: z.number().optional(),
  teacherName: z.string().min(1),
  roomNumber: z.string().optional(),
  periodType: z.enum(['regular', 'break', 'prayer', 'lunch']).default('regular'),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
});

export function registerClassRoutineRoutes(app: Express) {
  // Get all class routines with pagination and filters
  app.get('/api/class-routines', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, status = 'active', className, section } = req.query;
      
      let query = db.select().from(classRoutines);
      
      const conditions = [];
      if (status) conditions.push(eq(classRoutines.status, status as string));
      if (className) conditions.push(eq(classRoutines.className, className as string));
      if (section) conditions.push(eq(classRoutines.section, section as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const routines = await db.select().from(classRoutines)
        .orderBy(desc(classRoutines.createdAt))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));
      
      res.json(routines);
    } catch (error) {
      console.error('Error fetching class routines:', error);
      res.status(500).json({ message: 'Failed to fetch class routines' });
    }
  });

  // Get single class routine with periods
  app.get('/api/class-routines/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const routine = await db.select().from(classRoutines)
        .where(eq(classRoutines.id, Number(id)))
        .limit(1);
      
      if (!routine.length) {
        return res.status(404).json({ message: 'Class routine not found' });
      }
      
      const periods = await db.select().from(routinePeriods)
        .where(eq(routinePeriods.routineId, Number(id)))
        .orderBy(asc(routinePeriods.dayOfWeek), asc(routinePeriods.periodNumber));
      
      res.json({
        ...routine[0],
        periods
      });
    } catch (error) {
      console.error('Error fetching class routine:', error);
      res.status(500).json({ message: 'Failed to fetch class routine' });
    }
  });

  // Create new class routine
  app.post('/api/class-routines', async (req: Request, res: Response) => {
    try {
      const validatedData = classRoutineSchema.parse(req.body.routine);
      const periods = req.body.periods || [];
      
      // Insert routine
      const [newRoutine] = await db.insert(classRoutines).values({
        ...validatedData,
        schoolId: req.user?.schoolId || 1,
        createdBy: req.user?.id || 1,
      }).returning();
      
      // Insert periods if provided
      if (periods.length > 0) {
        const validatedPeriods = periods.map((period: any) => ({
          ...routinePeriodSchema.parse(period),
          routineId: newRoutine.id,
        }));
        
        await db.insert(routinePeriods).values(validatedPeriods);
      }
      
      res.status(201).json(newRoutine);
    } catch (error) {
      console.error('Error creating class routine:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create class routine' });
    }
  });

  // Update class routine
  app.patch('/api/class-routines/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const [updatedRoutine] = await db.update(classRoutines)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(classRoutines.id, Number(id)))
        .returning();
      
      if (!updatedRoutine) {
        return res.status(404).json({ message: 'Class routine not found' });
      }
      
      res.json(updatedRoutine);
    } catch (error) {
      console.error('Error updating class routine:', error);
      res.status(500).json({ message: 'Failed to update class routine' });
    }
  });

  // Delete class routine
  app.delete('/api/class-routines/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Delete periods first
      await db.delete(routinePeriods)
        .where(eq(routinePeriods.routineId, Number(id)));
      
      // Delete routine
      const [deletedRoutine] = await db.delete(classRoutines)
        .where(eq(classRoutines.id, Number(id)))
        .returning();
      
      if (!deletedRoutine) {
        return res.status(404).json({ message: 'Class routine not found' });
      }
      
      res.json({ message: 'Class routine deleted successfully' });
    } catch (error) {
      console.error('Error deleting class routine:', error);
      res.status(500).json({ message: 'Failed to delete class routine' });
    }
  });

  // Get available teachers
  app.get('/api/class-routines/teachers', async (req: Request, res: Response) => {
    try {
      const teachersList = await db.select({
        id: teachers.id,
        name: teachers.name,
        nameInBangla: teachers.nameInBangla,
        subject: teachers.subject,
        designation: teachers.designation,
      }).from(teachers)
        .where(eq(teachers.isActive, true))
        .orderBy(asc(teachers.name));
      
      res.json(teachersList);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      res.status(500).json({ message: 'Failed to fetch teachers' });
    }
  });

  // Get class routine statistics
  app.get('/api/class-routines/stats', async (req: Request, res: Response) => {
    try {
      const totalRoutines = await db.select().from(classRoutines);
      const activeRoutines = await db.select().from(classRoutines)
        .where(eq(classRoutines.status, 'active'));
      const draftRoutines = await db.select().from(classRoutines)
        .where(eq(classRoutines.status, 'draft'));
      
      res.json({
        total: totalRoutines.length,
        active: activeRoutines.length,
        draft: draftRoutines.length,
        archived: totalRoutines.length - activeRoutines.length - draftRoutines.length,
      });
    } catch (error) {
      console.error('Error fetching routine stats:', error);
      res.status(500).json({ message: 'Failed to fetch routine statistics' });
    }
  });

  // Duplicate class routine
  app.post('/api/class-routines/:id/duplicate', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Get original routine
      const [originalRoutine] = await db.select().from(classRoutines)
        .where(eq(classRoutines.id, Number(id)))
        .limit(1);
      
      if (!originalRoutine) {
        return res.status(404).json({ message: 'Class routine not found' });
      }
      
      // Get original periods
      const originalPeriods = await db.select().from(routinePeriods)
        .where(eq(routinePeriods.routineId, Number(id)));
      
      // Create new routine
      const { id: _, createdAt, updatedAt, ...routineData } = originalRoutine;
      const [newRoutine] = await db.insert(classRoutines).values({
        ...routineData,
        className: `${routineData.className} (Copy)`,
        status: 'draft',
        createdBy: req.user?.id || 1,
      }).returning();
      
      // Create new periods
      if (originalPeriods.length > 0) {
        const newPeriods = originalPeriods.map(({ id, routineId, createdAt, ...period }) => ({
          ...period,
          routineId: newRoutine.id,
        }));
        
        await db.insert(routinePeriods).values(newPeriods);
      }
      
      res.status(201).json(newRoutine);
    } catch (error) {
      console.error('Error duplicating class routine:', error);
      res.status(500).json({ message: 'Failed to duplicate class routine' });
    }
  });

  // Generate time slots
  app.get('/api/class-routines/time-slots', async (req: Request, res: Response) => {
    try {
      const { startTime = '08:00', periodDuration = 45, periodsPerDay = 7, includeBreaks = 'true' } = req.query;
      
      const slots = [];
      let currentTime = startTime as string;
      
      for (let i = 1; i <= Number(periodsPerDay); i++) {
        const [hours, minutes] = currentTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + Number(periodDuration);
        
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
        
        slots.push({
          period: i,
          startTime: currentTime,
          endTime,
          label: `Period ${i}`,
          labelBn: `${i}ম পিরিয়ড`,
        });
        
        // Add break after 3rd period if includeBreaks is true
        if (includeBreaks === 'true' && i === 3) {
          const breakStart = endTime;
          const breakEndMinutes = endMinutes + 15; // 15 minute break
          const breakEndHours = Math.floor(breakEndMinutes / 60);
          const breakEndMins = breakEndMinutes % 60;
          const breakEnd = `${breakEndHours.toString().padStart(2, '0')}:${breakEndMins.toString().padStart(2, '0')}`;
          
          slots.push({
            period: 'break',
            startTime: breakStart,
            endTime: breakEnd,
            label: 'Break',
            labelBn: 'বিরতি',
          });
          
          currentTime = breakEnd;
        } else {
          currentTime = endTime;
        }
      }
      
      res.json(slots);
    } catch (error) {
      console.error('Error generating time slots:', error);
      res.status(500).json({ message: 'Failed to generate time slots' });
    }
  });
}