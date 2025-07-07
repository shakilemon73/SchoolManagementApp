import pkg from 'pg';
const { Pool } = pkg;

async function addSampleData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Adding sample data to school management system...');

    // Add sample schools
    const schools = await pool.query(`
      INSERT INTO schools (name, address, phone, email, website, type) VALUES
      ('Dhaka Model High School', '123 Main Road, Dhanmondi, Dhaka-1205', '+880-2-9662345', 'info@dhakamodel.edu.bd', 'www.dhakamodel.edu.bd', 'High School'),
      ('Green Valley College', '45 Green Road, Farmgate, Dhaka-1215', '+880-2-8125678', 'admin@greenvalley.edu.bd', 'www.greenvalley.edu.bd', 'College'),
      ('Sunflower Kindergarten', '78 Gulshan Avenue, Gulshan-2, Dhaka-1212', '+880-2-9875432', 'contact@sunflower.edu.bd', 'www.sunflower.edu.bd', 'Kindergarten')
      RETURNING id, name;
    `);
    console.log('✓ Added schools:', schools.rows);

    // Add sample teachers
    const teachers = await pool.query(`
      INSERT INTO teachers (teacher_id, name, qualification, subject, gender, phone, email, school_id, status) VALUES
      ('T001', 'Prof. Ahmed Rahman', 'M.Sc in Mathematics', 'Mathematics', 'Male', '+880-1712345678', 'ahmed.rahman@dhakamodel.edu.bd', 1, 'active'),
      ('T002', 'Ms. Fatima Khatun', 'M.A in English Literature', 'English', 'Female', '+880-1798765432', 'fatima.khatun@dhakamodel.edu.bd', 1, 'active'),
      ('T003', 'Dr. Mohammad Hasan', 'Ph.D in Physics', 'Physics', 'Male', '+880-1756789123', 'mohammad.hasan@greenvalley.edu.bd', 2, 'active'),
      ('T004', 'Ms. Rashida Begum', 'B.Ed in Primary Education', 'General', 'Female', '+880-1634567890', 'rashida.begum@sunflower.edu.bd', 3, 'active')
      RETURNING id, name, subject;
    `);
    console.log('✓ Added teachers:', teachers.rows);

    // Add sample classes
    const classes = await pool.query(`
      INSERT INTO classes (name, section, school_id, class_teacher_id) VALUES
      ('Class 8', 'A', 1, 1),
      ('Class 9', 'B', 1, 2),
      ('Class 11', 'Science', 2, 3),
      ('Nursery', 'Morning', 3, 4)
      RETURNING id, name, section;
    `);
    console.log('✓ Added classes:', classes.rows);

    // Add sample students
    const students = await pool.query(`
      INSERT INTO students (student_id, name, name_in_bangla, father_name, mother_name, date_of_birth, gender, blood_group, phone, class, section, school_id, status) VALUES
      ('S001', 'Aminul Islam', 'আমিনুল ইসলাম', 'Abdul Karim', 'Rashida Khatun', '2008-03-15', 'Male', 'B+', '+880-1612345678', 'Class 8', 'A', 1, 'active'),
      ('S002', 'Fatema Sultana', 'ফাতেমা সুলতানা', 'Mohammad Ali', 'Nasreen Begum', '2007-07-22', 'Female', 'A-', '+880-1687654321', 'Class 9', 'B', 1, 'active'),
      ('S003', 'Rafiul Haque', 'রফিউল হক', 'Shahidul Islam', 'Salma Khatun', '2006-11-08', 'Male', 'O+', '+880-1723456789', 'Class 11', 'Science', 2, 'active'),
      ('S004', 'Aisha Rahman', 'আয়শা রহমান', 'Abdur Rahman', 'Mahmuda Akter', '2020-05-12', 'Female', 'AB+', '+880-1765432109', 'Nursery', 'Morning', 3, 'active')
      RETURNING id, name, class, section;
    `);
    console.log('✓ Added students:', students.rows);

    // Add sample credit packages
    const creditPackages = await pool.query(`
      INSERT INTO credit_packages (name, credits, price, description, is_active) VALUES
      ('Basic Package', 100, 500.00, 'Perfect for small schools with basic document generation needs', true),
      ('Standard Package', 500, 2000.00, 'Great for medium-sized schools with regular document requirements', true),
      ('Premium Package', 1000, 3500.00, 'Ideal for large schools with extensive document generation needs', true),
      ('Enterprise Package', 5000, 15000.00, 'Comprehensive solution for educational institutions with high volume requirements', true)
      RETURNING id, name, credits, price;
    `);
    console.log('✓ Added credit packages:', creditPackages.rows);

    // Add sample fee receipts
    const feeReceipts = await pool.query(`
      INSERT INTO fee_receipts (receipt_no, student_id, payment_date, month, payment_method, total_amount, school_id) VALUES
      ('FEE-2025-001', 1, '2025-01-15', 'January 2025', 'Bank Transfer', 2500.00, 1),
      ('FEE-2025-002', 2, '2025-01-20', 'January 2025', 'Cash', 3000.00, 1),
      ('FEE-2025-003', 3, '2025-01-25', 'January 2025', 'bKash', 4500.00, 2),
      ('FEE-2025-004', 4, '2025-02-01', 'February 2025', 'Cash', 1500.00, 3)
      RETURNING id, receipt_no, total_amount;
    `);
    console.log('✓ Added fee receipts:', feeReceipts.rows);

    // Add fee items for receipts
    await pool.query(`
      INSERT INTO fee_items (receipt_id, type, amount, description) VALUES
      (1, 'Tuition Fee', 2000.00, 'Monthly tuition fee for Class 8'),
      (1, 'Exam Fee', 500.00, 'Mid-term examination fee'),
      (2, 'Tuition Fee', 2500.00, 'Monthly tuition fee for Class 9'),
      (2, 'Library Fee', 500.00, 'Library usage fee'),
      (3, 'Tuition Fee', 4000.00, 'Monthly tuition fee for Class 11 Science'),
      (3, 'Lab Fee', 500.00, 'Science laboratory fee'),
      (4, 'Tuition Fee', 1200.00, 'Monthly tuition fee for Nursery'),
      (4, 'Activity Fee', 300.00, 'Co-curricular activities fee');
    `);

    // Add sample books
    const books = await pool.query(`
      INSERT INTO books (title, author, isbn, publisher, category, copies, available_copies, location, school_id) VALUES
      ('Bangladesh and Global Studies - Class 8', 'NCTB', '978-984-33-1234-5', 'National Curriculum and Textbook Board', 'Textbook', 50, 45, 'Section A-1', 1),
      ('English Grammar and Composition', 'P.C. Das', '978-984-33-5678-9', 'Friends Book Corner', 'Reference', 25, 20, 'Section B-2', 1),
      ('Physics - Class 11', 'Dr. Mohammad Ali', '978-984-33-9012-3', 'Ideal Publication', 'Textbook', 40, 35, 'Section C-1', 2),
      ('Bangla Sahitya Sankalan', 'Various Authors', '978-984-33-3456-7', 'Sahitya Prakash', 'Literature', 30, 25, 'Section D-1', 2)
      RETURNING id, title, available_copies;
    `);
    console.log('✓ Added books:', books.rows);

    // Add sample attendance records
    await pool.query(`
      INSERT INTO attendance (student_id, class_id, date, status, school_id, updated_by) VALUES
      (1, 1, '2025-06-01', 'present', 1, 1),
      (2, 2, '2025-06-01', 'present', 1, 1),
      (3, 3, '2025-06-01', 'late', 2, 1),
      (4, 4, '2025-06-01', 'present', 3, 1),
      (1, 1, '2025-06-02', 'present', 1, 1),
      (2, 2, '2025-06-02', 'absent', 1, 1),
      (3, 3, '2025-06-02', 'present', 2, 1),
      (4, 4, '2025-06-02', 'present', 3, 1);
    `);

    // Add sample academic year
    await pool.query(`
      INSERT INTO academic_years (name, start_date, end_date, is_current, school_id) VALUES
      ('Academic Year 2025', '2025-01-01', '2025-12-31', true, 1),
      ('Academic Year 2025', '2025-01-01', '2025-12-31', true, 2),
      ('Academic Year 2025', '2025-01-01', '2025-12-31', true, 3);
    `);

    console.log('\n🎉 Sample data added successfully!');
    console.log('\nYour school management system now has:');
    console.log('- 3 schools (High School, College, Kindergarten)');
    console.log('- 4 teachers across different subjects');
    console.log('- 4 classes with different sections');
    console.log('- 4 students from different grades');
    console.log('- 4 credit packages for different needs');
    console.log('- 4 fee receipts with detailed fee items');
    console.log('- 4 library books');
    console.log('- Attendance records for testing');
    console.log('- Academic year setup');

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await pool.end();
  }
}

addSampleData();