import { Express, Request, Response } from 'express';
import { db } from './db';
import { eq, desc } from 'drizzle-orm';
import { users, students } from '../shared/schema';

// Request interface extension
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}

// Middleware to ensure teacher or admin authentication
const requireTeacherAccess = async (req: Request, res: Response, next: any) => {
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
  app.get("/api/teachers/dashboard", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      // Use Supabase client to avoid control plane issues
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      let totalStudents = 5; // fallback
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { count } = await supabase.from('students').select('id', { count: 'exact', head: true });
        totalStudents = count || 5;
      }
      
      const dashboard = {
        todayClasses: 6,
        totalStudents,
        pendingAssignments: 3,
        attendanceRate: 92,
        recentActivities: [
          {
            type: 'attendance',
            title: 'উপস্থিতি নেওয়া হয়েছে',
            subtitle: 'ষষ্ঠ ক - বাংলা',
            time: '৩০ মিনিট আগে'
          },
          {
            type: 'assignment',
            title: 'নতুন অ্যাসাইনমেন্ট দেওয়া হয়েছে',
            subtitle: 'সপ্তম খ - গদ্য পাঠ',
            time: '১ ঘন্টা আগে'
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
  app.get("/api/teachers/classes", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      const classes = [
        { id: 1, name: 'ষষ্ঠ শ্রেণী', section: 'ক' },
        { id: 2, name: 'সপ্তম শ্রেণী', section: 'খ' },
        { id: 3, name: 'অষ্টম শ্রেণী', section: 'গ' },
        { id: 4, name: 'নবম শ্রেণী', section: 'ক' }
      ];

      res.json(classes);
    } catch (error: any) {
      console.error('Error fetching teacher classes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Teacher's Subjects
  app.get("/api/teachers/subjects", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      const subjects = [
        { id: 1, name: 'বাংলা' },
        { id: 2, name: 'ইংরেজি' },
        { id: 3, name: 'গণিত' },
        { id: 4, name: 'বিজ্ঞান' }
      ];

      res.json(subjects);
    } catch (error: any) {
      console.error('Error fetching teacher subjects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Students for attendance
  app.get("/api/students", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      const { class: className } = req.query;
      
      // Use Supabase client to avoid control plane issues
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.json([]);
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .limit(10);

      if (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ error: 'Failed to fetch students' });
      }
      
      const formattedStudents = (studentsData || []).map((student, index) => ({
        id: student.id,
        name: student.name || `ছাত্র ${index + 1}`,
        nameInBangla: student.name_in_bangla || `ছাত্র ${index + 1}`,
        rollNumber: student.roll_number || (index + 1).toString(),
        class: student.class || className,
        section: student.section || 'ক'
      }));

      res.json(formattedStudents);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Attendance endpoints
  app.get("/api/attendance", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      // Return empty attendance for now - can be expanded later
      res.json([]);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/attendance/save", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      // Mock save for now
      res.json({ success: true, message: 'Attendance saved successfully' });
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Attendance Statistics
  app.get("/api/attendance/stats", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      res.json({
        totalDays: 150,
        averageAttendance: 92
      });
    } catch (error: any) {
      console.error('Error fetching attendance stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Lesson Plans
  app.get("/api/lesson-plans", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      const lessonPlans = [
        {
          id: 1,
          title: 'বাংলা ব্যাকরণ - সন্ধি',
          subject: 'বাংলা',
          class: 'ষষ্ঠ ক',
          duration: '৪৫ মিনিট',
          date: '2025-06-02',
          objectives: 'সন্ধির নিয়ম ও প্রয়োগ শেখানো',
          status: 'active'
        },
        {
          id: 2,
          title: 'English Grammar - Tenses',
          subject: 'ইংরেজি',
          class: 'সপ্তম খ',
          duration: '৪৫ মিনিট',
          date: '2025-06-03',
          objectives: 'Present tense এর ব্যবহার শেখানো',
          status: 'planned'
        }
      ];

      res.json(lessonPlans);
    } catch (error: any) {
      console.error('Error fetching lesson plans:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/lesson-plans", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      // Mock creation for now
      res.json({ success: true, id: Date.now() });
    } catch (error: any) {
      console.error('Error creating lesson plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch("/api/lesson-plans/:id", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating lesson plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete("/api/lesson-plans/:id", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting lesson plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Assignments
  app.get("/api/assignments", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      const assignments = [
        {
          id: 1,
          title: 'বাংলা রচনা - আমার প্রিয় ঋতু',
          subject: 'বাংলা',
          class: 'ষষ্ঠ ক',
          description: '২০০ শব্দের মধ্যে রচনা লিখতে হবে',
          dueDate: '2025-06-10',
          maxMarks: 20,
          difficulty: 'easy',
          status: 'active',
          submissionCount: 15,
          totalStudents: 25
        },
        {
          id: 2,
          title: 'গণিত সমস্যা সমাধান',
          subject: 'গণিত',
          class: 'সপ্তম খ',
          description: 'বীজগণিতের ১০টি সমস্যা সমাধান করতে হবে',
          dueDate: '2025-06-08',
          maxMarks: 50,
          difficulty: 'medium',
          status: 'active',
          submissionCount: 8,
          totalStudents: 30
        }
      ];

      res.json(assignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/assignments", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      res.json({ success: true, id: Date.now() });
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch("/api/assignments/:id", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete("/api/assignments/:id", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Teacher Schedule
  app.get("/api/teachers/schedule", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
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
          room: '৩০৩',
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
  app.get("/api/teachers/stats", requireTeacherAccess, async (req: Request, res: Response) => {
    try {
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
  app.get("/api/teachers/notifications", requireTeacherAccess, async (req: Request, res: Response) => {
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
  app.get("/api/teachers/overview", requireTeacherAccess, async (req: Request, res: Response) => {
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