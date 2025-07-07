import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import bcrypt from 'bcryptjs';

config();

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  ssl: 'require',
  max: 1,
});

const db = drizzle(client, { schema });

async function seedDatabase() {
  console.log('🌱 Seeding Supabase database with sample data...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUsers = await db.insert(schema.users).values([
      {
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@school.com',
        passwordHash: hashedPassword,
        role: 'admin',
        isAdmin: true,
        credits: 1000,
        phoneNumber: '+8801234567890'
      },
      {
        username: 'teacher1',
        name: 'John Rahman',
        email: 'john@school.com',
        passwordHash: hashedPassword,
        role: 'teacher',
        credits: 100,
        phoneNumber: '+8801234567891'
      },
      {
        username: 'student1',
        name: 'Sarah Ahmed',
        email: 'sarah@school.com',
        passwordHash: hashedPassword,
        role: 'student',
        credits: 50,
        phoneNumber: '+8801234567892'
      }
    ]).returning();
    console.log('✓ Users created successfully');

    // Create school
    const schools = await db.insert(schema.schools).values([
      {
        name: 'Dhaka Model High School',
        address: '123 Dhanmondi, Dhaka-1205',
        phone: '+8802123456789',
        email: 'info@dhakamodel.edu.bd',
        website: 'www.dhakamodel.edu.bd',
        principalName: 'Dr. Rahman Ahmed',
        establishedYear: 1985
      }
    ]).returning();
    console.log('✓ School created successfully');

    // Create students
    const students = await db.insert(schema.students).values([
      {
        name: 'Ahmed Hassan',
        nameInBangla: 'আহমেদ হাসান',
        studentId: 'STU001',
        class: 'Class 10',
        section: 'A',
        rollNumber: '101',
        gender: 'Male',
        bloodGroup: 'B+',
        fatherName: 'Mohammad Hassan',
        fatherNameInBangla: 'মোহাম্মদ হাসান',
        motherName: 'Fatima Hassan',
        motherNameInBangla: 'ফাতিমা হাসান',
        address: 'Gulshan, Dhaka',
        email: 'ahmed@student.com',
        phone: '+8801987654321',
        status: 'Active',
        schoolId: 1
      },
      {
        name: 'Fatima Khan',
        nameInBangla: 'ফাতিমা খান',
        studentId: 'STU002',
        class: 'Class 10',
        section: 'A',
        rollNumber: '102',
        gender: 'Female',
        bloodGroup: 'A+',
        fatherName: 'Abdul Khan',
        fatherNameInBangla: 'আব্দুল খান',
        motherName: 'Rashida Khan',
        motherNameInBangla: 'রশিদা খান',
        address: 'Banani, Dhaka',
        email: 'fatima@student.com',
        phone: '+8801987654322',
        status: 'Active',
        schoolId: 1
      },
      {
        name: 'Rahul Islam',
        nameInBangla: 'রাহুল ইসলাম',
        studentId: 'STU003',
        class: 'Class 9',
        section: 'B',
        rollNumber: '201',
        gender: 'Male',
        bloodGroup: 'O+',
        fatherName: 'Karim Islam',
        fatherNameInBangla: 'করিম ইসলাম',
        motherName: 'Salma Islam',
        motherNameInBangla: 'সালমা ইসলাম',
        address: 'Uttara, Dhaka',
        email: 'rahul@student.com',
        phone: '+8801987654323',
        status: 'Active',
        schoolId: 1
      }
    ]).returning();
    console.log('✓ Students created successfully');

    // Create library books
    const books = await db.insert(schema.libraryBooks).values([
      {
        title: 'Bangla Grammar',
        titleBn: 'বাংলা ব্যাকরণ',
        author: 'Dr. Muhammad Shahidullah',
        isbn: '978-984-123-456-7',
        category: 'Language',
        publisher: 'Bangla Academy',
        publishYear: 2020,
        totalCopies: 50,
        availableCopies: 45,
        location: 'A-101',
        description: 'Comprehensive Bangla grammar textbook',
        schoolId: 1
      },
      {
        title: 'Mathematics for Class X',
        titleBn: 'দশম শ্রেণীর গণিত',
        author: 'Prof. Abdul Jabbar',
        isbn: '978-984-123-456-8',
        category: 'Mathematics',
        publisher: 'Textbook Board',
        publishYear: 2021,
        totalCopies: 60,
        availableCopies: 55,
        location: 'B-201',
        description: 'Standard mathematics textbook for class 10',
        schoolId: 1
      },
      {
        title: 'Physics Fundamentals',
        titleBn: 'পদার্থবিজ্ঞানের মূলনীতি',
        author: 'Dr. Rashid Ahmed',
        isbn: '978-984-123-456-9',
        category: 'Science',
        publisher: 'Science Publications',
        publishYear: 2022,
        totalCopies: 40,
        availableCopies: 38,
        location: 'C-301',
        description: 'Introduction to physics concepts',
        schoolId: 1
      },
      {
        title: 'History of Bangladesh',
        titleBn: 'বাংলাদেশের ইতিহাস',
        author: 'Prof. Sirajul Islam',
        isbn: '978-984-123-457-0',
        category: 'History',
        publisher: 'University Press',
        publishYear: 2021,
        totalCopies: 35,
        availableCopies: 32,
        location: 'D-401',
        description: 'Comprehensive history of Bangladesh',
        schoolId: 1
      }
    ]).returning();
    console.log('✓ Library books created successfully');

    // Create document templates
    const templates = await db.insert(schema.documentTemplates).values([
      {
        type: 'certificate',
        name: 'Student Certificate',
        category: 'Academic',
        description: 'General student certificate template',
        nameBn: 'ছাত্র সার্টিফিকেট',
        descriptionBn: 'সাধারণ ছাত্র সার্টিফিকেট টেমপ্লেট',
        fields: JSON.stringify(['student_name', 'class', 'session', 'result']),
        templateData: JSON.stringify({
          header: 'Student Certificate',
          body: 'This certifies that {student_name} of class {class} has successfully completed the {session} session.',
          footer: 'Principal Signature'
        }),
        isActive: true,
        creditsRequired: 2,
        popularity: 85,
        usageCount: 125
      },
      {
        type: 'admit_card',
        name: 'Exam Admit Card',
        category: 'Examination',
        description: 'Standard exam admit card',
        nameBn: 'পরীক্ষার প্রবেশপত্র',
        descriptionBn: 'স্ট্যান্ডার্ড পরীক্ষার প্রবেশপত্র',
        fields: JSON.stringify(['student_name', 'roll_number', 'exam_name', 'date']),
        templateData: JSON.stringify({
          header: 'Examination Admit Card',
          body: 'Roll: {roll_number}, Name: {student_name}, Exam: {exam_name}, Date: {date}',
          footer: 'Controller of Examinations'
        }),
        isActive: true,
        creditsRequired: 1,
        popularity: 92,
        usageCount: 350
      },
      {
        type: 'id_card',
        name: 'Student ID Card',
        category: 'Identity',
        description: 'Student identification card',
        nameBn: 'ছাত্র পরিচয়পত্র',
        descriptionBn: 'ছাত্র পরিচয়পত্র',
        fields: JSON.stringify(['student_name', 'student_id', 'class', 'photo']),
        templateData: JSON.stringify({
          header: 'Student ID Card',
          body: 'ID: {student_id}, Name: {student_name}, Class: {class}',
          footer: 'Valid for current academic year'
        }),
        isActive: true,
        creditsRequired: 3,
        popularity: 78,
        usageCount: 89
      },
      {
        type: 'transcript',
        name: 'Academic Transcript',
        category: 'Academic',
        description: 'Official academic transcript',
        nameBn: 'একাডেমিক ট্রান্সক্রিপ্ট',
        descriptionBn: 'অফিসিয়াল একাডেমিক ট্রান্সক্রিপ্ট',
        fields: JSON.stringify(['student_name', 'subjects', 'grades', 'cgpa']),
        templateData: JSON.stringify({
          header: 'Official Academic Transcript',
          body: 'Student: {student_name}, CGPA: {cgpa}, Subjects: {subjects}',
          footer: 'Registrar Office'
        }),
        isActive: true,
        creditsRequired: 5,
        popularity: 65,
        usageCount: 45
      }
    ]).returning();
    console.log('✓ Document templates created successfully');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`Created: ${adminUsers.length} users, ${schools.length} school, ${students.length} students, ${books.length} books, ${templates.length} templates`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeding
seedDatabase().catch(console.error);