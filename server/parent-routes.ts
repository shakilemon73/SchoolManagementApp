import { Express, Request, Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import * as schema from "../shared/schema";

export function registerParentRoutes(app: Express) {
  // Get parent's children
  app.get("/api/parent/children", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const children = await db
        .select({
          id: schema.students.id,
          name: schema.students.name,
          class: schema.students.class,
          section: schema.students.section,
          rollNumber: schema.students.rollNumber,
          photo: schema.students.photo,
        })
        .from(schema.students)
        .innerJoin(
          schema.parentStudents,
          eq(schema.parentStudents.studentId, schema.students.id)
        )
        .where(eq(schema.parentStudents.parentId, req.user.id));

      res.json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  // Get parent's notifications
  app.get("/api/parent/notifications", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const notifications = await db
        .select()
        .from(schema.parentNotifications)
        .where(eq(schema.parentNotifications.parentId, req.user.id))
        .orderBy(desc(schema.parentNotifications.createdAt))
        .limit(20);

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get student progress
  app.get("/api/parent/progress/:studentId", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const studentId = parseInt(req.params.studentId);

      // Verify parent owns this student
      const parentStudent = await db
        .select()
        .from(schema.parentStudents)
        .where(
          and(
            eq(schema.parentStudents.parentId, req.user.id),
            eq(schema.parentStudents.studentId, studentId)
          )
        )
        .limit(1);

      if (parentStudent.length === 0) {
        return res.status(403).json({ message: "Access denied to this student's data" });
      }

      const progress = await db
        .select()
        .from(schema.studentProgress)
        .where(eq(schema.studentProgress.studentId, studentId))
        .orderBy(desc(schema.studentProgress.createdAt));

      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Send message to teacher
  app.post("/api/parent/messages", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { receiverId, studentId, subject, content, messageType } = req.body;

      const message = await db
        .insert(schema.messages)
        .values({
          senderId: req.user.id,
          receiverId,
          studentId,
          subject,
          content,
          messageType: messageType || 'general',
        })
        .returning();

      res.json(message[0]);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get messages for parent
  app.get("/api/parent/messages", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const messages = await db
        .select({
          id: schema.messages.id,
          subject: schema.messages.subject,
          content: schema.messages.content,
          isRead: schema.messages.isRead,
          messageType: schema.messages.messageType,
          createdAt: schema.messages.createdAt,
          senderName: schema.users.full_name,
          senderId: schema.messages.senderId,
          studentName: schema.students.name,
        })
        .from(schema.messages)
        .leftJoin(schema.users, eq(schema.messages.senderId, schema.users.id))
        .leftJoin(schema.students, eq(schema.messages.studentId, schema.students.id))
        .where(eq(schema.messages.receiverId, req.user.id))
        .orderBy(desc(schema.messages.createdAt));

      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Mark notification as read
  app.patch("/api/parent/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const notificationId = parseInt(req.params.id);

      await db
        .update(schema.parentNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(schema.parentNotifications.id, notificationId),
            eq(schema.parentNotifications.parentId, req.user.id)
          )
        );

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Get student attendance details
  app.get("/api/parent/attendance/:studentId", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const studentId = parseInt(req.params.studentId);

      // Verify parent owns this student
      const parentStudent = await db
        .select()
        .from(schema.parentStudents)
        .where(
          and(
            eq(schema.parentStudents.parentId, req.user.id),
            eq(schema.parentStudents.studentId, studentId)
          )
        )
        .limit(1);

      if (parentStudent.length === 0) {
        return res.status(403).json({ message: "Access denied to this student's data" });
      }

      const attendance = await db
        .select()
        .from(schema.attendance)
        .where(eq(schema.attendance.studentId, studentId))
        .orderBy(desc(schema.attendance.date));

      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Get fee receipts for student
  app.get("/api/parent/fees/:studentId", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }

      const studentId = parseInt(req.params.studentId);

      // Verify parent owns this student
      const parentStudent = await db
        .select()
        .from(schema.parentStudents)
        .where(
          and(
            eq(schema.parentStudents.parentId, req.user.id),
            eq(schema.parentStudents.studentId, studentId)
          )
        )
        .limit(1);

      if (parentStudent.length === 0) {
        return res.status(403).json({ message: "Access denied to this student's data" });
      }

      const feeReceipts = await db
        .select()
        .from(schema.feeReceipts)
        .where(eq(schema.feeReceipts.studentId, studentId))
        .orderBy(desc(schema.feeReceipts.paymentDate));

      res.json(feeReceipts);
    } catch (error) {
      console.error("Error fetching fee receipts:", error);
      res.status(500).json({ message: "Failed to fetch fee receipts" });
    }
  });
}