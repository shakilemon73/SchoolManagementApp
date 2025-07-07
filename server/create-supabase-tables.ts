import { Express, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

export function registerCreateSupabaseTables(app: Express) {
  // Create necessary tables in Supabase for document dashboard
  app.get('/setup-supabase-tables', async (req: Request, res: Response) => {
    try {
      console.log('=== Setting up Supabase tables for document dashboard ===');
      
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return res.status(400).json({ error: 'Missing Supabase credentials' });
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Create document_templates table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS document_templates (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          name_bn TEXT,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          description_bn TEXT,
          icon TEXT,
          required_credits INTEGER DEFAULT 1,
          usage_count INTEGER DEFAULT 0,
          last_used TIMESTAMP,
          difficulty TEXT DEFAULT 'easy',
          estimated_time TEXT,
          is_active BOOLEAN DEFAULT true,
          is_popular BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      
      // Create the table by attempting to insert data first
      // This will help us understand if the table exists or needs to be created manually
      console.log('Testing table existence and creating sample data...');
      
      // Insert sample document templates
      const sampleTemplates = [
        {
          name: 'Student ID Card',
          name_bn: 'শিক্ষার্থী পরিচয়পত্র',
          type: 'student_id_card',
          category: 'student_documents',
          description: 'Generate student identification cards',
          description_bn: 'শিক্ষার্থীদের পরিচয়পত্র তৈরি করুন',
          icon: 'badge',
          required_credits: 1,
          difficulty: 'easy',
          estimated_time: '2 minutes'
        },
        {
          name: 'Transfer Certificate',
          name_bn: 'স্থানান্তর সনদ',
          type: 'transfer_certificate',
          category: 'academic_documents',
          description: 'Generate transfer certificates for students',
          description_bn: 'শিক্ষার্থীদের জন্য স্থানান্তর সনদ তৈরি করুন',
          icon: 'article',
          required_credits: 2,
          difficulty: 'medium',
          estimated_time: '5 minutes'
        },
        {
          name: 'Admit Card',
          name_bn: 'প্রবেশপত্র',
          type: 'admit_card',
          category: 'exam_documents',
          description: 'Generate examination admit cards',
          description_bn: 'পরীক্ষার প্রবেশপত্র তৈরি করুন',
          icon: 'assignment',
          required_credits: 1,
          difficulty: 'easy',
          estimated_time: '3 minutes'
        },
        {
          name: 'Mark Sheet',
          name_bn: 'নম্বরপত্র',
          type: 'mark_sheet',
          category: 'exam_documents',
          description: 'Generate student mark sheets',
          description_bn: 'শিক্ষার্থীদের নম্বরপত্র তৈরি করুন',
          icon: 'grade',
          required_credits: 2,
          difficulty: 'medium',
          estimated_time: '4 minutes'
        },
        {
          name: 'Teacher ID Card',
          name_bn: 'শিক্ষক পরিচয়পত্র',
          type: 'teacher_id_card',
          category: 'teacher_documents',
          description: 'Generate teacher identification cards',
          description_bn: 'শিক্ষকদের পরিচয়পত্র তৈরি করুন',
          icon: 'person',
          required_credits: 1,
          difficulty: 'easy',
          estimated_time: '2 minutes'
        },
        {
          name: 'Certificate',
          name_bn: 'সনদপত্র',
          type: 'certificate',
          category: 'academic_documents',
          description: 'Generate various certificates',
          description_bn: 'বিভিন্ন সনদপত্র তৈরি করুন',
          icon: 'workspace_premium',
          required_credits: 3,
          difficulty: 'medium',
          estimated_time: '6 minutes'
        }
      ];
      
      // Insert sample data
      const { data: insertData, error: insertError } = await supabase
        .from('document_templates')
        .insert(sampleTemplates)
        .select();
      
      console.log('Sample data insertion:', { insertData, insertError });
      
      // Verify table creation and data
      const { data: verifyData, count } = await supabase
        .from('document_templates')
        .select('*', { count: 'exact' });
      
      res.json({
        success: true,
        message: 'Document dashboard Supabase setup completed',
        results: {
          sampleDataInserted: !insertError,
          totalDocuments: count,
          documents: verifyData,
          tableSQL: createTableSQL
        },
        errors: {
          insertError: insertError?.message || null
        },
        note: 'If table does not exist, create it manually in Supabase SQL editor using the provided SQL'
      });
      
    } catch (error: any) {
      console.error('Error setting up Supabase tables:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to setup Supabase tables for document dashboard'
      });
    }
  });
}