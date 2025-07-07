import { Express, Request, Response } from 'express';
import { db, safeDbQuery } from '../db';
import { 
  admitCards, 
  admitCardTemplates, 
  admitCardHistory,
  students,
  schools
} from '../shared/schema';
import { eq, desc, count, sql, and, gte } from 'drizzle-orm';

export function registerAdmitCardRoutes(app: Express) {
  
  // Get dashboard statistics
  app.get("/api/admit-cards/stats", async (req: Request, res: Response) => {
    try {
      // Get total generated admit cards using safe query
      const totalGenerated = await safeDbQuery(
        async () => {
          const result = await db
            .select({ count: count() })
            .from(admitCards);
          return result[0]?.count || 0;
        },
        0,
        'fetch total admit cards count'
      );
      
      // Get this month's count
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      
      const thisMonth = await safeDbQuery(
        async () => {
          const result = await db
            .select({ count: count() })
            .from(admitCards)
            .where(gte(admitCards.createdAt, thisMonthStart));
          return result[0]?.count || 0;
        },
        0,
        'fetch this month admit cards count'
      );
      
      // Get this week's count
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);
      
      const thisWeek = await safeDbQuery(
        async () => {
          const result = await db
            .select({ count: count() })
            .from(admitCards)
            .where(gte(admitCards.createdAt, thisWeekStart));
          return result[0]?.count || 0;
        },
        0,
        'fetch this week admit cards count'
      );
      
      res.json({
        totalGenerated,
        thisMonth,
        thisWeek
      });
    } catch (error) {
      console.error("Error fetching admit card stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get recent admit card history
  app.get("/api/admit-cards/recent", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const recentHistory = await db
        .select({
          id: admitCards.id,
          studentName: admitCards.studentName,
          studentNameBn: admitCards.studentNameBn,
          templateName: admitCardTemplates.name,
          createdAt: admitCards.createdAt,
          examType: admitCards.examType,
          status: admitCards.status
        })
        .from(admitCards)
        .leftJoin(admitCardTemplates, eq(admitCards.templateId, admitCardTemplates.id))
        .orderBy(desc(admitCards.createdAt))
        .limit(limit);
      
      res.json(recentHistory);
    } catch (error) {
      console.error("Error fetching recent history:", error);
      res.status(500).json({ message: "Failed to fetch recent history" });
    }
  });

  // Get available templates
  app.get("/api/admit-cards/templates", async (req: Request, res: Response) => {
    try {
      const templates = await db
        .select()
        .from(admitCardTemplates)
        .where(eq(admitCardTemplates.isActive, true))
        .orderBy(admitCardTemplates.name);
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get specific template
  app.get("/api/admit-cards/templates/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const template = await db
        .select()
        .from(admitCardTemplates)
        .where(eq(admitCardTemplates.id, parseInt(id)))
        .limit(1);
      
      if (template.length === 0) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template[0]);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Create new HSC template
  app.post("/api/admit-cards/templates", async (req: Request, res: Response) => {
    try {
      const {
        name,
        nameBn,
        description,
        category,
        boardType,
        examLevel,
        templateData,
        fieldMappings,
        styleConfig,
        subjectGroups,
        pageSize,
        orientation,
        margins,
        headerConfig,
        footerConfig,
        previewUrl
      } = req.body;
      
      const newTemplate = await db
        .insert(admitCardTemplates)
        .values({
          name,
          nameBn,
          description,
          category: category || 'custom',
          boardType,
          examLevel,
          templateData: templateData ? JSON.stringify(templateData) : null,
          fieldMappings: fieldMappings ? JSON.stringify(fieldMappings) : null,
          styleConfig: styleConfig ? JSON.stringify(styleConfig) : null,
          subjectGroups: subjectGroups ? JSON.stringify(subjectGroups) : null,
          pageSize: pageSize || 'A4',
          orientation: orientation || 'portrait',
          margins: margins ? JSON.stringify(margins) : null,
          headerConfig: headerConfig ? JSON.stringify(headerConfig) : null,
          footerConfig: footerConfig ? JSON.stringify(footerConfig) : null,
          previewUrl,
          usageCount: 0,
          isActive: true,
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      res.status(201).json(newTemplate[0]);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Generate single admit card with enhanced features
  app.post("/api/admit-cards/generate-single", async (req: Request, res: Response) => {
    try {
      const {
        studentName,
        studentNameBn,
        rollNumber,
        registrationNumber,
        className,
        section,
        examType,
        examName,
        examNameBn,
        examDate,
        examTime,
        examCenter,
        examCenterBn,
        subjects,
        studentPhoto,
        templateId,
        institutionData
      } = req.body;
      
      // Validate required fields
      if (!studentName || !rollNumber || !templateId || !examType || !examName || !examCenter) {
        return res.status(400).json({ 
          message: "Student name, roll number, exam type, exam name, exam center, and template are required" 
        });
      }
      
      // Get template data
      const template = await db
        .select()
        .from(admitCardTemplates)
        .where(eq(admitCardTemplates.id, parseInt(templateId)))
        .limit(1);
      
      if (template.length === 0) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Generate unique card number and verification code
      const cardNumber = `AC-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
      const verificationCode = nanoid(12);
      
      // Generate QR Code with verification data
      const qrData = {
        cardNumber,
        studentName,
        rollNumber,
        examType,
        examDate,
        verificationCode,
        timestamp: new Date().toISOString()
      };
      const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrData));
      
      // Create admit card record
      const newAdmitCard = await db
        .insert(admitCards)
        .values({
          studentName,
          studentNameBn,
          rollNumber,
          registrationNumber,
          className,
          section,
          examType,
          examName,
          examNameBn,
          examDate: examDate ? new Date(examDate) : null,
          examTime,
          examCenter,
          examCenterBn,
          subjects: subjects ? JSON.stringify(subjects) : null,
          studentPhoto,
          institutionData: institutionData ? JSON.stringify(institutionData) : null,
          templateId: parseInt(templateId),
          cardNumber,
          qrCode: qrCodeString,
          verificationCode,
          validUntil: examDate ? new Date(new Date(examDate).getTime() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days validity
          status: 'active',
          printCount: 0,
          schoolId: req.user?.schoolId || 1,
          createdBy: req.user?.id || null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Log the action
      await db
        .insert(admitCardHistory)
        .values({
          admitCardId: newAdmitCard[0].id,
          action: 'generated',
          reason: 'Single admit card generation',
          details: JSON.stringify({ examType, examName }),
          performedBy: req.user?.id || null,
          performedAt: new Date()
        });
      
      res.status(201).json({
        admitCard: newAdmitCard[0],
        template: template[0],
        qrCode: qrCodeString
      });
    } catch (error) {
      console.error("Error generating admit card:", error);
      res.status(500).json({ message: "Failed to generate admit card" });
    }
  });

  // Generate batch admit cards
  app.post("/api/admit-cards/generate-batch", async (req: Request, res: Response) => {
    try {
      const {
        students: studentList,
        templateId,
        examType,
        examDate,
        schoolData
      } = req.body;
      
      if (!studentList || !Array.isArray(studentList) || studentList.length === 0) {
        return res.status(400).json({ message: "Student list is required" });
      }
      
      if (!templateId) {
        return res.status(400).json({ message: "Template is required" });
      }
      
      // Get template data
      const template = await db
        .select()
        .from(admitCardTemplates)
        .where(eq(admitCardTemplates.id, parseInt(templateId)))
        .limit(1);
      
      if (template.length === 0) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const createdAdmitCards = [];
      const errors = [];
      
      // Process each student
      for (const student of studentList) {
        try {
          const admitCard = await db
            .insert(admitCards)
            .values({
              studentName: student.studentName,
              studentNameBn: student.studentNameBn,
              studentId: student.studentId,
              rollNumber: student.rollNumber,
              registrationNumber: student.registrationNumber,
              className: student.className,
              section: student.section,
              examType,
              examDate: examDate ? new Date(examDate) : null,
              subjects: JSON.stringify(student.subjects || []),
              schoolData: JSON.stringify(schoolData || {}),
              templateId: parseInt(templateId),
              photoUrl: student.photoUrl,
              status: 'generated',
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          
          createdAdmitCards.push(admitCard[0]);
          
          // Log the action
          await db
            .insert(admitCardHistory)
            .values({
              admitCardId: admitCard[0].id,
              action: 'generated',
              performedBy: req.user?.id || null,
              createdAt: new Date()
            });
        } catch (error) {
          errors.push({
            student: student.studentName || student.rollNumber,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      res.status(201).json({
        admitCards: createdAdmitCards,
        template: template[0],
        errors,
        summary: {
          total: studentList.length,
          successful: createdAdmitCards.length,
          failed: errors.length
        }
      });
    } catch (error) {
      console.error("Error generating batch admit cards:", error);
      res.status(500).json({ message: "Failed to generate batch admit cards" });
    }
  });

  // Update admit card status
  app.patch("/api/admit-cards/:id/status", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['generated', 'downloaded', 'printed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedAdmitCard = await db
        .update(admitCards)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(admitCards.id, parseInt(id)))
        .returning();
      
      if (updatedAdmitCard.length === 0) {
        return res.status(404).json({ message: "Admit card not found" });
      }
      
      // Log the action
      await db
        .insert(admitCardHistory)
        .values({
          admitCardId: parseInt(id),
          action: status,
          performedBy: req.user?.id || null,
          createdAt: new Date()
        });
      
      res.json(updatedAdmitCard[0]);
    } catch (error) {
      console.error("Error updating admit card status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Get admit card history
  app.get("/api/admit-cards/history", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const history = await db
        .select({
          id: admitCards.id,
          studentName: admitCards.studentName,
          studentNameBn: admitCards.studentNameBn,
          rollNumber: admitCards.rollNumber,
          className: admitCards.className,
          section: admitCards.section,
          examType: admitCards.examType,
          templateName: admitCardTemplates.name,
          status: admitCards.status,
          createdAt: admitCards.createdAt
        })
        .from(admitCards)
        .leftJoin(admitCardTemplates, eq(admitCards.templateId, admitCardTemplates.id))
        .orderBy(desc(admitCards.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(admitCards);
      
      const total = totalResult[0]?.count || 0;
      
      res.json({
        data: history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching admit card history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // Delete admit card
  app.delete("/api/admit-cards/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if admit card exists
      const existingCard = await db
        .select()
        .from(admitCards)
        .where(eq(admitCards.id, parseInt(id)))
        .limit(1);
      
      if (existingCard.length === 0) {
        return res.status(404).json({ message: "Admit card not found" });
      }
      
      // Delete admit card
      await db
        .delete(admitCards)
        .where(eq(admitCards.id, parseInt(id)));
      
      // Log the action
      await db
        .insert(admitCardHistory)
        .values({
          admitCardId: parseInt(id),
          action: 'deleted',
          performedBy: req.user?.id || null,
          createdAt: new Date()
        });
      
      res.json({ message: "Admit card deleted successfully" });
    } catch (error) {
      console.error("Error deleting admit card:", error);
      res.status(500).json({ message: "Failed to delete admit card" });
    }
  });
}