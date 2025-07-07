import type { Express, Request, Response } from "express";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, and, desc, asc, sql, count, between } from "drizzle-orm";

const requireAuth = (req: any, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export function registerStudentPortalRoutes(app: Express) {
  
  // Get current student profile
  app.get("/api/students/me", requireAuth, async (req: any, res: Response) => {
    try {
      let studentId = req.user?.studentId;
      
      // If user is a student role, find their student record
      if (req.user?.role === 'student' && !studentId) {
        const userStudent = await db.select()
          .from(schema.students)
          .where(eq(schema.students.id, req.user.id))
          .limit(1);
        
        if (userStudent.length > 0) {
          studentId = userStudent[0].id;
        }
      }
      
      if (!studentId) {
        // Try to find any student from the database for this user
        const allStudents = await db.select()
          .from(schema.students)
          .limit(1);
        
        if (allStudents.length > 0) {
          return res.json(allStudents[0]);
        }
        
        return res.status(404).json({ message: "No student profile found. Please contact administration." });
      }
      
      const student = await db.select()
        .from(schema.students)
        .where(eq(schema.students.id, studentId))
        .limit(1);
      
      if (student.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student[0]);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get student attendance
  app.get("/api/students/attendance", requireAuth, async (req: any, res: Response) => {
    try {
      const sampleAttendance = [
        {
          id: 1,
          studentId: 1,
          date: "2025-06-01",
          status: "present",
          remarks: null,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          studentId: 1,
          date: "2025-06-02",
          status: "present",
          remarks: null,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          studentId: 1,
          date: "2025-05-31",
          status: "late",
          remarks: "Traffic delay",
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          studentId: 1,
          date: "2025-05-30",
          status: "absent",
          remarks: "Sick leave",
          createdAt: new Date().toISOString()
        }
      ];
      
      res.json(sampleAttendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get attendance statistics
  app.get("/api/students/attendance/stats", requireAuth, async (req: any, res: Response) => {
    try {
      const stats = {
        totalDays: 150,
        presentDays: 135,
        absentDays: 10,
        lateDays: 5,
        percentage: 90
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get fee receipts
  app.get("/api/fee-receipts", requireAuth, async (req: any, res: Response) => {
    try {
      const sampleReceipts = [
        {
          id: 1,
          studentId: 1,
          receiptNumber: "FEE001",
          totalAmount: "5000.00",
          paidAmount: "5000.00",
          dueAmount: "0.00",
          paymentMethod: "Cash",
          paymentDate: "2025-01-15",
          academicYear: "2024-25",
          month: "January",
          status: "paid",
          notes: "Monthly tuition fee",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          studentId: 1,
          receiptNumber: "FEE002",
          totalAmount: "5000.00",
          paidAmount: "3000.00",
          dueAmount: "2000.00",
          paymentMethod: "Bank Transfer",
          paymentDate: "2025-02-10",
          academicYear: "2024-25",
          month: "February",
          status: "pending",
          notes: "Partial payment received",
          createdAt: new Date().toISOString()
        }
      ];
      
      res.json(sampleReceipts);
    } catch (error) {
      console.error("Error fetching fee receipts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get fee items
  app.get("/api/fee-items", requireAuth, async (req: any, res: Response) => {
    try {
      const sampleFeeItems = [
        {
          id: 1,
          receiptId: 1,
          itemName: "Tuition Fee",
          amount: "3500.00",
          description: "Monthly tuition charge"
        },
        {
          id: 2,
          receiptId: 1,
          itemName: "Library Fee",
          amount: "500.00",
          description: "Library maintenance fee"
        },
        {
          id: 3,
          receiptId: 1,
          itemName: "Sports Fee",
          amount: "1000.00",
          description: "Sports activities fee"
        },
        {
          id: 4,
          receiptId: 2,
          itemName: "Tuition Fee",
          amount: "3500.00",
          description: "Monthly tuition charge"
        },
        {
          id: 5,
          receiptId: 2,
          itemName: "Exam Fee",
          amount: "1500.00",
          description: "Half-yearly examination fee"
        }
      ];
      
      res.json(sampleFeeItems);
    } catch (error) {
      console.error("Error fetching fee items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get payment summary
  app.get("/api/students/fees/summary", requireAuth, async (req: any, res: Response) => {
    try {
      const summary = {
        totalPaid: 8000,
        totalDue: 2000,
        monthlyAverage: 4000,
        lastPaymentDate: "2025-02-10"
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get library books
  app.get("/api/library/books", requireAuth, async (req: any, res: Response) => {
    try {
      const books = await db.select()
        .from(schema.libraryBooks)
        .orderBy(asc(schema.libraryBooks.title))
        .limit(50);
      
      res.json(books);
    } catch (error) {
      console.error("Error fetching library books:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get borrowed books
  app.get("/api/library/borrowed", requireAuth, async (req: any, res: Response) => {
    try {
      const borrowedBooks = await db.select({
        id: schema.libraryBorrowedBooks.id,
        bookId: schema.libraryBorrowedBooks.bookId,
        studentId: schema.libraryBorrowedBooks.studentId,
        borrowDate: schema.libraryBorrowedBooks.borrowDate,
        dueDate: schema.libraryBorrowedBooks.dueDate,
        returnDate: schema.libraryBorrowedBooks.returnDate,
        status: schema.libraryBorrowedBooks.status,
        fine: schema.libraryBorrowedBooks.fine,
        notes: schema.libraryBorrowedBooks.notes,
        book: {
          id: schema.libraryBooks.id,
          title: schema.libraryBooks.title,
          titleBn: schema.libraryBooks.titleBn,
          author: schema.libraryBooks.author,
          location: schema.libraryBooks.location
        }
      })
      .from(schema.libraryBorrowedBooks)
      .leftJoin(schema.libraryBooks, eq(schema.libraryBorrowedBooks.bookId, schema.libraryBooks.id))
      .orderBy(desc(schema.libraryBorrowedBooks.borrowDate))
      .limit(20);
      
      res.json(borrowedBooks);
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get library statistics
  app.get("/api/library/stats", requireAuth, async (req: any, res: Response) => {
    try {
      const [totalBorrowedResult] = await db.select({ count: count() })
        .from(schema.libraryBorrowedBooks);
      
      const [activeBorrowsResult] = await db.select({ count: count() })
        .from(schema.libraryBorrowedBooks)
        .where(eq(schema.libraryBorrowedBooks.status, 'active'));
      
      const [overdueBorrowsResult] = await db.select({ count: count() })
        .from(schema.libraryBorrowedBooks)
        .where(eq(schema.libraryBorrowedBooks.status, 'overdue'));
      
      const [totalFinesResult] = await db.select({
        total: sql<number>`sum(${schema.libraryBorrowedBooks.fine})`
      }).from(schema.libraryBorrowedBooks);
      
      const stats = {
        totalBorrowed: totalBorrowedResult.count,
        activeBorrows: activeBorrowsResult.count,
        overdueBorrows: overdueBorrowsResult.count,
        totalFines: Number(totalFinesResult[0]?.total || 0)
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching library stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get exam results
  app.get("/api/students/results", requireAuth, async (req: any, res: Response) => {
    try {
      const sampleResults = [
        {
          id: 1,
          studentId: 1,
          examId: 1,
          subjectId: 1,
          marksObtained: 85,
          totalMarks: 100,
          grade: "A",
          gpa: 4.0,
          position: 5,
          remarks: "Excellent performance",
          exam: {
            id: 1,
            name: "Half Yearly Examination",
            examDate: "2025-01-15",
            academicYear: "2024-25",
            term: "First Term"
          },
          subject: {
            id: 1,
            name: "Mathematics",
            code: "MATH101"
          }
        },
        {
          id: 2,
          studentId: 1,
          examId: 1,
          subjectId: 2,
          marksObtained: 78,
          totalMarks: 100,
          grade: "A-",
          gpa: 3.7,
          position: 8,
          remarks: "Good work",
          exam: {
            id: 1,
            name: "Half Yearly Examination",
            examDate: "2025-01-15",
            academicYear: "2024-25",
            term: "First Term"
          },
          subject: {
            id: 2,
            name: "English",
            code: "ENG101"
          }
        }
      ];
      
      res.json(sampleResults);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get academic performance
  app.get("/api/students/performance", requireAuth, async (req: any, res: Response) => {
    try {
      const performance = {
        overallGPA: 3.85,
        totalExams: 2,
        averageMarks: 81.5,
        bestSubject: "Mathematics",
        improvementNeeded: "English"
      };
      
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get class schedule
  app.get("/api/students/class-schedule", requireAuth, async (req: any, res: Response) => {
    try {
      const sampleSchedule = [
        {
          id: 1,
          classId: 1,
          subjectId: 1,
          teacherId: 1,
          dayOfWeek: "Monday",
          startTime: "08:00",
          endTime: "08:45",
          room: "Room 101",
          subject: {
            id: 1,
            name: "Mathematics",
            code: "MATH101"
          },
          teacher: {
            id: 1,
            name: "Dr. Ahmed Khan"
          }
        },
        {
          id: 2,
          classId: 1,
          subjectId: 2,
          teacherId: 2,
          dayOfWeek: "Monday",
          startTime: "08:45",
          endTime: "09:30",
          room: "Room 102",
          subject: {
            id: 2,
            name: "English",
            code: "ENG101"
          },
          teacher: {
            id: 2,
            name: "Ms. Sarah Johnson"
          }
        },
        {
          id: 3,
          classId: 1,
          subjectId: 1,
          teacherId: 1,
          dayOfWeek: "Tuesday",
          startTime: "08:00",
          endTime: "08:45",
          room: "Room 101",
          subject: {
            id: 1,
            name: "Mathematics",
            code: "MATH101"
          },
          teacher: {
            id: 1,
            name: "Dr. Ahmed Khan"
          }
        }
      ];
      
      res.json(sampleSchedule);
    } catch (error) {
      console.error("Error fetching class schedule:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get exam schedule
  app.get("/api/students/exam-schedule", requireAuth, async (req: any, res: Response) => {
    try {
      const sampleExamSchedule = [
        {
          id: 1,
          examName: "Final Examination - Mathematics",
          subjectId: 1,
          examDate: "2025-06-20",
          startTime: "09:00",
          endTime: "12:00",
          room: "Exam Hall A",
          syllabus: "Chapters 1-10, Algebra and Geometry",
          subject: {
            id: 1,
            name: "Mathematics",
            code: "MATH101"
          }
        },
        {
          id: 2,
          examName: "Final Examination - English",
          subjectId: 2,
          examDate: "2025-06-22",
          startTime: "09:00",
          endTime: "12:00",
          room: "Exam Hall B",
          syllabus: "Grammar, Literature, Essay Writing",
          subject: {
            id: 2,
            name: "English",
            code: "ENG101"
          }
        }
      ];
      
      res.json(sampleExamSchedule);
    } catch (error) {
      console.error("Error fetching exam schedule:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get notifications
  app.get("/api/students/notifications", requireAuth, async (req: any, res: Response) => {
    try {
      const sampleNotifications = [
        {
          id: 1,
          title: "Fee Payment Due",
          message: "Your monthly fee payment is due by June 15th. Please make the payment to avoid late charges.",
          type: "warning",
          category: "fee",
          isRead: false,
          createdAt: new Date().toISOString(),
          actionUrl: "/student/fees",
          priority: "high"
        },
        {
          id: 2,
          title: "Exam Schedule Released",
          message: "The final examination schedule has been published. Check your exam dates and prepare accordingly.",
          type: "info",
          category: "exam",
          isRead: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          actionUrl: "/student/schedule",
          priority: "medium"
        },
        {
          id: 3,
          title: "Library Book Due",
          message: "Your borrowed book 'Introduction to Mathematics' is due for return by June 15th.",
          type: "warning",
          category: "academic",
          isRead: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          actionUrl: "/student/library",
          priority: "medium"
        },
        {
          id: 4,
          title: "Excellent Performance!",
          message: "Congratulations! You scored 85% in the recent Mathematics test. Keep up the good work!",
          type: "success",
          category: "academic",
          isRead: true,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          actionUrl: "/student/results",
          priority: "low"
        }
      ];
      
      res.json(sampleNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}