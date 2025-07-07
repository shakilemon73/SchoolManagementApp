import postgres from 'postgres';

const databaseUrl = "postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const client = postgres(databaseUrl, {
  prepare: false,
  fetch_types: false,
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
  debug: false,
  onnotice: () => {},
  onparameter: () => {},
  transform: { undefined: null }
});

async function addSampleData() {
  try {
    console.log('Adding sample data to existing Supabase tables...');

    // Check existing schools and add if needed
    const existingSchools = await client`SELECT COUNT(*) as count FROM schools`;
    if (existingSchools[0].count == 0) {
      await client`
        INSERT INTO schools (name, address, type)
        VALUES ('Demo High School', 'Dhaka, Bangladesh', 'public')
      `;
      console.log('✓ Sample school added');
    }

    // Check existing students and add if needed
    const existingStudents = await client`SELECT COUNT(*) as count FROM students`;
    if (existingStudents[0].count == 0) {
      await client`
        INSERT INTO students (name, student_id, class, section, roll_number, status)
        VALUES 
          ('Ahmed Rahman', 'STU-2024-001', 'Class 10', 'A', '001', 'active'),
          ('Fatima Khan', 'STU-2024-002', 'Class 10', 'A', '002', 'active'),
          ('Mohammad Ali', 'STU-2024-003', 'Class 9', 'B', '001', 'active')
        ON CONFLICT (student_id) DO NOTHING
      `;
      console.log('✓ Sample students added');
    }

    // Check existing document templates
    const existingTemplates = await client`SELECT COUNT(*) as count FROM document_templates`;
    if (existingTemplates[0].count == 0) {
      await client`
        INSERT INTO document_templates (name, name_bn, type, category, description, description_bn)
        VALUES 
          ('ID Card', 'পরিচয়পত্র', 'id_card', 'academic', 'Student identification card', 'ছাত্র পরিচয়পত্র'),
          ('Certificate', 'সার্টিফিকেট', 'certificate', 'academic', 'Academic certificate', 'একাডেমিক সার্টিফিকেট'),
          ('Admit Card', 'প্রবেশপত্র', 'admit_card', 'exam', 'Examination admit card', 'পরীক্ষার প্রবেশপত্র'),
          ('Mark Sheet', 'নম্বরপত্র', 'marksheet', 'exam', 'Student mark sheet', 'ছাত্রের নম্বরপত্র')
      `;
      console.log('✓ Sample document templates added');
    }

    // Check existing library books
    const existingBooks = await client`SELECT COUNT(*) as count FROM library_books`;
    if (existingBooks[0].count == 0) {
      await client`
        INSERT INTO library_books (title, title_bn, author, category, location, total_copies, available_copies)
        VALUES 
          ('Bangladesh History', 'বাংলাদেশের ইতিহাস', 'Dr. Rahman', 'History', 'Shelf A-1', 5, 4),
          ('Mathematics Guide', 'গণিত গাইড', 'Prof. Khan', 'Mathematics', 'Shelf B-2', 3, 3),
          ('English Grammar', 'ইংরেজি ব্যাকরণ', 'John Smith', 'Language', 'Shelf C-1', 8, 6)
      `;
      console.log('✓ Sample library books added');
    }

    // Check existing notifications
    const existingNotifications = await client`SELECT COUNT(*) as count FROM notifications`;
    if (existingNotifications[0].count == 0) {
      await client`
        INSERT INTO notifications (title, title_bn, message, message_bn, category, category_bn, is_public)
        VALUES 
          ('Welcome to School Management System', 'স্কুল ব্যবস্থাপনা সিস্টেমে স্বাগতম', 'Welcome to our digital school management platform', 'আমাদের ডিজিটাল স্কুল ব্যবস্থাপনা প্ল্যাটফর্মে স্বাগতম', 'System', 'সিস্টেম', true),
          ('New Academic Year Started', 'নতুন শিক্ষাবর্ষ শুরু', 'Academic year 2024-25 has begun', '২০২৪-২৫ শিক্ষাবর্ষ শুরু হয়েছে', 'Academic', 'একাডেমিক', true)
      `;
      console.log('✓ Sample notifications added');
    }

    // Check calendar events
    const existingEvents = await client`SELECT COUNT(*) as count FROM calendar_events`;
    if (existingEvents[0].count == 0) {
      await client`
        INSERT INTO calendar_events (title, title_bn, description, start_date, type, is_public)
        VALUES 
          ('Annual Sports Day', 'বার্ষিক ক্রীড়া দিবস', 'Annual sports competition for all students', '2024-12-15', 'event', true),
          ('Half Yearly Exam', 'অর্ধবার্ষিক পরীক্ষা', 'Half yearly examination for all classes', '2024-11-01', 'exam', true)
      `;
      console.log('✓ Sample calendar events added');
    }

    console.log('✅ Supabase sample data setup completed successfully');
    
    // Test key endpoints
    console.log('\n🔍 Testing key functionality...');
    
    const transactionCount = await client`SELECT COUNT(*) as count FROM financial_transactions`;
    console.log(`Financial transactions: ${transactionCount[0].count}`);
    
    const studentCount = await client`SELECT COUNT(*) as count FROM students`;
    console.log(`Students: ${studentCount[0].count}`);
    
    const bookCount = await client`SELECT COUNT(*) as count FROM library_books`;
    console.log(`Library books: ${bookCount[0].count}`);
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Data setup failed:', error);
    await client.end();
    process.exit(1);
  }
}

addSampleData();