import { Express, Request, Response } from 'express';
import { db } from './db';
import { 
  students, 
  studentImportBatches
} from '../shared/schema';
import { eq, desc } from 'drizzle-orm';
import multer from 'multer';
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimes.includes(file.mimetype) || 
        file.originalname.match(/\.(csv|xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  },
});

// Function to parse CSV data
function parseCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];
    const parser = parse(buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    parser.on('readable', function() {
      let record;
      while (record = parser.read()) {
        records.push(record);
      }
    });
    
    parser.on('error', function(err) {
      reject(err);
    });
    
    parser.on('end', function() {
      resolve(records);
    });
  });
}

// Function to parse Excel data
function parseExcel(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

// Function to validate and transform student data
function validateStudentData(row: any, rowIndex: number): { 
  isValid: boolean; 
  data?: any; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Required fields validation
  if (!row.Name && !row.name) {
    errors.push(`Row ${rowIndex + 1}: Student name is required`);
  }
  
  if (!row['Roll Number'] && !row.rollNumber && !row.roll) {
    errors.push(`Row ${rowIndex + 1}: Roll number is required`);
  }
  
  if (!row.Class && !row.class) {
    errors.push(`Row ${rowIndex + 1}: Class is required`);
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Transform data to match schema
  const studentData = {
    name: row.Name || row.name || '',
    nameInBangla: row['Name in Bangla'] || row.nameInBangla || row.nameBn || null,
    studentId: `STU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    rollNumber: (row['Roll Number'] || row.rollNumber || row.roll || '').toString(),
    class: row.Class || row.class || '',
    section: row.Section || row.section || null,
    dateOfBirth: row['Date of Birth'] || row.dateOfBirth || row.dob || null,
    gender: row.Gender || row.gender || null,
    bloodGroup: row['Blood Group'] || row.bloodGroup || null,
    fatherName: row['Father Name'] || row.fatherName || null,
    fatherNameInBangla: row['Father Name in Bangla'] || row.fatherNameInBangla || null,
    motherName: row['Mother Name'] || row.motherName || null,
    motherNameInBangla: row['Mother Name in Bangla'] || row.motherNameInBangla || null,
    guardianName: row['Guardian Name'] || row.guardianName || null,
    guardianPhone: row['Guardian Phone'] || row.guardianPhone || row.phone || null,
    guardianRelation: row['Guardian Relation'] || row.guardianRelation || 'Parent',
    presentAddress: row['Present Address'] || row.presentAddress || row.address || null,
    permanentAddress: row['Permanent Address'] || row.permanentAddress || null,
    village: row.Village || row.village || null,
    postOffice: row['Post Office'] || row.postOffice || null,
    thana: row.Thana || row.thana || null,
    district: row.District || row.district || null,
    division: row.Division || row.division || null,
    phone: row['Student Phone'] || row.studentPhone || null,
    email: row.Email || row.email || null,
    emergencyContactName: row['Emergency Contact'] || row.emergencyContact || null,
    emergencyContactRelation: row['Emergency Relation'] || row.emergencyRelation || null,
    emergencyContactPhone: row['Emergency Phone'] || row.emergencyPhone || null,
    status: 'active'
  };
  
  return { isValid: true, data: studentData, errors: [] };
}

export function registerStudentImportRoutes(app: Express) {
  
  // Excel/CSV import endpoint
  app.post("/api/students/import-excel", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const file = req.file;
      let records: any[] = [];
      
      // Parse file based on type
      try {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          records = await parseCSV(file.buffer);
        } else {
          records = parseExcel(file.buffer);
        }
      } catch (parseError) {
        return res.status(400).json({ 
          message: 'Failed to parse file. Please check file format and try again.' 
        });
      }
      
      if (records.length === 0) {
        return res.status(400).json({ message: 'No data found in file' });
      }
      
      // Create import batch record
      const [importBatch] = await db
        .insert(studentImportBatches)
        .values({
          fileName: file.originalname,
          fileSize: file.size,
          totalRecords: records.length,
          status: 'processing',
          uploadedBy: null,
          schoolId: 1,
        })
        .returning();
      
      // Process records asynchronously
      processStudentImport(importBatch.id, records, req.user?.schoolId || 1);
      
      res.json({
        message: 'File uploaded successfully',
        batchId: importBatch.id,
        totalRecords: records.length,
        status: 'processing'
      });
      
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ message: 'Failed to process import' });
    }
  });
  
  // Get import history
  app.get("/api/students/import-history", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const history = await db
        .select({
          id: studentImportBatches.id,
          fileName: studentImportBatches.fileName,
          fileSize: studentImportBatches.fileSize,
          totalRecords: studentImportBatches.totalRecords,
          successfulImports: studentImportBatches.successfulImports,
          failedImports: studentImportBatches.failedImports,
          status: studentImportBatches.status,
          errorLog: studentImportBatches.errorLog,
          createdAt: studentImportBatches.createdAt,
          completedAt: studentImportBatches.completedAt,
        })
        .from(studentImportBatches)
        .where(eq(studentImportBatches.schoolId, 1))
        .orderBy(desc(studentImportBatches.createdAt))
        .limit(limit)
        .offset(offset);
      
      res.json(history);
    } catch (error: any) {
      console.error('Error fetching import history:', error);
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        // Table doesn't exist yet, return empty array
        res.json([]);
      } else {
        res.status(500).json({ message: 'Failed to fetch import history' });
      }
    }
  });
  
  // Get import batch status
  app.get("/api/students/import-status/:batchId", async (req: Request, res: Response) => {
    try {
      const batchId = parseInt(req.params.batchId);
      
      const batch = await db
        .select()
        .from(studentImportBatches)
        .where(eq(studentImportBatches.id, batchId))
        .limit(1);
      
      if (batch.length === 0) {
        return res.status(404).json({ message: 'Import batch not found' });
      }
      
      res.json(batch[0]);
    } catch (error) {
      console.error('Error fetching batch status:', error);
      res.status(500).json({ message: 'Failed to fetch batch status' });
    }
  });
}

// Async function to process student import
async function processStudentImport(batchId: number, records: any[], schoolId: number) {
  const errors: string[] = [];
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < records.length; i++) {
    try {
      const validation = validateStudentData(records[i], i);
      
      if (!validation.isValid) {
        errors.push(...validation.errors);
        failCount++;
        continue;
      }
      
      // Check for duplicate roll number
      const existingStudent = await db
        .select()
        .from(students)
        .where(eq(students.rollNumber, validation.data!.rollNumber))
        .limit(1);
      
      if (existingStudent.length > 0) {
        errors.push(`Row ${i + 1}: Student with roll number ${validation.data!.rollNumber} already exists`);
        failCount++;
        continue;
      }
      
      // Insert student
      await db
        .insert(students)
        .values({
          ...validation.data,
          schoolId: schoolId,
        });
      
      successCount++;
      
    } catch (error) {
      console.error(`Error processing row ${i + 1}:`, error);
      errors.push(`Row ${i + 1}: Database error - ${error}`);
      failCount++;
    }
  }
  
  // Update batch status
  await db
    .update(studentImportBatches)
    .set({
      successfulImports: successCount,
      failedImports: failCount,
      status: failCount === 0 ? 'completed' : 'completed',
      errorLog: errors.length > 0 ? errors : null,
      completedAt: new Date(),
    })
    .where(eq(studentImportBatches.id, batchId));
}