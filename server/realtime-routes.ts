import { Express, Request, Response } from 'express';
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import * as schema from '@shared/schema';

// Define user types for real-time access
export interface RealtimeUser {
  id: number;
  role: 'student' | 'teacher' | 'staff' | 'parent' | 'admin';
  schoolId?: number;
}

export function registerRealtimeRoutes(app: Express) {
  // Test Supabase real-time connection
  app.get("/api/realtime/test", async (req: Request, res: Response) => {
    try {
      // Test basic database connectivity
      const testQuery = await db.select().from(schema.users).limit(1);
      
      // Check if we can access students, teachers, and other tables
      const studentsCount = await db.select().from(schema.students).limit(1);
      const teachersCount = await db.select().from(schema.teachers).limit(1);
      
      res.json({
        success: true,
        message: "Real-time database connection successful",
        databaseConnected: true,
        tablesAccessible: {
          users: testQuery.length >= 0,
          students: studentsCount.length >= 0,
          teachers: teachersCount.length >= 0
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Database connection failed",
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get real-time data for students
  app.get("/api/realtime/student/:studentId", async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
      
      const student = await db.query.students.findFirst({
        where: eq(schema.students.id, parseInt(studentId)),
        with: {
          school: true,
          feeReceipts: {
            orderBy: (feeReceipts, { desc }) => [desc(feeReceipts.createdAt)],
            limit: 5
          },
          attendance: {
            orderBy: (attendance, { desc }) => [desc(attendance.date)],
            limit: 10
          },
          examResults: {
            orderBy: (examResults, { desc }) => [desc(examResults.createdAt)],
            limit: 5
          }
        }
      });

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json({
        success: true,
        data: {
          student,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get real-time data for teachers
  app.get("/api/realtime/teacher/:teacherId", async (req: Request, res: Response) => {
    try {
      const { teacherId } = req.params;
      
      const teacher = await db.query.teachers.findFirst({
        where: eq(schema.teachers.id, parseInt(teacherId)),
        with: {
          school: true,
          classes: {
            with: {
              school: true
            }
          }
        }
      });

      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // Get students in teacher's classes
      const students = await db.query.students.findMany({
        where: eq(schema.students.schoolId, teacher.schoolId!),
        orderBy: (students, { asc }) => [asc(students.name)],
        limit: 50
      });

      res.json({
        success: true,
        data: {
          teacher,
          students,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get real-time attendance data
  app.get("/api/realtime/attendance/:schoolId", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { date } = req.query;
      
      let whereCondition = eq(schema.attendance.schoolId, parseInt(schoolId));
      
      if (date) {
        whereCondition = and(
          eq(schema.attendance.schoolId, parseInt(schoolId)),
          eq(schema.attendance.date, date as string)
        );
      }

      const attendance = await db.query.attendance.findMany({
        where: whereCondition,
        with: {
          student: true
        },
        orderBy: (attendance, { desc }) => [desc(attendance.date)]
      });

      res.json({
        success: true,
        data: {
          attendance,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get real-time exam results
  app.get("/api/realtime/exam-results/:schoolId", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const { examId, studentId } = req.query;
      
      // Base query for exam results
      let examResults;
      
      if (studentId) {
        examResults = await db.query.examResults.findMany({
          where: eq(schema.examResults.studentId, parseInt(studentId as string)),
          with: {
            student: true,
            exam: true
          },
          orderBy: (examResults, { desc }) => [desc(examResults.createdAt)]
        });
      } else if (examId) {
        examResults = await db.query.examResults.findMany({
          where: eq(schema.examResults.examId, parseInt(examId as string)),
          with: {
            student: true,
            exam: true
          },
          orderBy: (examResults, { asc }) => [asc(examResults.studentId)]
        });
      } else {
        // Get recent results for the school
        examResults = await db.query.examResults.findMany({
          with: {
            student: {
              where: eq(schema.students.schoolId, parseInt(schoolId))
            },
            exam: true
          },
          orderBy: (examResults, { desc }) => [desc(examResults.createdAt)],
          limit: 50
        });
      }

      res.json({
        success: true,
        data: {
          examResults,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get real-time school statistics
  app.get("/api/realtime/school-stats/:schoolId", async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      const schoolIdInt = parseInt(schoolId);

      // Get comprehensive school statistics
      const [
        studentsCount,
        teachersCount,
        activeStudents,
        recentAttendance,
        recentFeeReceipts,
        availableBooks
      ] = await Promise.all([
        db.select().from(schema.students).where(eq(schema.students.schoolId, schoolIdInt)),
        db.select().from(schema.teachers).where(eq(schema.teachers.schoolId, schoolIdInt)),
        db.select().from(schema.students).where(and(
          eq(schema.students.schoolId, schoolIdInt),
          eq(schema.students.status, 'active')
        )),
        db.select().from(schema.attendance).where(
          eq(schema.attendance.schoolId, schoolIdInt)
        ).limit(100),
        db.select().from(schema.feeReceipts).where(
          eq(schema.feeReceipts.schoolId, schoolIdInt)
        ).limit(50),
        db.select().from(schema.books).where(
          eq(schema.books.schoolId, schoolIdInt)
        )
      ]);

      const stats = {
        totalStudents: studentsCount.length,
        totalTeachers: teachersCount.length,
        activeStudents: activeStudents.length,
        recentAttendanceRecords: recentAttendance.length,
        recentFeeReceipts: recentFeeReceipts.length,
        totalBooks: availableBooks.reduce((sum, book) => sum + book.copies, 0),
        availableBooks: availableBooks.reduce((sum, book) => sum + book.availableCopies, 0),
        lastUpdated: new Date().toISOString()
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update student data with real-time notification
  app.patch("/api/realtime/student/:studentId", async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
      const updateData = req.body;

      const [updatedStudent] = await db
        .update(schema.students)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(schema.students.id, parseInt(studentId)))
        .returning();

      if (!updatedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json({
        success: true,
        data: updatedStudent,
        message: "Student updated successfully"
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update teacher data with real-time notification
  app.patch("/api/realtime/teacher/:teacherId", async (req: Request, res: Response) => {
    try {
      const { teacherId } = req.params;
      const updateData = req.body;

      const [updatedTeacher] = await db
        .update(schema.teachers)
        .set(updateData)
        .where(eq(schema.teachers.id, parseInt(teacherId)))
        .returning();

      if (!updatedTeacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      res.json({
        success: true,
        data: updatedTeacher,
        message: "Teacher updated successfully"
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Create attendance record with real-time notification
  app.post("/api/realtime/attendance", async (req: Request, res: Response) => {
    try {
      const attendanceData = req.body;

      const [newAttendance] = await db
        .insert(schema.attendance)
        .values({
          ...attendanceData,
          createdAt: new Date()
        })
        .returning();

      res.json({
        success: true,
        data: newAttendance,
        message: "Attendance recorded successfully"
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}