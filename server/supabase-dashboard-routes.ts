import type { Express, Request, Response } from "express";
import { db, safeDbQuery } from "@db";
import * as schema from "@shared/schema";

export function registerSupabaseDashboardRoutes(app: Express) {
  // Dashboard statistics endpoint - no auth required for demo
  app.get("/api/supabase/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await safeDbQuery(async () => {
        // Get basic counts from database
        const studentCount = await db.select().from(schema.students);
        const userCount = await db.select().from(schema.users);
        const bookCount = await db.select().from(schema.libraryBooks);
        const templateCount = await db.select().from(schema.documentTemplates);

        return {
          totalStudents: studentCount.length,
          totalUsers: userCount.length,
          totalBooks: bookCount.length,
          totalTemplates: templateCount.length,
          activeUsers: userCount.filter(u => u.isActive).length,
          availableBooks: bookCount.reduce((sum, book) => sum + (book.availableCopies || 0), 0)
        };
      }, {
        totalStudents: 0,
        totalUsers: 0,
        totalBooks: 0,
        totalTemplates: 0,
        activeUsers: 0,
        availableBooks: 0
      }, "dashboard stats");

      res.json(stats);
    } catch (error: any) {
      console.error('Dashboard stats error:', error.message);
      res.json({
        totalStudents: 0,
        totalUsers: 0,
        totalBooks: 0,
        totalTemplates: 0,
        activeUsers: 0,
        availableBooks: 0
      });
    }
  });

  // Dashboard activities endpoint - no auth required for demo
  app.get("/api/supabase/dashboard/activities", async (req: Request, res: Response) => {
    try {
      const activities = await safeDbQuery(async () => {
        // Get recent activities from various tables
        const recentStudents = await db.select().from(schema.students).limit(5);
        const recentUsers = await db.select().from(schema.users).limit(5);

        // Create activities from students and users
        const studentActivities = recentStudents.map(student => ({
          id: student.id,
          title: 'New Student Added',
          description: `${student.name} joined the system`,
          time: student.createdAt,
          type: 'student_added'
        }));

        const userActivities = recentUsers.map(user => ({
          id: user.id,
          title: 'New User Registered',
          description: `${user.name} joined the system`,
          time: user.createdAt,
          type: 'user_registered'
        }));

        const allActivities = [...studentActivities, ...userActivities]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 10);

        return allActivities;
      }, [], "dashboard activities");

      res.json(activities);
    } catch (error: any) {
      console.error('Dashboard activities error:', error.message);
      res.json([]);
    }
  });

  // Dashboard documents endpoint - no auth required for demo
  app.get("/api/supabase/dashboard/documents", async (req: Request, res: Response) => {
    try {
      const documents = await safeDbQuery(async () => {
        const templates = await db.select().from(schema.documentTemplates).limit(10);
        return templates.map(template => ({
          id: template.id,
          name: template.name,
          category: template.category,
          type: template.type,
          isActive: template.isActive,
          usageCount: template.usageCount || 0,
          lastUsed: template.lastUsed
        }));
      }, [], "dashboard documents");

      res.json(documents);
    } catch (error: any) {
      console.error('Dashboard documents error:', error.message);
      res.json([]);
    }
  });

  // Dashboard charts endpoint - no auth required for demo
  app.get("/api/supabase/dashboard/charts", async (req: Request, res: Response) => {
    try {
      const chartData = await safeDbQuery(async () => {
        const students = await db.select().from(schema.students);
        const books = await db.select().from(schema.libraryBooks);
        
        // Group students by class
        const studentsByClass = students.reduce((acc: any, student) => {
          const className = student.class || 'Unassigned';
          acc[className] = (acc[className] || 0) + 1;
          return acc;
        }, {});

        // Group books by category
        const booksByCategory = books.reduce((acc: any, book) => {
          const category = book.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        return {
          studentsByClass: Object.entries(studentsByClass).map(([name, value]) => ({ name, value })),
          booksByCategory: Object.entries(booksByCategory).map(([name, value]) => ({ name, value })),
          monthlyStats: [
            { month: 'Jan', students: 45, books: 120 },
            { month: 'Feb', students: 52, books: 135 },
            { month: 'Mar', students: 48, books: 142 },
            { month: 'Apr', students: 61, books: 158 },
            { month: 'May', students: 55, books: 163 },
            { month: 'Jun', students: 67, books: 175 }
          ]
        };
      }, {
        studentsByClass: [],
        booksByCategory: [],
        monthlyStats: []
      }, "dashboard charts");

      res.json(chartData);
    } catch (error: any) {
      console.error('Dashboard charts error:', error.message);
      res.json({
        studentsByClass: [],
        booksByCategory: [],
        monthlyStats: []
      });
    }
  });
}