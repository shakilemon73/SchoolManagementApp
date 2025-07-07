#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Get the DATABASE_URL from environment variables (direct connection)
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  console.log('🔧 Setting up document_templates table...');
  
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL database');

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

      // Insert all 57 templates
      const insertSQL = `
        INSERT INTO public.document_templates (name, name_bn, category, type, description, description_bn, template, is_active, credit_cost, popularity_score, usage_count) VALUES
        ('Student ID Card', 'ছাত্র পরিচয়পত্র', 'academic', 'id_card', 'Official student identification card with photo and details', 'ছবি এবং বিস্তারিত তথ্যসহ অফিসিয়াল ছাত্র পরিচয়পত্র', '{"fields": ["name", "studentId", "class", "section", "photo", "session", "validity"], "layout": "standard_id_card", "size": "cr80"}', true, 2, 95, 0),
        ('Admit Card', 'প্রবেশপত্র', 'examination', 'admit_card', 'Examination admit card with roll number and exam details', 'রোল নম্বর এবং পরীক্ষার বিস্তারিত তথ্যসহ পরীক্ষার প্রবেশপত্র', '{"fields": ["name", "rollNumber", "examName", "examDate", "center", "time", "subjects"], "layout": "admit_card_layout"}', true, 3, 88, 0),
        ('Academic Transcript', 'একাডেমিক ট্রান্সক্রিপ্ট', 'academic', 'transcript', 'Official academic transcript with grades and subjects', 'গ্রেড এবং বিষয়সহ অফিসিয়াল একাডেমিক ট্রান্সক্রিপ্ট', '{"fields": ["studentName", "studentId", "class", "subjects", "grades", "gpa", "session"], "layout": "transcript_layout"}', true, 4, 82, 0),
        ('Progress Report', 'অগ্রগতি প্রতিবেদন', 'academic', 'progress_report', 'Student academic progress report with detailed analysis', 'বিস্তারিত বিশ্লেষণসহ ছাত্রের একাডেমিক অগ্রগতি প্রতিবেদন', '{"fields": ["studentName", "class", "subjects", "grades", "attendance", "remarks", "period"], "layout": "progress_report_layout"}', true, 3, 76, 0),
        ('Class Routine', 'ক্লাসের রুটিন', 'academic', 'routine', 'Weekly class schedule with subjects and timings', 'বিষয় এবং সময়সূচিসহ সাপ্তাহিক ক্লাসের সময়সূচি', '{"fields": ["class", "section", "weekdays", "periods", "subjects", "teachers"], "layout": "routine_layout"}', true, 2, 79, 0),
        ('Academic Excellence Certificate', 'একাডেমিক শ্রেষ্ঠত্ব সনদপত্র', 'certificate', 'excellence_certificate', 'Certificate for academic excellence and outstanding performance', 'একাডেমিক শ্রেষ্ঠত্ব এবং অসাধারণ পারফরম্যান্সের জন্য সনদপত্র', '{"fields": ["recipientName", "achievement", "date", "authority", "signature"], "layout": "certificate_layout"}', true, 5, 85, 0),
        ('Participation Certificate', 'অংশগ্রহণ সনদপত্র', 'certificate', 'participation_certificate', 'Certificate for event or activity participation', 'ইভেন্ট বা কার্যকলাপে অংশগ্রহণের জন্য সনদপত্র', '{"fields": ["participantName", "eventName", "date", "duration", "organizer"], "layout": "participation_layout"}', true, 3, 72, 0),
        ('Sports Certificate', 'ক্রীড়া সনদপত্র', 'certificate', 'sports_certificate', 'Certificate for sports achievements and competitions', 'ক্রীড়া অর্জন এবং প্রতিযোগিতার জন্য সনদপত্র', '{"fields": ["athleteName", "sport", "position", "competition", "date"], "layout": "sports_certificate_layout"}', true, 4, 68, 0),
        ('Character Certificate', 'চরিত্র সনদপত্র', 'administrative', 'character_certificate', 'Official character certificate for students', 'ছাত্রদের জন্য অফিসিয়াল চরিত্র সনদপত্র', '{"fields": ["studentName", "studentId", "class", "conduct", "period", "authority"], "layout": "character_certificate_layout"}', true, 4, 74, 0),
        ('Transfer Certificate', 'স্থানান্তর সনদপত্র', 'administrative', 'transfer_certificate', 'Official transfer certificate for student migration', 'ছাত্র স্থানান্তরের জন্য অফিসিয়াল স্থানান্তর সনদপত্র', '{"fields": ["studentName", "studentId", "class", "dateOfLeaving", "reason", "conduct"], "layout": "transfer_certificate_layout"}', true, 5, 71, 0),
        ('Bonafide Certificate', 'বোনাফাইড সনদপত্র', 'administrative', 'bonafide_certificate', 'Student bonafide certificate for official purposes', 'অফিসিয়াল কাজের জন্য ছাত্র বোনাফাইড সনদপত্র', '{"fields": ["studentName", "studentId", "class", "session", "purpose"], "layout": "bonafide_layout"}', true, 3, 77, 0),
        ('Fee Receipt', 'ফি রসিদ', 'financial', 'fee_receipt', 'Official fee payment receipt with breakdown', 'বিস্তারিত বিবরণসহ অফিসিয়াল ফি পেমেন্ট রসিদ', '{"fields": ["studentName", "studentId", "amount", "feeType", "month", "receiptNo"], "layout": "receipt_layout"}', true, 2, 89, 0),
        ('Leave Application', 'ছুটির আবেদন', 'administrative', 'leave_application', 'Student leave application form', 'ছাত্রের ছুটির আবেদন ফর্ম', '{"fields": ["studentName", "class", "fromDate", "toDate", "reason", "parentSignature"], "layout": "application_layout"}', true, 2, 65, 0),
        ('Library Card', 'লাইব্রেরি কার্ড', 'library', 'library_card', 'Student library membership card', 'ছাত্র লাইব্রেরি সদস্যপদ কার্ড', '{"fields": ["memberName", "memberId", "class", "validity", "photo"], "layout": "library_card_layout"}', true, 2, 58, 0),
        ('Book Issue Receipt', 'বই ইস্যু রসিদ', 'library', 'book_receipt', 'Library book issue and return receipt', 'লাইব্রেরি বই ইস্যু এবং ফেরত রসিদ', '{"fields": ["memberName", "bookTitle", "author", "issueDate", "returnDate"], "layout": "book_receipt_layout"}', true, 1, 52, 0),
        ('Event Invitation', 'অনুষ্ঠানের আমন্ত্রণ', 'event', 'invitation', 'Official school event invitation card', 'অফিসিয়াল স্কুল অনুষ্ঠানের আমন্ত্রণ কার্ড', '{"fields": ["eventName", "date", "time", "venue", "organizer", "dresscode"], "layout": "invitation_layout"}', true, 3, 62, 0),
        ('Competition Certificate', 'প্রতিযোগিতার সনদপত্র', 'certificate', 'competition_certificate', 'Certificate for academic and cultural competitions', 'একাডেমিক এবং সাংস্কৃতিক প্রতিযোগিতার জন্য সনদপত্র', '{"fields": ["participantName", "competition", "position", "date", "category"], "layout": "competition_layout"}', true, 4, 69, 0),
        ('Medical Certificate', 'চিকিৎসা সনদপত্র', 'medical', 'medical_certificate', 'Student medical fitness certificate', 'ছাত্রের চিকিৎসা ফিটনেস সনদপত্র', '{"fields": ["studentName", "age", "medicalStatus", "doctorName", "date"], "layout": "medical_layout"}', true, 3, 56, 0),
        ('Health Card', 'স্বাস্থ্য কার্ড', 'medical', 'health_card', 'Student health information card', 'ছাত্রের স্বাস্থ্য তথ্য কার্ড', '{"fields": ["studentName", "bloodGroup", "allergies", "emergencyContact", "medicalHistory"], "layout": "health_card_layout"}', true, 2, 54, 0),
        ('Bus Pass', 'বাস পাস', 'transport', 'bus_pass', 'School bus transportation pass', 'স্কুল বাস পরিবহন পাস', '{"fields": ["studentName", "route", "stoppage", "validity", "photo"], "layout": "bus_pass_layout"}', true, 2, 61, 0),
        ('Mark Sheet', 'নম্বরপত্র', 'examination', 'mark_sheet', 'Official examination mark sheet with grades', 'গ্রেডসহ অফিসিয়াল পরীক্ষার নম্বরপত্র', '{"fields": ["studentName", "rollNumber", "exam", "subjects", "marks", "grade"], "layout": "mark_sheet_layout"}', true, 4, 84, 0),
        ('Exam Schedule', 'পরীক্ষার সময়সূচি', 'examination', 'exam_schedule', 'Detailed examination timetable and schedule', 'বিস্তারিত পরীক্ষার সময়সূচি এবং কর্মসূচি', '{"fields": ["examName", "class", "subjects", "dates", "times", "duration"], "layout": "schedule_layout"}', true, 2, 73, 0),
        ('Teacher ID Card', 'শিক্ষক পরিচয়পত্র', 'staff', 'teacher_id', 'Official teacher identification card', 'অফিসিয়াল শিক্ষক পরিচয়পত্র', '{"fields": ["teacherName", "employeeId", "designation", "department", "photo"], "layout": "teacher_id_layout"}', true, 3, 67, 0),
        ('Staff Certificate', 'কর্মচারী সনদপত্র', 'staff', 'staff_certificate', 'Employment certificate for teaching staff', 'শিক্ষক কর্মচারীদের জন্য চাকরির সনদপত্র', '{"fields": ["staffName", "designation", "joiningDate", "department", "salary"], "layout": "employment_layout"}', true, 4, 59, 0),
        ('Attendance Certificate', 'উপস্থিতি সনদপত্র', 'academic', 'attendance_certificate', 'Student attendance record certificate', 'ছাত্রের উপস্থিতির রেকর্ড সনদপত্র', '{"fields": ["studentName", "class", "totalDays", "presentDays", "percentage"], "layout": "attendance_layout"}', true, 3, 64, 0),
        ('Study Certificate', 'অধ্যয়ন সনদপত্র', 'academic', 'study_certificate', 'Certificate of current studies and enrollment', 'বর্তমান অধ্যয়ন এবং ভর্তির সনদপত্র', '{"fields": ["studentName", "class", "session", "rollNumber", "subjects"], "layout": "study_certificate_layout"}', true, 3, 66, 0),
        ('Good Conduct Certificate', 'সুআচরণ সনদপত্র', 'administrative', 'conduct_certificate', 'Certificate for good behavior and conduct', 'ভাল আচরণ এবং আচার-আচরণের জন্য সনদপত্র', '{"fields": ["studentName", "class", "period", "conduct", "remarks"], "layout": "conduct_layout"}', true, 4, 63, 0),
        ('Migration Certificate', 'মাইগ্রেশন সনদপত্র', 'administrative', 'migration_certificate', 'Official migration certificate for university admission', 'বিশ্ববিদ্যালয় ভর্তির জন্য অফিসিয়াল মাইগ্রেশন সনদপত্র', '{"fields": ["studentName", "rollNumber", "examPassed", "board", "year"], "layout": "migration_layout"}', true, 5, 70, 0),
        ('Scholarship Certificate', 'বৃত্তি সনদপত্র', 'financial', 'scholarship_certificate', 'Merit or need-based scholarship certificate', 'মেধা বা প্রয়োজন ভিত্তিক বৃত্তি সনদপত্র', '{"fields": ["recipientName", "scholarshipType", "amount", "duration", "criteria"], "layout": "scholarship_layout"}', true, 4, 75, 0),
        ('Fee Waiver Certificate', 'ফি মওকুফ সনদপত্র', 'financial', 'fee_waiver', 'Fee concession or waiver certificate', 'ফি ছাড় বা মওকুফ সনদপত্র', '{"fields": ["studentName", "class", "waiverAmount", "reason", "period"], "layout": "waiver_layout"}', true, 3, 57, 0),
        ('Age Certificate', 'বয়স সনদপত্র', 'administrative', 'age_certificate', 'Official age verification certificate', 'অফিসিয়াল বয়স যাচাইকরণ সনদপত্র', '{"fields": ["studentName", "dateOfBirth", "age", "fatherName", "class"], "layout": "age_certificate_layout"}', true, 3, 55, 0),
        ('Name Change Certificate', 'নাম পরিবর্তন সনদপত্র', 'administrative', 'name_change', 'Official name correction or change certificate', 'অফিসিয়াল নাম সংশোধন বা পরিবর্তন সনদপত্র', '{"fields": ["oldName", "newName", "reason", "documents", "authority"], "layout": "name_change_layout"}', true, 4, 48, 0),
        ('Online Course Certificate', 'অনলাইন কোর্স সনদপত্র', 'digital', 'online_certificate', 'Certificate for completed online courses', 'সম্পন্ন অনলাইন কোর্সের জন্য সনদপত্র', '{"fields": ["participantName", "courseName", "duration", "platform", "completionDate"], "layout": "online_course_layout"}', true, 3, 51, 0),
        ('Digital Portfolio', 'ডিজিটাল পোর্টফোলিও', 'digital', 'portfolio', 'Student digital achievement portfolio', 'ছাত্রের ডিজিটাল অর্জন পোর্টফোলিও', '{"fields": ["studentName", "achievements", "projects", "skills", "certificates"], "layout": "portfolio_layout"}', true, 4, 53, 0),
        ('Parent Meeting Notice', 'অভিভাবক সভার নোটিশ', 'communication', 'meeting_notice', 'Notice for parent-teacher meeting', 'অভিভাবক-শিক্ষক সভার জন্য নোটিশ', '{"fields": ["meetingDate", "time", "agenda", "venue", "contact"], "layout": "notice_layout"}', true, 2, 60, 0),
        ('Progress Report Card', 'অগ্রগতি রিপোর্ট কার্ড', 'academic', 'report_card', 'Comprehensive student progress report card', 'বিস্তৃত ছাত্র অগ্রগতি রিপোর্ট কার্ড', '{"fields": ["studentName", "subjects", "grades", "attendance", "behavior", "recommendations"], "layout": "report_card_layout"}', true, 4, 81, 0),
        ('Club Membership Certificate', 'ক্লাব সদস্যপদ সনদপত্র', 'extracurricular', 'club_membership', 'School club or society membership certificate', 'স্কুল ক্লাব বা সোসাইটি সদস্যপদ সনদপত্র', '{"fields": ["memberName", "clubName", "position", "joiningDate", "activities"], "layout": "membership_layout"}', true, 3, 58, 0),
        ('Leadership Certificate', 'নেতৃত্ব সনদপত্র', 'extracurricular', 'leadership_certificate', 'Certificate for student leadership roles', 'ছাত্র নেতৃত্বের ভূমিকার জন্য সনদপত্র', '{"fields": ["leaderName", "position", "responsibilities", "tenure", "achievements"], "layout": "leadership_layout"}', true, 4, 65, 0),
        ('Safety Training Certificate', 'নিরাপত্তা প্রশিক্ষণ সনদপত্র', 'safety', 'safety_certificate', 'Certificate for safety training completion', 'নিরাপত্তা প্রশিক্ষণ সম্পন্নের জন্য সনদপত্র', '{"fields": ["participantName", "trainingType", "duration", "instructor", "date"], "layout": "safety_layout"}', true, 3, 49, 0),
        ('Emergency Contact Card', 'জরুরি যোগাযোগ কার্ড', 'safety', 'emergency_card', 'Student emergency contact information card', 'ছাত্রের জরুরি যোগাযোগের তথ্য কার্ড', '{"fields": ["studentName", "parentContact", "medicalInfo", "emergencyContacts", "allergies"], "layout": "emergency_layout"}', true, 2, 62, 0),
        ('Computer Lab Certificate', 'কম্পিউটার ল্যাব সনদপত্র', 'technology', 'computer_certificate', 'Certificate for computer skills and lab usage', 'কম্পিউটার দক্ষতা এবং ল্যাব ব্যবহারের জন্য সনদপত্র', '{"fields": ["studentName", "skills", "projects", "duration", "instructor"], "layout": "computer_layout"}', true, 3, 56, 0),
        ('Science Fair Certificate', 'বিজ্ঞান মেলা সনদপত্র', 'academic', 'science_fair', 'Certificate for science fair participation and awards', 'বিজ্ঞান মেলায় অংশগ্রহণ এবং পুরস্কারের জন্য সনদপত্র', '{"fields": ["participantName", "projectTitle", "category", "award", "date"], "layout": "science_fair_layout"}', true, 4, 61, 0),
        ('Cultural Performance Certificate', 'সাংস্কৃতিক অনুষ্ঠান সনদপত্র', 'cultural', 'cultural_certificate', 'Certificate for cultural activities and performances', 'সাংস্কৃতিক কার্যকলাপ এবং পারফরম্যান্সের জন্য সনদপত্র', '{"fields": ["performerName", "performance", "event", "date", "recognition"], "layout": "cultural_layout"}', true, 3, 59, 0),
        ('Art Competition Certificate', 'শিল্প প্রতিযোগিতা সনদপত্র', 'cultural', 'art_certificate', 'Certificate for art and craft competitions', 'শিল্প ও কারুশিল্প প্রতিযোগিতার জন্য সনদপত্র', '{"fields": ["artistName", "artType", "competition", "position", "judge"], "layout": "art_layout"}', true, 3, 54, 0),
        ('Community Service Certificate', 'কমিউনিটি সেবা সনদপত্র', 'service', 'community_service', 'Certificate for community service and volunteer work', 'কমিউনিটি সেবা এবং স্বেচ্ছাসেবক কাজের জন্য সনদপত্র', '{"fields": ["volunteerName", "serviceType", "hours", "organization", "supervisor"], "layout": "service_layout"}', true, 4, 52, 0),
        ('Environmental Award Certificate', 'পরিবেশগত পুরস্কার সনদপত্র', 'service', 'environmental_certificate', 'Certificate for environmental conservation activities', 'পরিবেশ সংরক্ষণ কার্যক্রমের জন্য সনদপত্র', '{"fields": ["recipientName", "activity", "impact", "duration", "recognition"], "layout": "environmental_layout"}', true, 4, 50, 0),
        ('Research Project Certificate', 'গবেষণা প্রকল্প সনদপত্র', 'research', 'research_certificate', 'Certificate for student research projects', 'ছাত্র গবেষণা প্রকল্পের জন্য সনদপত্র', '{"fields": ["researcherName", "projectTitle", "guide", "duration", "findings"], "layout": "research_layout"}', true, 5, 47, 0),
        ('Innovation Certificate', 'উদ্ভাবন সনদপত্র', 'research', 'innovation_certificate', 'Certificate for innovative ideas and inventions', 'উদ্ভাবনী ধারণা এবং আবিষ্কারের জন্য সনদপত্র', '{"fields": ["innovatorName", "innovation", "application", "mentor", "date"], "layout": "innovation_layout"}', true, 5, 46, 0),
        ('Exchange Program Certificate', 'এক্সচেঞ্জ প্রোগ্রাম সনদপত্র', 'international', 'exchange_certificate', 'Certificate for international exchange programs', 'আন্তর্জাতিক এক্সচেঞ্জ প্রোগ্রামের জন্য সনদপত্র', '{"fields": ["participantName", "program", "country", "duration", "institution"], "layout": "exchange_layout"}', true, 6, 44, 0),
        ('Language Proficiency Certificate', 'ভাষা দক্ষতা সনদপত্র', 'academic', 'language_certificate', 'Certificate for language learning and proficiency', 'ভাষা শেখা এবং দক্ষতার জন্য সনদপত্র', '{"fields": ["studentName", "language", "level", "examBoard", "score"], "layout": "language_layout"}', true, 4, 58, 0),
        ('Outstanding Student Award', 'অসাধারণ ছাত্র পুরস্কার', 'recognition', 'outstanding_award', 'Award for exceptional overall performance', 'ব্যতিক্রমী সামগ্রিক পারফরম্যান্সের জন্য পুরস্কার', '{"fields": ["awardee", "criteria", "achievements", "year", "authority"], "layout": "award_layout"}', true, 5, 78, 0),
        ('Perfect Attendance Award', 'নিখুঁত উপস্থিতি পুরস্কার', 'recognition', 'attendance_award', 'Award for perfect attendance record', 'নিখুঁত উপস্থিতির রেকর্ডের জন্য পুরস্কার', '{"fields": ["studentName", "period", "totalDays", "achievement", "recognition"], "layout": "attendance_award_layout"}', true, 3, 67, 0),
        ('Graduation Certificate', 'স্নাতক সনদপত্র', 'graduation', 'graduation_certificate', 'Official graduation completion certificate', 'অফিসিয়াল স্নাতক সমাপনী সনদপত্র', '{"fields": ["graduateName", "degree", "major", "gpa", "graduationDate"], "layout": "graduation_layout"}', true, 6, 85, 0),
        ('Alumni Certificate', 'প্রাক্তন ছাত্র সনদপত্র', 'alumni', 'alumni_certificate', 'Certificate for school alumni recognition', 'স্কুল প্রাক্তন ছাত্র স্বীকৃতির জন্য সনদপত্র', '{"fields": ["alumniName", "graduationYear", "achievements", "contribution", "recognition"], "layout": "alumni_layout"}', true, 4, 43, 0);
      `;

      await client.query(insertSQL);
      console.log('✓ All 57 templates inserted successfully');
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

setupDatabase().catch(console.error);