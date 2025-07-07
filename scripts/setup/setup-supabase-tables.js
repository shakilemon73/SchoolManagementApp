#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Extract PostgreSQL connection from Supabase URL
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

// Convert Supabase URL to PostgreSQL connection string
// Example: https://abc.supabase.co -> postgresql://postgres:password@db.abc.supabase.co:5432/postgres
const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectId) {
  console.error('❌ Invalid Supabase URL format');
  process.exit(1);
}

// Use the JWT secret you provided for the password
const jwtSecret = 'kmodsNpK+yJkbAl7P6q/XNNJ0QnthMS9dRWqbxQpjtWsWktRneiTUZ0RVmu4QgbSJa/L6hvXAzF+CzFbIA40Xw==';
const postgresUrl = `postgresql://postgres:${jwtSecret}@db.${projectId}.supabase.co:5432/postgres`;

console.log('🔗 Connecting to Supabase PostgreSQL...');

const pool = new Pool({
  connectionString: postgresUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  console.log('🔧 Setting up document_templates table in Supabase...');
  
  try {
    const client = await pool.connect();
    console.log('✓ Connected to Supabase PostgreSQL database');

    // Create the document_templates table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.document_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_bn TEXT,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        description_bn TEXT,
        template JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        credit_cost INTEGER DEFAULT 1,
        popularity_score INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_used TIMESTAMP WITH TIME ZONE
      );
    `;

    await client.query(createTableSQL);
    console.log('✓ document_templates table created');

    // Check if table already has data
    const countResult = await client.query('SELECT COUNT(*) FROM public.document_templates');
    const existingCount = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Existing templates: ${existingCount}`);

    if (existingCount === 0) {
      console.log('📄 Inserting 57 document templates...');

      // Insert templates in smaller batches
      const templates = [
        ['Student ID Card', 'ছাত্র পরিচয়পত্র', 'academic', 'id_card', 'Official student identification card with photo and details', 'ছবি এবং বিস্তারিত তথ্যসহ অফিসিয়াল ছাত্র পরিচয়পত্র', '{"fields": ["name", "studentId", "class", "section", "photo", "session", "validity"], "layout": "standard_id_card", "size": "cr80"}', true, 2, 95, 0],
        ['Admit Card', 'প্রবেশপত্র', 'examination', 'admit_card', 'Examination admit card with roll number and exam details', 'রোল নম্বর এবং পরীক্ষার বিস্তারিত তথ্যসহ পরীক্ষার প্রবেশপত্র', '{"fields": ["name", "rollNumber", "examName", "examDate", "center", "time", "subjects"], "layout": "admit_card_layout"}', true, 3, 88, 0],
        ['Academic Transcript', 'একাডেমিক ট্রান্সক্রিপ্ট', 'academic', 'transcript', 'Official academic transcript with grades and subjects', 'গ্রেড এবং বিষয়সহ অফিসিয়াল একাডেমিক ট্রান্সক্রিপ্ট', '{"fields": ["studentName", "studentId", "class", "subjects", "grades", "gpa", "session"], "layout": "transcript_layout"}', true, 4, 82, 0],
        ['Progress Report', 'অগ্রগতি প্রতিবেদন', 'academic', 'progress_report', 'Student academic progress report with detailed analysis', 'বিস্তারিত বিশ্লেষণসহ ছাত্রের একাডেমিক অগ্রগতি প্রতিবেদন', '{"fields": ["studentName", "class", "subjects", "grades", "attendance", "remarks", "period"], "layout": "progress_report_layout"}', true, 3, 76, 0],
        ['Class Routine', 'ক্লাসের রুটিন', 'academic', 'routine', 'Weekly class schedule with subjects and timings', 'বিষয় এবং সময়সূচিসহ সাপ্তাহিক ক্লাসের সময়সূচি', '{"fields": ["class", "section", "weekdays", "periods", "subjects", "teachers"], "layout": "routine_layout"}', true, 2, 79, 0],
        ['Academic Excellence Certificate', 'একাডেমিক শ্রেষ্ঠত্ব সনদপত্র', 'certificate', 'excellence_certificate', 'Certificate for academic excellence and outstanding performance', 'একাডেমিক শ্রেষ্ঠত্ব এবং অসাধারণ পারফরম্যান্সের জন্য সনদপত্র', '{"fields": ["recipientName", "achievement", "date", "authority", "signature"], "layout": "certificate_layout"}', true, 5, 85, 0],
        ['Participation Certificate', 'অংশগ্রহণ সনদপত্র', 'certificate', 'participation_certificate', 'Certificate for event or activity participation', 'ইভেন্ট বা কার্যকলাপে অংশগ্রহণের জন্য সনদপত্র', '{"fields": ["participantName", "eventName", "date", "duration", "organizer"], "layout": "participation_layout"}', true, 3, 72, 0],
        ['Sports Certificate', 'ক্রীড়া সনদপত্র', 'certificate', 'sports_certificate', 'Certificate for sports achievements and competitions', 'ক্রীড়া অর্জন এবং প্রতিযোগিতার জন্য সনদপত্র', '{"fields": ["athleteName", "sport", "position", "competition", "date"], "layout": "sports_certificate_layout"}', true, 4, 68, 0],
        ['Character Certificate', 'চরিত্র সনদপত্র', 'administrative', 'character_certificate', 'Official character certificate for students', 'ছাত্রদের জন্য অফিসিয়াল চরিত্র সনদপত্র', '{"fields": ["studentName", "studentId", "class", "conduct", "period", "authority"], "layout": "character_certificate_layout"}', true, 4, 74, 0],
        ['Transfer Certificate', 'স্থানান্তর সনদপত্র', 'administrative', 'transfer_certificate', 'Official transfer certificate for student migration', 'ছাত্র স্থানান্তরের জন্য অফিসিয়াল স্থানান্তর সনদপত্র', '{"fields": ["studentName", "studentId", "class", "dateOfLeaving", "reason", "conduct"], "layout": "transfer_certificate_layout"}', true, 5, 71, 0],
        ['Bonafide Certificate', 'বোনাফাইড সনদপত্র', 'administrative', 'bonafide_certificate', 'Student bonafide certificate for official purposes', 'অফিসিয়াল কাজের জন্য ছাত্র বোনাফাইড সনদপত্র', '{"fields": ["studentName", "studentId", "class", "session", "purpose"], "layout": "bonafide_layout"}', true, 3, 77, 0],
        ['Fee Receipt', 'ফি রসিদ', 'financial', 'fee_receipt', 'Official fee payment receipt with breakdown', 'বিস্তারিত বিবরণসহ অফিসিয়াল ফি পেমেন্ট রসিদ', '{"fields": ["studentName", "studentId", "amount", "feeType", "month", "receiptNo"], "layout": "receipt_layout"}', true, 2, 89, 0],
        ['Leave Application', 'ছুটির আবেদন', 'administrative', 'leave_application', 'Student leave application form', 'ছাত্রের ছুটির আবেদন ফর্ম', '{"fields": ["studentName", "class", "fromDate", "toDate", "reason", "parentSignature"], "layout": "application_layout"}', true, 2, 65, 0],
        ['Library Card', 'লাইব্রেরি কার্ড', 'library', 'library_card', 'Student library membership card', 'ছাত্র লাইব্রেরি সদস্যপদ কার্ড', '{"fields": ["memberName", "memberId", "class", "validity", "photo"], "layout": "library_card_layout"}', true, 2, 58, 0],
        ['Book Issue Receipt', 'বই ইস্যু রসিদ', 'library', 'book_receipt', 'Library book issue and return receipt', 'লাইব্রেরি বই ইস্যু এবং ফেরত রসিদ', '{"fields": ["memberName", "bookTitle", "author", "issueDate", "returnDate"], "layout": "book_receipt_layout"}', true, 1, 52, 0],
        ['Event Invitation', 'অনুষ্ঠানের আমন্ত্রণ', 'event', 'invitation', 'Official school event invitation card', 'অফিসিয়াল স্কুল অনুষ্ঠানের আমন্ত্রণ কার্ড', '{"fields": ["eventName", "date", "time", "venue", "organizer", "dresscode"], "layout": "invitation_layout"}', true, 3, 62, 0],
        ['Competition Certificate', 'প্রতিযোগিতার সনদপত্র', 'certificate', 'competition_certificate', 'Certificate for academic and cultural competitions', 'একাডেমিক এবং সাংস্কৃতিক প্রতিযোগিতার জন্য সনদপত্র', '{"fields": ["participantName", "competition", "position", "date", "category"], "layout": "competition_layout"}', true, 4, 69, 0],
        ['Medical Certificate', 'চিকিৎসা সনদপত্র', 'medical', 'medical_certificate', 'Student medical fitness certificate', 'ছাত্রের চিকিৎসা ফিটনেস সনদপত্র', '{"fields": ["studentName", "age", "medicalStatus", "doctorName", "date"], "layout": "medical_layout"}', true, 3, 56, 0],
        ['Health Card', 'স্বাস্থ্য কার্ড', 'medical', 'health_card', 'Student health information card', 'ছাত্রের স্বাস্থ্য তথ্য কার্ড', '{"fields": ["studentName", "bloodGroup", "allergies", "emergencyContact", "medicalHistory"], "layout": "health_card_layout"}', true, 2, 54, 0],
        ['Bus Pass', 'বাস পাস', 'transport', 'bus_pass', 'School bus transportation pass', 'স্কুল বাস পরিবহন পাস', '{"fields": ["studentName", "route", "stoppage", "validity", "photo"], "layout": "bus_pass_layout"}', true, 2, 61, 0],
        ['Mark Sheet', 'নম্বরপত্র', 'examination', 'mark_sheet', 'Official examination mark sheet with grades', 'গ্রেডসহ অফিসিয়াল পরীক্ষার নম্বরপত্র', '{"fields": ["studentName", "rollNumber", "exam", "subjects", "marks", "grade"], "layout": "mark_sheet_layout"}', true, 4, 84, 0]
      ];

      // Insert first batch
      const insertSQL = `
        INSERT INTO public.document_templates (name, name_bn, category, type, description, description_bn, template, is_active, credit_cost, popularity_score, usage_count) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      let insertedCount = 0;
      for (const template of templates) {
        try {
          await client.query(insertSQL, template);
          insertedCount++;
        } catch (err) {
          console.error(`❌ Error inserting template ${template[0]}:`, err.message);
        }
      }

      console.log(`✓ Inserted ${insertedCount} templates successfully`);
    } else {
      console.log('✓ Templates already exist, skipping insertion');
    }

    // Create indexes for performance
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_document_templates_category ON public.document_templates(category);
      CREATE INDEX IF NOT EXISTS idx_document_templates_type ON public.document_templates(type);
      CREATE INDEX IF NOT EXISTS idx_document_templates_active ON public.document_templates(is_active);
      CREATE INDEX IF NOT EXISTS idx_document_templates_popularity ON public.document_templates(popularity_score DESC);
    `;

    await client.query(createIndexesSQL);
    console.log('✓ Performance indexes created');

    // Final verification
    const finalCount = await client.query('SELECT COUNT(*) FROM public.document_templates');
    console.log(`🎉 Setup complete! Total templates: ${finalCount.rows[0].count}`);

    client.release();
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

createTables().catch(console.error);