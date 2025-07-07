#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function createDocumentTemplatesTable() {
  console.log('🔧 Creating document_templates table...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✓ Supabase admin client created');

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

    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (createError) {
      console.error('❌ Error creating table:', createError);
      
      // Try alternative approach using direct SQL execution
      const { error: altError } = await supabase
        .from('_supabase_migrations')
        .select('version')
        .limit(1);
        
      if (altError) {
        console.log('🔄 Trying direct table creation...');
        
        // Use the SQL editor approach
        const { data, error } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')
          .eq('tablename', 'document_templates');
          
        if (error) {
          console.error('❌ Cannot access database:', error);
          return;
        }
        
        if (data && data.length === 0) {
          console.log('📝 Table does not exist, creating via SQL...');
          
          // Since we can't execute raw SQL directly, let's create a simple table structure
          const simpleTemplate = {
            id: 1,
            name: 'Test Template',
            name_bn: 'টেস্ট টেমপ্লেট',
            category: 'test',
            type: 'test_type',
            description: 'Test template',
            description_bn: 'টেস্ট টেমপ্লেট',
            template: { fields: ['test'] },
            is_active: true,
            credit_cost: 1,
            popularity_score: 0,
            usage_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Try to insert a test record to see if table exists
          const { error: insertError } = await supabase
            .from('document_templates')
            .insert(simpleTemplate);
            
          if (insertError) {
            console.error('❌ Table creation needed:', insertError.message);
            console.log('📋 Please create the table manually in Supabase SQL editor with this SQL:');
            console.log(createTableSQL);
            return;
          }
          
          console.log('✓ Table exists or was created successfully');
        } else {
          console.log('✓ Table already exists');
        }
      }
    } else {
      console.log('✓ Table created successfully');
    }

    // Now let's insert the 57 comprehensive document templates
    const documentTemplates = [
      // Academic Documents
      {
        name: 'Student ID Card',
        name_bn: 'ছাত্র পরিচয়পত্র',
        category: 'academic',
        type: 'id_card',
        description: 'Official student identification card with photo and details',
        description_bn: 'ছবি এবং বিস্তারিত তথ্যসহ অফিসিয়াল ছাত্র পরিচয়পত্র',
        template: {
          fields: ['name', 'studentId', 'class', 'section', 'photo', 'session', 'validity'],
          layout: 'standard_id_card',
          size: 'cr80'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 95
      },
      {
        name: 'Admit Card',
        name_bn: 'প্রবেশপত্র',
        category: 'examination',
        type: 'admit_card',
        description: 'Examination admit card with roll number and exam details',
        description_bn: 'রোল নম্বর এবং পরীক্ষার বিস্তারিত তথ্যসহ পরীক্ষার প্রবেশপত্র',
        template: {
          fields: ['name', 'rollNumber', 'examName', 'examDate', 'center', 'time', 'subjects'],
          layout: 'admit_card_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 88
      },
      {
        name: 'Academic Transcript',
        name_bn: 'একাডেমিক ট্রান্সক্রিপ্ট',
        category: 'academic',
        type: 'transcript',
        description: 'Official academic transcript with grades and subjects',
        description_bn: 'গ্রেড এবং বিষয়সহ অফিসিয়াল একাডেমিক ট্রান্সক্রিপ্ট',
        template: {
          fields: ['studentName', 'studentId', 'class', 'subjects', 'grades', 'gpa', 'session'],
          layout: 'transcript_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 82
      },
      {
        name: 'Progress Report',
        name_bn: 'অগ্রগতি প্রতিবেদন',
        category: 'academic',
        type: 'progress_report',
        description: 'Student academic progress report with detailed analysis',
        description_bn: 'বিস্তারিত বিশ্লেষণসহ ছাত্রের একাডেমিক অগ্রগতি প্রতিবেদন',
        template: {
          fields: ['studentName', 'class', 'subjects', 'grades', 'attendance', 'remarks', 'period'],
          layout: 'progress_report_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 76
      },
      {
        name: 'Class Routine',
        name_bn: 'ক্লাসের রুটিন',
        category: 'academic',
        type: 'routine',
        description: 'Weekly class schedule with subjects and timings',
        description_bn: 'বিষয় এবং সময়সূচিসহ সাপ্তাহিক ক্লাসের সময়সূচি',
        template: {
          fields: ['class', 'section', 'weekdays', 'periods', 'subjects', 'teachers'],
          layout: 'routine_layout'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 79
      },

      // Certificates
      {
        name: 'Academic Excellence Certificate',
        name_bn: 'একাডেমিক শ্রেষ্ঠত্ব সনদপত্র',
        category: 'certificate',
        type: 'excellence_certificate',
        description: 'Certificate for academic excellence and outstanding performance',
        description_bn: 'একাডেমিক শ্রেষ্ঠত্ব এবং অসাধারণ পারফরম্যান্সের জন্য সনদপত্র',
        template: {
          fields: ['recipientName', 'achievement', 'date', 'authority', 'signature'],
          layout: 'certificate_layout'
        },
        is_active: true,
        credit_cost: 5,
        popularity_score: 85
      },
      {
        name: 'Participation Certificate',
        name_bn: 'অংশগ্রহণ সনদপত্র',
        category: 'certificate',
        type: 'participation_certificate',
        description: 'Certificate for event or activity participation',
        description_bn: 'ইভেন্ট বা কার্যকলাপে অংশগ্রহণের জন্য সনদপত্র',
        template: {
          fields: ['participantName', 'eventName', 'date', 'duration', 'organizer'],
          layout: 'participation_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 72
      },
      {
        name: 'Sports Certificate',
        name_bn: 'ক্রীড়া সনদপত্র',
        category: 'certificate',
        type: 'sports_certificate',
        description: 'Certificate for sports achievements and competitions',
        description_bn: 'ক্রীড়া অর্জন এবং প্রতিযোগিতার জন্য সনদপত্র',
        template: {
          fields: ['athleteName', 'sport', 'position', 'competition', 'date'],
          layout: 'sports_certificate_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 68
      },
      {
        name: 'Character Certificate',
        name_bn: 'চরিত্র সনদপত্র',
        category: 'administrative',
        type: 'character_certificate',
        description: 'Official character certificate for students',
        description_bn: 'ছাত্রদের জন্য অফিসিয়াল চরিত্র সনদপত্র',
        template: {
          fields: ['studentName', 'studentId', 'class', 'conduct', 'period', 'authority'],
          layout: 'character_certificate_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 74
      },

      // Administrative Documents
      {
        name: 'Transfer Certificate',
        name_bn: 'স্থানান্তর সনদপত্র',
        category: 'administrative',
        type: 'transfer_certificate',
        description: 'Official transfer certificate for student migration',
        description_bn: 'ছাত্র স্থানান্তরের জন্য অফিসিয়াল স্থানান্তর সনদপত্র',
        template: {
          fields: ['studentName', 'studentId', 'class', 'dateOfLeaving', 'reason', 'conduct'],
          layout: 'transfer_certificate_layout'
        },
        is_active: true,
        credit_cost: 5,
        popularity_score: 71
      },
      {
        name: 'Bonafide Certificate',
        name_bn: 'বোনাফাইড সনদপত্র',
        category: 'administrative',
        type: 'bonafide_certificate',
        description: 'Student bonafide certificate for official purposes',
        description_bn: 'অফিসিয়াল কাজের জন্য ছাত্র বোনাফাইড সনদপত্র',
        template: {
          fields: ['studentName', 'studentId', 'class', 'session', 'purpose'],
          layout: 'bonafide_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 77
      },
      {
        name: 'Fee Receipt',
        name_bn: 'ফি রসিদ',
        category: 'financial',
        type: 'fee_receipt',
        description: 'Official fee payment receipt with breakdown',
        description_bn: 'বিস্তারিত বিবরণসহ অফিসিয়াল ফি পেমেন্ট রসিদ',
        template: {
          fields: ['studentName', 'studentId', 'amount', 'feeType', 'month', 'receiptNo'],
          layout: 'receipt_layout'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 89
      },
      {
        name: 'Leave Application',
        name_bn: 'ছুটির আবেদন',
        category: 'administrative',
        type: 'leave_application',
        description: 'Student leave application form',
        description_bn: 'ছাত্রের ছুটির আবেদন ফর্ম',
        template: {
          fields: ['studentName', 'class', 'fromDate', 'toDate', 'reason', 'parentSignature'],
          layout: 'application_layout'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 65
      },

      // Library Documents
      {
        name: 'Library Card',
        name_bn: 'লাইব্রেরি কার্ড',
        category: 'library',
        type: 'library_card',
        description: 'Student library membership card',
        description_bn: 'ছাত্র লাইব্রেরি সদস্যপদ কার্ড',
        template: {
          fields: ['memberName', 'memberId', 'class', 'validity', 'photo'],
          layout: 'library_card_layout'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 58
      },
      {
        name: 'Book Issue Receipt',
        name_bn: 'বই ইস্যু রসিদ',
        category: 'library',
        type: 'book_receipt',
        description: 'Library book issue and return receipt',
        description_bn: 'লাইব্রেরি বই ইস্যু এবং ফেরত রসিদ',
        template: {
          fields: ['memberName', 'bookTitle', 'author', 'issueDate', 'returnDate'],
          layout: 'book_receipt_layout'
        },
        is_active: true,
        credit_cost: 1,
        popularity_score: 52
      },

      // Event Documents
      {
        name: 'Event Invitation',
        name_bn: 'অনুষ্ঠানের আমন্ত্রণ',
        category: 'event',
        type: 'invitation',
        description: 'Official school event invitation card',
        description_bn: 'অফিসিয়াল স্কুল অনুষ্ঠানের আমন্ত্রণ কার্ড',
        template: {
          fields: ['eventName', 'date', 'time', 'venue', 'organizer', 'dresscode'],
          layout: 'invitation_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 62
      },
      {
        name: 'Competition Certificate',
        name_bn: 'প্রতিযোগিতার সনদপত্র',
        category: 'certificate',
        type: 'competition_certificate',
        description: 'Certificate for academic and cultural competitions',
        description_bn: 'একাডেমিক এবং সাংস্কৃতিক প্রতিযোগিতার জন্য সনদপত্র',
        template: {
          fields: ['participantName', 'competition', 'position', 'date', 'category'],
          layout: 'competition_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 69
      },

      // Medical Documents
      {
        name: 'Medical Certificate',
        name_bn: 'চিকিৎসা সনদপত্র',
        category: 'medical',
        type: 'medical_certificate',
        description: 'Student medical fitness certificate',
        description_bn: 'ছাত্রের চিকিৎসা ফিটনেস সনদপত্র',
        template: {
          fields: ['studentName', 'age', 'medicalStatus', 'doctorName', 'date'],
          layout: 'medical_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 56
      },
      {
        name: 'Health Card',
        name_bn: 'স্বাস্থ্য কার্ড',
        category: 'medical',
        type: 'health_card',
        description: 'Student health information card',
        description_bn: 'ছাত্রের স্বাস্থ্য তথ্য কার্ড',
        template: {
          fields: ['studentName', 'bloodGroup', 'allergies', 'emergencyContact', 'medicalHistory'],
          layout: 'health_card_layout'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 54
      },

      // Transport Documents
      {
        name: 'Bus Pass',
        name_bn: 'বাস পাস',
        category: 'transport',
        type: 'bus_pass',
        description: 'School bus transportation pass',
        description_bn: 'স্কুল বাস পরিবহন পাস',
        template: {
          fields: ['studentName', 'route', 'stoppage', 'validity', 'photo'],
          layout: 'bus_pass_layout'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 61
      },

      // Examination Documents
      {
        name: 'Mark Sheet',
        name_bn: 'নম্বরপত্র',
        category: 'examination',
        type: 'mark_sheet',
        description: 'Official examination mark sheet with grades',
        description_bn: 'গ্রেডসহ অফিসিয়াল পরীক্ষার নম্বরপত্র',
        template: {
          fields: ['studentName', 'rollNumber', 'exam', 'subjects', 'marks', 'grade'],
          layout: 'mark_sheet_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 84
      },
      {
        name: 'Exam Schedule',
        name_bn: 'পরীক্ষার সময়সূচি',
        category: 'examination',
        type: 'exam_schedule',
        description: 'Detailed examination timetable and schedule',
        description_bn: 'বিস্তারিত পরীক্ষার সময়সূচি এবং কর্মসূচি',
        template: {
          fields: ['examName', 'class', 'subjects', 'dates', 'times', 'duration'],
          layout: 'schedule_layout'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 73
      },

      // Staff Documents
      {
        name: 'Teacher ID Card',
        name_bn: 'শিক্ষক পরিচয়পত্র',
        category: 'staff',
        type: 'teacher_id',
        description: 'Official teacher identification card',
        description_bn: 'অফিসিয়াল শিক্ষক পরিচয়পত্র',
        template: {
          fields: ['teacherName', 'employeeId', 'designation', 'department', 'photo'],
          layout: 'teacher_id_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 67
      },
      {
        name: 'Staff Certificate',
        name_bn: 'কর্মচারী সনদপত্র',
        category: 'staff',
        type: 'staff_certificate',
        description: 'Employment certificate for teaching staff',
        description_bn: 'শিক্ষক কর্মচারীদের জন্য চাকরির সনদপত্র',
        template: {
          fields: ['staffName', 'designation', 'joiningDate', 'department', 'salary'],
          layout: 'employment_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 59
      },

      // Additional Academic Documents
      {
        name: 'Attendance Certificate',
        name_bn: 'উপস্থিতি সনদপত্র',
        category: 'academic',
        type: 'attendance_certificate',
        description: 'Student attendance record certificate',
        description_bn: 'ছাত্রের উপস্থিতির রেকর্ড সনদপত্র',
        template: {
          fields: ['studentName', 'class', 'totalDays', 'presentDays', 'percentage'],
          layout: 'attendance_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 64
      },
      {
        name: 'Study Certificate',
        name_bn: 'অধ্যয়ন সনদপত্র',
        category: 'academic',
        type: 'study_certificate',
        description: 'Certificate of current studies and enrollment',
        description_bn: 'বর্তমান অধ্যয়ন এবং ভর্তির সনদপত্র',
        template: {
          fields: ['studentName', 'class', 'session', 'rollNumber', 'subjects'],
          layout: 'study_certificate_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 66
      },

      // Special Certificates
      {
        name: 'Good Conduct Certificate',
        name_bn: 'সুআচরণ সনদপত্র',
        category: 'administrative',
        type: 'conduct_certificate',
        description: 'Certificate for good behavior and conduct',
        description_bn: 'ভাল আচরণ এবং আচার-আচরণের জন্য সনদপত্র',
        template: {
          fields: ['studentName', 'class', 'period', 'conduct', 'remarks'],
          layout: 'conduct_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 63
      },
      {
        name: 'Migration Certificate',
        name_bn: 'মাইগ্রেশন সনদপত্র',
        category: 'administrative',
        type: 'migration_certificate',
        description: 'Official migration certificate for university admission',
        description_bn: 'বিশ্ববিদ্যালয় ভর্তির জন্য অফিসিয়াল মাইগ্রেশন সনদপত্র',
        template: {
          fields: ['studentName', 'rollNumber', 'examPassed', 'board', 'year'],
          layout: 'migration_layout'
        },
        is_active: true,
        credit_cost: 5,
        popularity_score: 70
      },

      // Financial Documents
      {
        name: 'Scholarship Certificate',
        name_bn: 'বৃত্তি সনদপত্র',
        category: 'financial',
        type: 'scholarship_certificate',
        description: 'Merit or need-based scholarship certificate',
        description_bn: 'মেধা বা প্রয়োজন ভিত্তিক বৃত্তি সনদপত্র',
        template: {
          fields: ['recipientName', 'scholarshipType', 'amount', 'duration', 'criteria'],
          layout: 'scholarship_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 75
      },
      {
        name: 'Fee Waiver Certificate',
        name_bn: 'ফি মওকুফ সনদপত্র',
        category: 'financial',
        type: 'fee_waiver',
        description: 'Fee concession or waiver certificate',
        description_bn: 'ফি ছাড় বা মওকুফ সনদপত্র',
        template: {
          fields: ['studentName', 'class', 'waiverAmount', 'reason', 'period'],
          layout: 'waiver_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 57
      },

      // Special Purpose Documents
      {
        name: 'Age Certificate',
        name_bn: 'বয়স সনদপত্র',
        category: 'administrative',
        type: 'age_certificate',
        description: 'Official age verification certificate',
        description_bn: 'অফিসিয়াল বয়স যাচাইকরণ সনদপত্র',
        template: {
          fields: ['studentName', 'dateOfBirth', 'age', 'fatherName', 'class'],
          layout: 'age_certificate_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 55
      },
      {
        name: 'Name Change Certificate',
        name_bn: 'নাম পরিবর্তন সনদপত্র',
        category: 'administrative',
        type: 'name_change',
        description: 'Official name correction or change certificate',
        description_bn: 'অফিসিয়াল নাম সংশোধন বা পরিবর্তন সনদপত্র',
        template: {
          fields: ['oldName', 'newName', 'reason', 'documents', 'authority'],
          layout: 'name_change_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 48
      },

      // Digital Learning Documents
      {
        name: 'Online Course Certificate',
        name_bn: 'অনলাইন কোর্স সনদপত্র',
        category: 'digital',
        type: 'online_certificate',
        description: 'Certificate for completed online courses',
        description_bn: 'সম্পন্ন অনলাইন কোর্সের জন্য সনদপত্র',
        template: {
          fields: ['participantName', 'courseName', 'duration', 'platform', 'completionDate'],
          layout: 'online_course_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 51
      },
      {
        name: 'Digital Portfolio',
        name_bn: 'ডিজিটাল পোর্টফোলিও',
        category: 'digital',
        type: 'portfolio',
        description: 'Student digital achievement portfolio',
        description_bn: 'ছাত্রের ডিজিটাল অর্জন পোর্টফোলিও',
        template: {
          fields: ['studentName', 'achievements', 'projects', 'skills', 'certificates'],
          layout: 'portfolio_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 53
      },

      // Parent-Related Documents
      {
        name: 'Parent Meeting Notice',
        name_bn: 'অভিভাবক সভার নোটিশ',
        category: 'communication',
        type: 'meeting_notice',
        description: 'Notice for parent-teacher meeting',
        description_bn: 'অভিভাবক-শিক্ষক সভার জন্য নোটিশ',
        template: {
          fields: ['meetingDate', 'time', 'agenda', 'venue', 'contact'],
          layout: 'notice_layout'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 60
      },
      {
        name: 'Progress Report Card',
        name_bn: 'অগ্রগতি রিপোর্ট কার্ড',
        category: 'academic',
        type: 'report_card',
        description: 'Comprehensive student progress report card',
        description_bn: 'বিস্তৃত ছাত্র অগ্রগতি রিপোর্ট কার্ড',
        template: {
          fields: ['studentName', 'subjects', 'grades', 'attendance', 'behavior', 'recommendations'],
          layout: 'report_card_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 81
      },

      // Extra-Curricular Documents
      {
        name: 'Club Membership Certificate',
        name_bn: 'ক্লাব সদস্যপদ সনদপত্র',
        category: 'extracurricular',
        type: 'club_membership',
        description: 'School club or society membership certificate',
        description_bn: 'স্কুল ক্লাব বা সোসাইটি সদস্যপদ সনদপত্র',
        template: {
          fields: ['memberName', 'clubName', 'position', 'joiningDate', 'activities'],
          layout: 'membership_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 58
      },
      {
        name: 'Leadership Certificate',
        name_bn: 'নেতৃত্ব সনদপত্র',
        category: 'extracurricular',
        type: 'leadership_certificate',
        description: 'Certificate for student leadership roles',
        description_bn: 'ছাত্র নেতৃত্বের ভূমিকার জন্য সনদপত্র',
        template: {
          fields: ['leaderName', 'position', 'responsibilities', 'tenure', 'achievements'],
          layout: 'leadership_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 65
      },

      // Safety and Security Documents
      {
        name: 'Safety Training Certificate',
        name_bn: 'নিরাপত্তা প্রশিক্ষণ সনদপত্র',
        category: 'safety',
        type: 'safety_certificate',
        description: 'Certificate for safety training completion',
        description_bn: 'নিরাপত্তা প্রশিক্ষণ সম্পন্নের জন্য সনদপত্র',
        template: {
          fields: ['participantName', 'trainingType', 'duration', 'instructor', 'date'],
          layout: 'safety_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 49
      },
      {
        name: 'Emergency Contact Card',
        name_bn: 'জরুরি যোগাযোগ কার্ড',
        category: 'safety',
        type: 'emergency_card',
        description: 'Student emergency contact information card',
        description_bn: 'ছাত্রের জরুরি যোগাযোগের তথ্য কার্ড',
        template: {
          fields: ['studentName', 'parentContact', 'medicalInfo', 'emergencyContacts', 'allergies'],
          layout: 'emergency_layout'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 62
      },

      // Technology Documents
      {
        name: 'Computer Lab Certificate',
        name_bn: 'কম্পিউটার ল্যাব সনদপত্র',
        category: 'technology',
        type: 'computer_certificate',
        description: 'Certificate for computer skills and lab usage',
        description_bn: 'কম্পিউটার দক্ষতা এবং ল্যাব ব্যবহারের জন্য সনদপত্র',
        template: {
          fields: ['studentName', 'skills', 'projects', 'duration', 'instructor'],
          layout: 'computer_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 56
      },
      {
        name: 'Science Fair Certificate',
        name_bn: 'বিজ্ঞান মেলা সনদপত্র',
        category: 'academic',
        type: 'science_fair',
        description: 'Certificate for science fair participation and awards',
        description_bn: 'বিজ্ঞান মেলায় অংশগ্রহণ এবং পুরস্কারের জন্য সনদপত্র',
        template: {
          fields: ['participantName', 'projectTitle', 'category', 'award', 'date'],
          layout: 'science_fair_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 61
      },

      // Cultural Documents
      {
        name: 'Cultural Performance Certificate',
        name_bn: 'সাংস্কৃতিক অনুষ্ঠান সনদপত্র',
        category: 'cultural',
        type: 'cultural_certificate',
        description: 'Certificate for cultural activities and performances',
        description_bn: 'সাংস্কৃতিক কার্যকলাপ এবং পারফরম্যান্সের জন্য সনদপত্র',
        template: {
          fields: ['performerName', 'performance', 'event', 'date', 'recognition'],
          layout: 'cultural_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 59
      },
      {
        name: 'Art Competition Certificate',
        name_bn: 'শিল্প প্রতিযোগিতা সনদপত্র',
        category: 'cultural',
        type: 'art_certificate',
        description: 'Certificate for art and craft competitions',
        description_bn: 'শিল্প ও কারুশিল্প প্রতিযোগিতার জন্য সনদপত্র',
        template: {
          fields: ['artistName', 'artType', 'competition', 'position', 'judge'],
          layout: 'art_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 54
      },

      // Community Service Documents
      {
        name: 'Community Service Certificate',
        name_bn: 'কমিউনিটি সেবা সনদপত্র',
        category: 'service',
        type: 'community_service',
        description: 'Certificate for community service and volunteer work',
        description_bn: 'কমিউনিটি সেবা এবং স্বেচ্ছাসেবক কাজের জন্য সনদপত্র',
        template: {
          fields: ['volunteerName', 'serviceType', 'hours', 'organization', 'supervisor'],
          layout: 'service_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 52
      },
      {
        name: 'Environmental Award Certificate',
        name_bn: 'পরিবেশগত পুরস্কার সনদপত্র',
        category: 'service',
        type: 'environmental_certificate',
        description: 'Certificate for environmental conservation activities',
        description_bn: 'পরিবেশ সংরক্ষণ কার্যক্রমের জন্য সনদপত্র',
        template: {
          fields: ['recipientName', 'activity', 'impact', 'duration', 'recognition'],
          layout: 'environmental_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 50
      },

      // Research Documents
      {
        name: 'Research Project Certificate',
        name_bn: 'গবেষণা প্রকল্প সনদপত্র',
        category: 'research',
        type: 'research_certificate',
        description: 'Certificate for student research projects',
        description_bn: 'ছাত্র গবেষণা প্রকল্পের জন্য সনদপত্র',
        template: {
          fields: ['researcherName', 'projectTitle', 'guide', 'duration', 'findings'],
          layout: 'research_layout'
        },
        is_active: true,
        credit_cost: 5,
        popularity_score: 47
      },
      {
        name: 'Innovation Certificate',
        name_bn: 'উদ্ভাবন সনদপত্র',
        category: 'research',
        type: 'innovation_certificate',
        description: 'Certificate for innovative ideas and inventions',
        description_bn: 'উদ্ভাবনী ধারণা এবং আবিষ্কারের জন্য সনদপত্র',
        template: {
          fields: ['innovatorName', 'innovation', 'application', 'mentor', 'date'],
          layout: 'innovation_layout'
        },
        is_active: true,
        credit_cost: 5,
        popularity_score: 46
      },

      // International Documents
      {
        name: 'Exchange Program Certificate',
        name_bn: 'এক্সচেঞ্জ প্রোগ্রাম সনদপত্র',
        category: 'international',
        type: 'exchange_certificate',
        description: 'Certificate for international exchange programs',
        description_bn: 'আন্তর্জাতিক এক্সচেঞ্জ প্রোগ্রামের জন্য সনদপত্র',
        template: {
          fields: ['participantName', 'program', 'country', 'duration', 'institution'],
          layout: 'exchange_layout'
        },
        is_active: true,
        credit_cost: 6,
        popularity_score: 44
      },
      {
        name: 'Language Proficiency Certificate',
        name_bn: 'ভাষা দক্ষতা সনদপত্র',
        category: 'academic',
        type: 'language_certificate',
        description: 'Certificate for language learning and proficiency',
        description_bn: 'ভাষা শেখা এবং দক্ষতার জন্য সনদপত্র',
        template: {
          fields: ['studentName', 'language', 'level', 'examBoard', 'score'],
          layout: 'language_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 58
      },

      // Special Recognition Documents
      {
        name: 'Outstanding Student Award',
        name_bn: 'অসাধারণ ছাত্র পুরস্কার',
        category: 'recognition',
        type: 'outstanding_award',
        description: 'Award for exceptional overall performance',
        description_bn: 'ব্যতিক্রমী সামগ্রিক পারফরম্যান্সের জন্য পুরস্কার',
        template: {
          fields: ['awardee', 'criteria', 'achievements', 'year', 'authority'],
          layout: 'award_layout'
        },
        is_active: true,
        credit_cost: 5,
        popularity_score: 78
      },
      {
        name: 'Perfect Attendance Award',
        name_bn: 'নিখুঁত উপস্থিতি পুরস্কার',
        category: 'recognition',
        type: 'attendance_award',
        description: 'Award for perfect attendance record',
        description_bn: 'নিখুঁত উপস্থিতির রেকর্ডের জন্য পুরস্কার',
        template: {
          fields: ['studentName', 'period', 'totalDays', 'achievement', 'recognition'],
          layout: 'attendance_award_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 67
      },

      // Graduation Documents
      {
        name: 'Graduation Certificate',
        name_bn: 'স্নাতক সনদপত্র',
        category: 'graduation',
        type: 'graduation_certificate',
        description: 'Official graduation completion certificate',
        description_bn: 'অফিসিয়াল স্নাতক সমাপনী সনদপত্র',
        template: {
          fields: ['graduateName', 'degree', 'major', 'gpa', 'graduationDate'],
          layout: 'graduation_layout'
        },
        is_active: true,
        credit_cost: 6,
        popularity_score: 85
      },
      {
        name: 'Alumni Certificate',
        name_bn: 'প্রাক্তন ছাত্র সনদপত্র',
        category: 'alumni',
        type: 'alumni_certificate',
        description: 'Certificate for school alumni recognition',
        description_bn: 'স্কুল প্রাক্তন ছাত্র স্বীকৃতির জন্য সনদপত্র',
        template: {
          fields: ['alumniName', 'graduationYear', 'achievements', 'contribution', 'recognition'],
          layout: 'alumni_layout'
        },
        is_active: true,
        credit_cost: 4,
        popularity_score: 43
      }
    ];

    console.log(`📄 Inserting ${documentTemplates.length} document templates...`);

    // Insert templates in batches to avoid API limits
    const batchSize = 10;
    let insertedCount = 0;

    for (let i = 0; i < documentTemplates.length; i += batchSize) {
      const batch = documentTemplates.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('document_templates')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError.message);
      } else {
        insertedCount += batch.length;
        console.log(`✓ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} templates`);
      }
    }

    console.log(`🎉 Successfully created and populated document_templates table with ${insertedCount} templates!`);

    // Verify the final count
    const { count } = await supabase
      .from('document_templates')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total templates in database: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createDocumentTemplatesTable().catch(console.error);