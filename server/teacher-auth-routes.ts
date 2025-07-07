import { Express, Request, Response } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { comparePasswords } from './auth';
import jwt from 'jsonwebtoken';

// Teacher session storage
const teacherSessions = new Map<string, any>();

// Teacher authentication middleware
export const requireTeacherAuth = (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Check for demo session
      const sessionId = req.headers['x-teacher-session'] as string;
      if (sessionId && teacherSessions.has(sessionId)) {
        req.teacherUser = teacherSessions.get(sessionId);
        return next();
      }
      
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    req.teacherUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      teacherUser?: any;
    }
  }
}

export function registerTeacherAuthRoutes(app: Express) {
  
  // Teacher Login
  app.post('/api/teacher/login', async (req: Request, res: Response) => {
    try {
      const { teacherId, password } = req.body;

      // Demo authentication
      if (teacherId === 'demo' && password === '1234') {
        const demoTeacher = {
          id: 'demo',
          name: 'ডেমো শিক্ষক',
          email: 'demo@school.edu',
          teacherId: 'demo',
          subjects: ['গণিত', 'বিজ্ঞান'],
          classes: ['৮ম শ্রেণি', '৯ম শ্রেণি']
        };

        // Create session
        const sessionId = `demo-${Date.now()}`;
        teacherSessions.set(sessionId, demoTeacher);

        return res.json({
          success: true,
          teacher: demoTeacher,
          sessionId,
          token: jwt.sign(demoTeacher, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' })
        });
      }

      // Real teacher authentication
      const teacher = await db.query.users.findFirst({
        where: eq(schema.users.username, teacherId)
      });

      if (!teacher || teacher.role !== 'teacher') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await comparePasswords(password, teacher.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const teacherData = {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        teacherId: teacher.username,
        role: teacher.role
      };

      const token = jwt.sign(teacherData, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

      res.json({
        success: true,
        teacher: teacherData,
        token
      });

    } catch (error: any) {
      console.error('Teacher login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Teacher Profile
  app.get('/api/teacher/profile', requireTeacherAuth, async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        teacher: req.teacherUser
      });
    } catch (error: any) {
      console.error('Teacher profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Teacher Dashboard Stats
  app.get('/api/teacher/stats', requireTeacherAuth, async (req: Request, res: Response) => {
    try {
      // Return demo stats for now
      const stats = {
        totalStudents: 156,
        totalClasses: 8,
        todaysClasses: 4,
        pendingAssignments: 12,
        attendanceRate: 92
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Teacher stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Teacher Classes
  app.get('/api/teacher/classes', requireTeacherAuth, async (req: Request, res: Response) => {
    try {
      const classes = [
        { id: 1, name: '৮ম শ্রেণি', section: 'A', students: 45 },
        { id: 2, name: '৯ম শ্রেণি', section: 'B', students: 42 },
        { id: 3, name: '১০ম শ্রেণি', section: 'A', students: 38 }
      ];

      res.json(classes);
    } catch (error: any) {
      console.error('Teacher classes error:', error);
      res.status(500).json({ error: 'Failed to fetch classes' });
    }
  });

  // Teacher Subjects
  app.get('/api/teacher/subjects', requireTeacherAuth, async (req: Request, res: Response) => {
    try {
      const subjects = [
        { id: 1, name: 'গণিত', code: 'MATH' },
        { id: 2, name: 'বিজ্ঞান', code: 'SCI' },
        { id: 3, name: 'ইংরেজি', code: 'ENG' },
        { id: 4, name: 'বাংলা', code: 'BAN' }
      ];

      res.json(subjects);
    } catch (error: any) {
      console.error('Teacher subjects error:', error);
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  });

  // Teacher Assignments
  app.get('/api/teacher/assignments', requireTeacherAuth, async (req: Request, res: Response) => {
    try {
      const assignments = [
        {
          id: 1,
          title: 'গণিত অনুশীলনী ১',
          description: 'অধ্যায় ৫ এর সমস্ত অনুশীলনী সম্পন্ন করুন',
          subject: { name: 'গণিত' },
          class: { name: '৮ম শ্রেণি' },
          dueDate: '2024-02-15',
          totalMarks: 100,
          status: 'active',
          assignmentType: 'homework',
          createdAt: '2024-02-01'
        },
        {
          id: 2,
          title: 'বিজ্ঞান প্রকল্প',
          description: 'পরিবেশ দূষণ নিয়ে একটি প্রতিবেদন তৈরি করুন',
          subject: { name: 'বিজ্ঞান' },
          class: { name: '৯ম শ্রেণি' },
          dueDate: '2024-02-20',
          totalMarks: 50,
          status: 'active',
          assignmentType: 'project',
          createdAt: '2024-02-02'
        },
        {
          id: 3,
          title: 'ইংরেজি রচনা',
          description: 'My Future Dreams বিষয়ে একটি রচনা লিখুন',
          subject: { name: 'ইংরেজি' },
          class: { name: '১০ম শ্রেণি' },
          dueDate: '2024-02-10',
          totalMarks: 25,
          status: 'completed',
          assignmentType: 'essay',
          createdAt: '2024-01-25'
        }
      ];

      res.json(assignments);
    } catch (error: any) {
      console.error('Teacher assignments error:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  // Create Assignment
  app.post('/api/teacher/assignments', requireTeacherAuth, async (req: Request, res: Response) => {
    try {
      const assignmentData = req.body;
      
      // Simulate creating assignment
      const newAssignment = {
        id: Date.now(),
        ...assignmentData,
        status: 'active',
        createdAt: new Date().toISOString(),
        teacherId: req.teacherUser.id
      };

      res.json({
        success: true,
        assignment: newAssignment
      });
    } catch (error: any) {
      console.error('Create assignment error:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  });

  // Update Assignment
  app.patch('/api/teacher/assignments/:id', requireTeacherAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Simulate updating assignment
      res.json({
        success: true,
        assignment: { id: parseInt(id), ...updateData }
      });
    } catch (error: any) {
      console.error('Update assignment error:', error);
      res.status(500).json({ error: 'Failed to update assignment' });
    }
  });

  // Delete Assignment
  app.delete('/api/teacher/assignments/:id', requireTeacherAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Simulate deleting assignment
      res.json({
        success: true,
        message: 'Assignment deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete assignment error:', error);
      res.status(500).json({ error: 'Failed to delete assignment' });
    }
  });

  // Teacher Logout
  app.post('/api/teacher/logout', requireTeacherAuth, async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['x-teacher-session'] as string;
      if (sessionId) {
        teacherSessions.delete(sessionId);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      console.error('Teacher logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });
}