import { Express, Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export function registerFixStudentImportTable(app: Express) {
  // Create missing student_import_batches table
  app.post("/api/fix-student-import-table", async (req: Request, res: Response) => {
    try {
      console.log('🔧 Creating student_import_batches table...');

      // Create the table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS student_import_batches (
          id SERIAL PRIMARY KEY,
          file_name TEXT NOT NULL,
          file_size INTEGER,
          total_records INTEGER NOT NULL,
          successful_imports INTEGER DEFAULT 0,
          failed_imports INTEGER DEFAULT 0,
          status TEXT DEFAULT 'processing' NOT NULL,
          error_log JSONB,
          uploaded_by TEXT,
          school_id INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          completed_at TIMESTAMP
        );
      `);

      // Create indexes
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_student_import_batches_status ON student_import_batches(status);
        CREATE INDEX IF NOT EXISTS idx_student_import_batches_school ON student_import_batches(school_id);
        CREATE INDEX IF NOT EXISTS idx_student_import_batches_created ON student_import_batches(created_at);
      `);

      // Insert sample import history
      await db.execute(sql`
        INSERT INTO student_import_batches (
          file_name, 
          file_size, 
          total_records, 
          successful_imports, 
          failed_imports, 
          status,
          uploaded_by,
          school_id,
          created_at,
          completed_at
        ) VALUES 
        (
          'hsc_students_2024.xlsx', 
          45632, 
          120, 
          118, 
          2, 
          'completed',
          '7324a820-4c85-4a60-b791-57b9cfad6bf9',
          1,
          NOW() - INTERVAL '2 days',
          NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'
        ),
        (
          'ssc_students_batch_1.csv', 
          28945, 
          85, 
          85, 
          0, 
          'completed',
          '7324a820-4c85-4a60-b791-57b9cfad6bf9',
          1,
          NOW() - INTERVAL '1 day',
          NOW() - INTERVAL '1 day' + INTERVAL '3 minutes'
        ),
        (
          'jsc_students_import.xlsx', 
          19876, 
          65, 
          62, 
          3, 
          'completed',
          '7324a820-4c85-4a60-b791-57b9cfad6bf9',
          1,
          NOW() - INTERVAL '3 hours',
          NOW() - INTERVAL '3 hours' + INTERVAL '2 minutes'
        )
        ON CONFLICT DO NOTHING;
      `);

      // Get statistics
      const stats = await db.execute(sql`
        SELECT 
          COUNT(*) as total_batches,
          SUM(total_records) as total_students_imported,
          SUM(successful_imports) as successful_imports,
          SUM(failed_imports) as failed_imports
        FROM student_import_batches;
      `);

      res.json({
        success: true,
        message: 'student_import_batches table created successfully',
        stats: stats[0]
      });

      console.log('✅ student_import_batches table setup completed');

    } catch (error) {
      console.error('❌ Error creating table:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create student_import_batches table',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}