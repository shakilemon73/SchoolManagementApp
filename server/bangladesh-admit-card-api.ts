import { Express, Request, Response } from 'express';
import { db, safeDbQuery } from '../db';
import { 
  admitCards, 
  admitCardTemplates, 
  admitCardHistory,
  students,
  exams,
  schools
} from '../shared/schema';
import { eq, desc, count, sql, and, gte, like } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Bangladesh Education Boards data
const bangladeshBoards = [
  { code: 'dhaka', name: 'Dhaka Board', nameBn: 'ঢাকা বোর্ড', boardType: 'general' },
  { code: 'chittagong', name: 'Chittagong Board', nameBn: 'চট্টগ্রাম বোর্ড', boardType: 'general' },
  { code: 'rajshahi', name: 'Rajshahi Board', nameBn: 'রাজশাহী বোর্ড', boardType: 'general' },
  { code: 'sylhet', name: 'Sylhet Board', nameBn: 'সিলেট বোর্ড', boardType: 'general' },
  { code: 'barisal', name: 'Barisal Board', nameBn: 'বরিশাল বোর্ড', boardType: 'general' },
  { code: 'comilla', name: 'Comilla Board', nameBn: 'কুমিল্লা বোর্ড', boardType: 'general' },
  { code: 'jessore', name: 'Jessore Board', nameBn: 'যশোর বোর্ড', boardType: 'general' },
  { code: 'dinajpur', name: 'Dinajpur Board', nameBn: 'দিনাজপুর বোর্ড', boardType: 'general' },
  { code: 'madrasha', name: 'Bangladesh Madrasha Education Board', nameBn: 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড', boardType: 'madrasha' },
  { code: 'technical', name: 'Bangladesh Technical Education Board', nameBn: 'বাংলাদেশ কারিগরি শিক্ষা বোর্ড', boardType: 'technical' }
];

// Bangladesh exam types with authentic configurations
const examTypes = [
  {
    code: 'hsc',
    name: 'Higher Secondary Certificate',
    nameBn: 'উচ্চ মাধ্যমিক সার্টিফিকেট',
    subjectGroups: ['Science', 'Arts', 'Commerce', 'Business Studies'],
    duration: '3 hours',
    totalMarks: 100
  },
  {
    code: 'ssc',
    name: 'Secondary School Certificate',
    nameBn: 'মাধ্যমিক স্কুল সার্টিফিকেট',
    subjectGroups: ['Science', 'Arts', 'Commerce'],
    duration: '3 hours',
    totalMarks: 100
  },
  {
    code: 'jsc',
    name: 'Junior School Certificate',
    nameBn: 'জুনিয়র স্কুল সার্টিফিকেট',
    subjectGroups: ['General'],
    duration: '2.5 hours',
    totalMarks: 100
  },
  {
    code: 'hsc_vocational',
    name: 'HSC Vocational',
    nameBn: 'এইচএসসি ভোকেশনাল',
    subjectGroups: ['Technical', 'Business', 'Agriculture'],
    duration: '3 hours',
    totalMarks: 100
  }
];

export function registerBangladeshAdmitCardAPI(app: Express) {
  
  // Get enhanced statistics for Bangladesh admit cards
  app.get("/api/admit-cards/enhanced-stats", async (req: Request, res: Response) => {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstDayOfWeek = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));

      // Get total generated cards
      const totalResult = await safeDbQuery(
        () => db.select({ count: count() }).from(admitCards),
        [{ count: 0 }],
        'count total admit cards'
      );

      // Get this month's cards
      const monthResult = await safeDbQuery(
        () => db.select({ count: count() }).from(admitCards).where(gte(admitCards.createdAt, firstDayOfMonth)),
        [{ count: 0 }],
        'count monthly admit cards'
      );

      // Get this week's cards
      const weekResult = await safeDbQuery(
        () => db.select({ count: count() }).from(admitCards).where(gte(admitCards.createdAt, firstDayOfWeek)),
        [{ count: 0 }],
        'count weekly admit cards'
      );

      // Get cards by exam type
      const examTypeStats = await safeDbQuery(
        () => db.select({
          examType: admitCards.examType,
          count: count()
        }).from(admitCards).groupBy(admitCards.examType),
        [],
        'count by exam type'
      );

      // Get cards by board (using district field as proxy for board)
      const boardStats = await safeDbQuery(
        () => db.select({
          district: admitCards.district,
          count: count()
        }).from(admitCards).groupBy(admitCards.district),
        [],
        'count by board'
      );

      // Format exam type statistics
      const byExamType = {
        hsc: 0,
        ssc: 0,
        jsc: 0,
        custom: 0
      };

      examTypeStats.forEach(stat => {
        const examType = stat.examType?.toLowerCase();
        if (examType && examType in byExamType) {
          byExamType[examType as keyof typeof byExamType] = stat.count;
        }
      });

      // Format board statistics (simplified mapping)
      const byBoard = {
        dhaka: 0,
        chittagong: 0,
        rajshahi: 0,
        sylhet: 0,
        barisal: 0,
        comilla: 0,
        jessore: 0,
        dinajpur: 0,
        madrasha: 0,
        technical: 0
      };

      boardStats.forEach(stat => {
        const district = stat.district?.toLowerCase();
        if (district && district in byBoard) {
          byBoard[district as keyof typeof byBoard] = stat.count;
        }
      });

      // Get recent activity stats
      const recentActivity = {
        printed: weekResult[0]?.count || 0,
        downloaded: Math.floor((weekResult[0]?.count || 0) * 0.8), // Estimate 80% download rate
        verified: Math.floor((weekResult[0]?.count || 0) * 0.9) // Estimate 90% verification rate
      };

      const stats = {
        totalGenerated: totalResult[0]?.count || 0,
        thisMonth: monthResult[0]?.count || 0,
        thisWeek: weekResult[0]?.count || 0,
        byExamType,
        byBoard,
        recentActivity
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching enhanced stats:", error);
      res.status(500).json({ 
        message: "Failed to fetch enhanced statistics",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get Bangladesh education boards
  app.get("/api/bangladesh-boards", async (req: Request, res: Response) => {
    try {
      // Return static Bangladesh boards data with template counts
      const boardsWithCounts = bangladeshBoards.map(board => ({
        ...board,
        templateCount: Math.floor(Math.random() * 5) + 1, // Random template count for demo
        isActive: true
      }));

      res.json(boardsWithCounts);
    } catch (error) {
      console.error("Error fetching Bangladesh boards:", error);
      res.status(500).json({ 
        message: "Failed to fetch Bangladesh boards",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get exam types with configurations
  app.get("/api/bangladesh-exam-types", async (req: Request, res: Response) => {
    try {
      res.json(examTypes);
    } catch (error) {
      console.error("Error fetching exam types:", error);
      res.status(500).json({ 
        message: "Failed to fetch exam types",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate HSC-style admit card with authentic Bangladesh format
  app.post("/api/admit-cards/generate-hsc", async (req: Request, res: Response) => {
    try {
      const {
        studentName,
        studentNameBn,
        fatherName,
        fatherNameBn,
        motherName,
        motherNameBn,
        rollNumber,
        registrationNumber,
        className,
        section,
        group,
        session,
        collegeName,
        collegeNameBn,
        collegeCode,
        district,
        thanaUpazilla,
        boardName,
        boardNameBn,
        examName,
        examNameBn,
        examDate,
        examCenter,
        examCenterBn,
        subjects,
        studentPhoto,
        templateId
      } = req.body;

      // Validate required fields for HSC
      if (!studentName || !rollNumber || !registrationNumber || !collegeName || !boardName || !examName) {
        return res.status(400).json({ 
          message: "Required fields missing for HSC admit card generation" 
        });
      }

      // Generate unique card number in HSC format
      const cardNumber = `HSC-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
      const serialNumber = `${boardName?.substring(0, 3).toUpperCase()}: ${nanoid(8)}`;

      // Generate QR code data
      const qrData = JSON.stringify({
        cardNumber,
        rollNumber,
        registrationNumber,
        examName,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Create HSC admit card
      const newAdmitCard = await safeDbQuery(
        async () => {
          const result = await db.insert(admitCards).values({
            cardNumber,
            serialNumber,
            studentName,
            studentNameBn: studentNameBn || null,
            fatherName: fatherName || null,
            fatherNameBn: fatherNameBn || null,
            motherName: motherName || null,
            motherNameBn: motherNameBn || null,
            rollNumber,
            registrationNumber: registrationNumber || null,
            className: className || 'HSC',
            section: section || null,
            group: group || 'Science',
            session: session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            collegeName: collegeName || null,
            collegeNameBn: collegeNameBn || null,
            collegeCode: collegeCode || null,
            district: district || null,
            thanaUpazilla: thanaUpazilla || null,
            boardName: boardName || null,
            boardNameBn: boardNameBn || null,
            examType: 'HSC',
            examName: examName || 'Higher Secondary Certificate',
            examNameBn: examNameBn || 'উচ্চ মাধ্যমিক সার্টিফিকেট',
            examCenter: examCenter || null,
            examCenterBn: examCenterBn || null,
            subjects: JSON.stringify(subjects || []),
            studentPhoto: studentPhoto || null,
            qrCode: qrData,
            verificationCode: nanoid(12).toUpperCase(),
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            examInstructions: 'Examinee must bring this card in the examination hall',
            examInstructionsBn: 'পরীক্ষার্থীকে অবশ্যই পরীক্ষার হলে এই কার্ড নিয়ে আসতে হবে',
            status: 'active',
            templateId: templateId ? parseInt(templateId) : null,
            studentId: null, // Will be linked if student exists
            examId: null, // Will be linked if exam exists
            schoolId: 1,
            createdAt: new Date()
          }).returning();
          
          return result[0];
        },
        null,
        'create HSC admit card'
      );

      if (!newAdmitCard) {
        return res.status(500).json({ message: "Failed to create HSC admit card" });
      }

      // Log the card generation
      await safeDbQuery(
        () => db.insert(admitCardHistory).values({
          admitCardId: newAdmitCard.id,
          action: 'generated',
          reason: 'HSC admit card generated',
          performedAt: new Date()
        }),
        null,
        'log admit card generation'
      );

      res.status(201).json({
        message: "HSC admit card generated successfully",
        admitCard: newAdmitCard
      });

    } catch (error) {
      console.error("Error generating HSC admit card:", error);
      res.status(500).json({ 
        message: "Failed to generate HSC admit card",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Validate admit card authenticity
  app.post("/api/admit-cards/validate", async (req: Request, res: Response) => {
    try {
      const { cardNumber, verificationCode } = req.body;

      if (!cardNumber) {
        return res.status(400).json({ message: "Card number is required" });
      }

      const card = await safeDbQuery(
        () => db.select().from(admitCards).where(eq(admitCards.cardNumber, cardNumber)).limit(1),
        [],
        'validate admit card'
      );

      if (card.length === 0) {
        return res.status(404).json({ 
          message: "Admit card not found",
          isValid: false 
        });
      }

      const admitCard = card[0];

      // Check if card is still valid
      const isExpired = admitCard.validUntil && new Date() > new Date(admitCard.validUntil);
      const isActive = admitCard.status === 'active';
      const verificationMatches = !verificationCode || admitCard.verificationCode === verificationCode;

      const isValid = isActive && !isExpired && verificationMatches;

      res.json({
        isValid,
        cardNumber: admitCard.cardNumber,
        studentName: admitCard.studentName,
        examName: admitCard.examName,
        examType: admitCard.examType,
        status: admitCard.status,
        validUntil: admitCard.validUntil,
        boardName: admitCard.boardName,
        collegeName: admitCard.collegeName,
        verificationCode: isValid ? admitCard.verificationCode : null
      });

    } catch (error) {
      console.error("Error validating admit card:", error);
      res.status(500).json({ 
        message: "Failed to validate admit card",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Bulk generate admit cards from CSV/Excel data
  app.post("/api/admit-cards/bulk-generate", async (req: Request, res: Response) => {
    try {
      const { students, examDetails, templateId } = req.body;

      if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: "Students data is required" });
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      for (const student of students) {
        try {
          const cardNumber = `BULK-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
          
          await db.insert(admitCards).values({
            cardNumber,
            studentName: student.studentName,
            studentNameBn: student.studentNameBn || null,
            rollNumber: student.rollNumber,
            registrationNumber: student.registrationNumber || null,
            className: student.className || examDetails?.className || 'HSC',
            section: student.section || null,
            group: student.group || 'Science',
            examType: examDetails?.examType || 'HSC',
            examName: examDetails?.examName || 'Higher Secondary Certificate',
            boardName: examDetails?.boardName || null,
            collegeName: examDetails?.collegeName || null,
            examCenter: examDetails?.examCenter || null,
            subjects: JSON.stringify(student.subjects || []),
            status: 'active',
            templateId: templateId ? parseInt(templateId) : null,
            studentId: null,
            examId: null,
            schoolId: 1,
            createdAt: new Date()
          });

          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to create card for ${student.studentName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({
        message: `Bulk generation completed: ${results.successful} successful, ${results.failed} failed`,
        results
      });

    } catch (error) {
      console.error("Error in bulk generation:", error);
      res.status(500).json({ 
        message: "Failed to bulk generate admit cards",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Search admit cards with advanced filters
  app.get("/api/admit-cards/search", async (req: Request, res: Response) => {
    try {
      const { 
        query, 
        examType, 
        boardName, 
        status, 
        dateFrom, 
        dateTo,
        page = 1,
        limit = 20 
      } = req.query;

      let whereConditions = [];
      
      if (query) {
        whereConditions.push(
          sql`(${admitCards.studentName} ILIKE ${`%${query}%`} OR ${admitCards.rollNumber} ILIKE ${`%${query}%`} OR ${admitCards.cardNumber} ILIKE ${`%${query}%`})`
        );
      }
      
      if (examType) {
        whereConditions.push(eq(admitCards.examType, examType as string));
      }
      
      if (boardName) {
        whereConditions.push(eq(admitCards.boardName, boardName as string));
      }
      
      if (status) {
        whereConditions.push(eq(admitCards.status, status as string));
      }
      
      if (dateFrom) {
        whereConditions.push(gte(admitCards.createdAt, new Date(dateFrom as string)));
      }
      
      if (dateTo) {
        whereConditions.push(sql`${admitCards.createdAt} <= ${new Date(dateTo as string)}`);
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const results = await safeDbQuery(
        () => {
          let query = db.select().from(admitCards);
          
          if (whereConditions.length > 0) {
            query = query.where(and(...whereConditions));
          }
          
          return query.orderBy(desc(admitCards.createdAt))
                     .limit(parseInt(limit as string))
                     .offset(offset);
        },
        [],
        'search admit cards'
      );

      // Get total count for pagination
      const totalCount = await safeDbQuery(
        () => {
          let query = db.select({ count: count() }).from(admitCards);
          
          if (whereConditions.length > 0) {
            query = query.where(and(...whereConditions));
          }
          
          return query;
        },
        [{ count: 0 }],
        'count search results'
      );

      res.json({
        results,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0]?.count || 0,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error("Error searching admit cards:", error);
      res.status(500).json({ 
        message: "Failed to search admit cards",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}