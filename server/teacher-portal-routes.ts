import { Express, Request, Response } from 'express';
import { db } from './db';
import { eq, and, desc, asc, like, gte, lte, isNull, isNotNull } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { z } from 'zod';

// Request interface extension
declare module 'express-serve-static-core' {
  interface Request {
    user?: schema.User;
  }
}

// Middleware to ensure teacher authentication (admins can also access for management)
const requireTeacher = async (req: Request, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Allow both teachers and admins to access teacher portal
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Teacher or admin access required' });
    }

    next();
  } catch (error: any) {
    console.error('Teacher auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

export function registerTeacherPortalRoutes(app: Express) {
  
  // Teacher Dashboard Overview
  app.get("/api/teachers/dashboard", requireTeacher, async (req: Request, res: Response) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get teacher's classes count
      const classesResult = await db.execute({
        sql: `SELECT COUNT(*) as count FROM classes WHERE class_teacher_id = $1`,
        args: [req.user!.id]
      });
      
      // Get total students in teacher's classes
      const studentsResult = await db.execute({
        sql: `SELECT COUNT(*) as count FROM students s 
              JOIN classes c ON s.class = c.name 
              WHERE c.class_teacher_id = $1`,
        args: [req.user!.id]
      });

      // Get today's attendance rate
      const attendanceResult = await db.execute({
        sql: `SELECT 
                COUNT(*) as total_students,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
              FROM attendance a
              JOIN students s ON a.student_id = s.id
              JOIN classes c ON s.class = c.name
              WHERE c.class_teacher_id = $1 AND DATE(a.date) = $2`,
        args: [req.user!.id, today]
      });

      // Get pending assignments count
      const assignmentsResult = await db.execute({
        sql: `SELECT COUNT(*) as count FROM assignments 
              WHERE teacher_id = $1 AND status = 'active'`,
        args: [req.user!.id]
      });

      const dashboard = {
        todayClasses: 6, // This would come from schedule
        totalStudents: studentsResult.rows[0]?.count || 0,
        pendingAssignments: assignmentsResult.rows[0]?.count || 0,
        attendanceRate: attendanceResult.rows[0]?.total_students > 0 
          ? Math.round((attendanceResult.rows[0]?.present_count / attendanceResult.rows[0]?.total_students) * 100)
          : 0,
        recentActivities: [
          {
            type: 'attendance',
            title: 'উপস্থিতি নেওয়া হয়েছে',
            subtitle: 'ষষ্ঠ ক - বাংলা',
            time: '৩০ মিনিট আগে'
          }
        ]
      };

      res.json(dashboard);
    } catch (error: any) {
      console.error('Error fetching teacher dashboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Teacher's Classes
  app.get("/api/teachers/classes", requireTeacher, async (req: Request, res: Response) => {
    try {
      const classes = await db.execute({
        sql: `SELECT id, name, section FROM classes WHERE class_teacher_id = $1 ORDER BY name`,
        args: [req.user!.id]
      });

      res.json(classes.rows);
    } catch (error: any) {
      console.error('Error fetching teacher classes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Teacher's Subjects
  app.get("/api/teachers/subjects", requireTeacher, async (req: Request, res: Response) => {
    try {
      const subjects = await db.execute({
        sql: `SELECT DISTINCT subject as name FROM teachers WHERE id = $1`,
        args: [req.user!.id]
      });

      res.json(subjects.rows.map(row => ({ id: row.name, name: row.name })));
    } catch (error: any) {
      console.error('Error fetching teacher subjects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Attendance Management
  app.get("/api/attendance", requireTeacher, async (req: Request, res: Response) => {
    try {
      const { date, class: className, subject } = req.query;

      const attendance = await db.execute({
        sql: `SELECT a.*, s.name as student_name, s.name_in_bangla, s.roll_number
              FROM attendance a
              JOIN students s ON a.student_id = s.id
              WHERE DATE(a.date) = $1 AND a.class = $2 AND a.subject = $3`,
        args: [date, className, subject]
      });

      res.json(attendance.rows);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/attendance/save", requireTeacher, async (req: Request, res: Response) => {
    try {
      const { date, class: className, subject, attendance } = req.body;

      // Delete existing attendance for this date/class/subject
      await db.execute({
        sql: `DELETE FROM attendance WHERE date = $1 AND class = $2 AND subject = $3`,
        args: [date, className, subject]
      });

      // Insert new attendance records
      for (const record of attendance) {
        await db.execute({
          sql: `INSERT INTO attendance (student_id, date, class, subject, status, remarks, teacher_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          args: [
            record.studentId,
            date,
            className,
            subject,
            record.status,
            record.remarks || '',
            req.user!.id
          ]
        });
      }

      res.json({ success: true, message: 'Attendance saved successfully' });
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Attendance Statistics
  app.get("/api/attendance/stats", requireTeacher, async (req: Request, res: Response) => {
    try {
      const { class: className } = req.query;

      const stats = await db.execute({
        sql: `SELECT 
                COUNT(*) as total_days,
                AVG(CASE WHEN status = 'present' THEN 1.0 ELSE 0.0 END) * 100 as average_attendance
              FROM attendance 
              WHERE class = $1 AND teacher_id = $2`,
        args: [className, req.user!.id]
      });

      res.json({
        totalDays: stats.rows[0]?.total_days || 0,
        averageAttendance: Math.round(stats.rows[0]?.average_attendance || 0)
      });
    } catch (error: any) {
      console.error('Error fetching attendance stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Lesson Plans
  app.get("/api/lesson-plans", requireTeacher, async (req: Request, res: Response) => {
    try {
      const lessonPlans = await db.execute({
        sql: `SELECT * FROM lesson_plans WHERE teacher_id = $1 ORDER BY date DESC`,
        args: [req.user!.id]
      });

      res.json(lessonPlans.rows);
    } catch (error: any) {
      console.error('Error fetching lesson plans:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/lesson-plans", requireTeacher, async (req: Request, res: Response) => {
    try {
      const planData = req.body;

      const result = await db.execute({
        sql: `INSERT INTO lesson_plans (
                title, subject, class, duration, date, objectives, materials,
                introduction, main_content, activities, assessment, homework, notes, teacher_id
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
              RETURNING id`,
        args: [
          planData.title,
          planData.subject,
          planData.class,
          planData.duration,
          planData.date,
          planData.objectives,
          planData.materials,
          planData.introduction,
          planData.mainContent,
          planData.activities,
          planData.assessment,
          planData.homework || '',
          planData.notes || '',
          req.user!.id
        ]
      });

      res.json({ success: true, id: result.rows[0]?.id });
    } catch (error: any) {
      console.error('Error creating lesson plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch("/api/lesson-plans/:id", requireTeacher, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const planData = req.body;

      await db.execute({
        sql: `UPDATE lesson_plans SET 
                title = $1, subject = $2, class = $3, duration = $4, date = $5,
                objectives = $6, materials = $7, introduction = $8, main_content = $9,
                activities = $10, assessment = $11, homework = $12, notes = $13,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = $14 AND teacher_id = $15`,
        args: [
          planData.title,
          planData.subject,
          planData.class,
          planData.duration,
          planData.date,
          planData.objectives,
          planData.materials,
          planData.introduction,
          planData.mainContent,
          planData.activities,
          planData.assessment,
          planData.homework || '',
          planData.notes || '',
          id,
          req.user!.id
        ]
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating lesson plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete("/api/lesson-plans/:id", requireTeacher, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await db.execute({
        sql: `DELETE FROM lesson_plans WHERE id = $1 AND teacher_id = $2`,
        args: [id, req.user!.id]
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting lesson plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Assignments
  app.get("/api/assignments", requireTeacher, async (req: Request, res: Response) => {
    try {
      const assignments = await db.execute({
        sql: `SELECT a.*, 
                COUNT(s.id) as submission_count,
                (SELECT COUNT(*) FROM students st JOIN classes c ON st.class = c.name 
                 WHERE c.name = a.class) as total_students
              FROM assignments a
              LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
              WHERE a.teacher_id = $1
              GROUP BY a.id
              ORDER BY a.created_at DESC`,
        args: [req.user!.id]
      });

      res.json(assignments.rows.map(assignment => ({
        ...assignment,
        status: new Date(assignment.due_date) < new Date() ? 'overdue' : 'active'
      })));
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/assignments", requireTeacher, async (req: Request, res: Response) => {
    try {
      const assignmentData = req.body;

      const result = await db.execute({
        sql: `INSERT INTO assignments (
                title, subject, class, description, instructions, due_date,
                max_marks, type, difficulty, attachments, notes, teacher_id, status
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
              RETURNING id`,
        args: [
          assignmentData.title,
          assignmentData.subject,
          assignmentData.class,
          assignmentData.description,
          assignmentData.instructions,
          assignmentData.dueDate,
          parseInt(assignmentData.maxMarks),
          assignmentData.type,
          assignmentData.difficulty,
          assignmentData.attachments || '',
          assignmentData.notes || '',
          req.user!.id
        ]
      });

      res.json({ success: true, id: result.rows[0]?.id });
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch("/api/assignments/:id", requireTeacher, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const assignmentData = req.body;

      await db.execute({
        sql: `UPDATE assignments SET 
                title = $1, subject = $2, class = $3, description = $4,
                instructions = $5, due_date = $6, max_marks = $7, type = $8,
                difficulty = $9, attachments = $10, notes = $11, updated_at = CURRENT_TIMESTAMP
              WHERE id = $12 AND teacher_id = $13`,
        args: [
          assignmentData.title,
          assignmentData.subject,
          assignmentData.class,
          assignmentData.description,
          assignmentData.instructions,
          assignmentData.dueDate,
          parseInt(assignmentData.maxMarks),
          assignmentData.type,
          assignmentData.difficulty,
          assignmentData.attachments || '',
          assignmentData.notes || '',
          id,
          req.user!.id
        ]
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete("/api/assignments/:id", requireTeacher, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await db.execute({
        sql: `DELETE FROM assignments WHERE id = $1 AND teacher_id = $2`,
        args: [id, req.user!.id]
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Teacher Schedule
  app.get("/api/teachers/schedule", requireTeacher, async (req: Request, res: Response) => {
    try {
      const { period = 'today' } = req.query;
      
      // Mock schedule data - in real implementation, this would come from a schedule table
      const schedule = [
        {
          time: '৮:০০ - ৮:৪৫',
          subject: 'বাংলা',
          class: 'ষষ্ঠ ক',
          room: '১০১',
          status: 'completed'
        },
        {
          time: '৮:৪৫ - ৯:৩০',
          subject: 'বাংলা',
          class: 'সপ্তম খ',
          room: '২০২',
          status: 'current'
        },
        {
          time: '১০:১৫ - ১১:০০',
          subject: 'বাংলা',
          class: 'অষ্টম গ',
          room: '৩০ৃ',
          status: 'upcoming'
        }
      ];

      res.json(schedule);
    } catch (error: any) {
      console.error('Error fetching teacher schedule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Teacher Statistics
  app.get("/api/teachers/stats", requireTeacher, async (req: Request, res: Response) => {
    try {
      // Get basic teacher stats
      const stats = {
        totalClasses: 4,
        totalStudents: 128,
        activeAssignments: 8,
        averageAttendance: 92
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching teacher stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Teacher Notifications
  app.get("/api/teachers/notifications", requireTeacher, async (req: Request, res: Response) => {
    try {
      const notifications = [
        {
          id: 1,
          title: 'নতুন অ্যাসাইনমেন্ট জমা',
          message: 'সপ্তম শ্রেণীর ৩ জন ছাত্র অ্যাসাইনমেন্ট জমা দিয়েছে',
          type: 'assignment',
          time: '৩০ মিনিট আগে',
          isRead: false
        },
        {
          id: 2,
          title: 'অভিভাবক সভার মনে করিয়ে দেওয়া',
          message: 'আগামীকাল সকাল ১০টায় অভিভাবক সভা',
          type: 'meeting',
          time: '২ ঘন্টা আগে',
          isRead: false
        }
      ];

      res.json(notifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Teacher Overview for Portal Home
  app.get("/api/teachers/overview", requireTeacher, async (req: Request, res: Response) => {
    try {
      const overview = {
        todayClasses: 6,
        completedClasses: 4,
        totalStudents: 128,
        pendingTasks: 3,
        attendanceRate: 92
      };

      res.json(overview);
    } catch (error: any) {
      console.error('Error fetching teacher overview:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}