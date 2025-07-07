import { db } from "./index";
import * as schema from "@shared/schema";
import { randomBytes } from "crypto";

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Check if default admin user exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin")
    });

    if (!existingAdmin) {
      console.log("Creating default admin user...");
      const salt = randomBytes(16).toString("hex");
      const defaultAdminPassword = `1234567890abcdef.${salt}`;
      
      await db.insert(schema.users).values({
        username: "admin",
        password: defaultAdminPassword,
        full_name: "System Administrator",
        role: "admin"
      });
    }

    // Create school if not exists
    const existingSchool = await db.query.schools.findFirst({
      where: (schools, { eq }) => eq(schools.name, "Unity School")
    });

    let schoolId = existingSchool?.id;

    if (!existingSchool) {
      console.log("Creating default school...");
      const [newSchool] = await db.insert(schema.schools).values({
        name: "Unity School",
        address: "123 Education St, Dhaka, Bangladesh",
        phone: "+8801712345678",
        email: "info@unityschool.edu.bd",
        website: "unityschool.edu.bd",
        logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
        type: "school"
      }).returning();
      
      schoolId = newSchool.id;
    }

    // Create sample students if they don't exist
    const existingStudent = await db.query.students.findFirst({
      where: (students, { eq }) => eq(students.studentId, "STD-2023-1214")
    });

    let studentId = existingStudent?.id;

    if (!existingStudent && schoolId) {
      console.log("Creating sample students...");
      const [newStudent] = await db.insert(schema.students).values({
        studentId: "STD-2023-1214",
        name: "Mohammad Rahman",
        fatherName: "Abdul Rahman",
        motherName: "Fatima Rahman",
        dateOfBirth: "2010-05-10",
        gender: "male",
        presentAddress: "45 Green Road, Dhaka",
        phone: "+8801812345678",
        class: "Class 5",
        section: "Section A",
        rollNumber: "14",
        schoolId: schoolId,
        status: "active"
      }).returning();
      
      studentId = newStudent.id;

      // Create more students
      await db.insert(schema.students).values([
        {
          studentId: "STD-2023-1215",
          name: "Fatima Akter",
          fatherName: "Kamal Hossain",
          motherName: "Nasreen Akter",
          dateOfBirth: "2010-07-15",
          gender: "female",
          presentAddress: "32 Lake Drive, Dhaka",
          phone: "+8801912345678",
          class: "Class 5",
          section: "Section A",
          rollNumber: "15",
          schoolId: schoolId,
          status: "active"
        },
        {
          studentId: "STD-2023-1216",
          name: "Ahmed Khan",
          fatherName: "Rafiq Khan",
          motherName: "Salma Khan",
          dateOfBirth: "2011-03-22",
          gender: "male",
          presentAddress: "78 Rose Avenue, Dhaka",
          phone: "+8801612345678",
          class: "Class 4",
          section: "Section B",
          rollNumber: "08",
          schoolId: schoolId,
          status: "active"
        }
      ]);
    }

    // Create sample teachers
    const existingTeacher = await db.query.teachers.findFirst({
      where: (teachers, { eq }) => eq(teachers.teacherId, "TCH-2023-001")
    });

    if (!existingTeacher && schoolId) {
      console.log("Creating sample teachers...");
      await db.insert(schema.teachers).values([
        {
          teacherId: "TCH-2023-001",
          name: "Nasreen Begum",
          qualification: "M.Sc in Mathematics",
          subject: "Mathematics",
          dateOfBirth: "1985-03-15",
          gender: "female",
          address: "123 Park Street, Dhaka",
          phone: "+8801712345600",
          email: "nasreen@unityschool.edu.bd",
          schoolId: schoolId,
          status: "active"
        },
        {
          teacherId: "TCH-2023-002",
          name: "Rahman Ali",
          qualification: "B.Sc in Physics",
          subject: "Science",
          dateOfBirth: "1988-05-20",
          gender: "male",
          address: "45 Lake Road, Dhaka",
          phone: "+8801812345600",
          email: "rahman@unityschool.edu.bd",
          schoolId: schoolId,
          status: "active"
        }
      ]);
    }

    // Create fee receipt templates if they don't exist
    const existingTemplate = await db.query.templates.findFirst({
      where: (templates, { eq }) => eq(templates.type, "fee-receipt")
    });

    if (!existingTemplate && schoolId) {
      console.log("Creating default templates...");
      await db.insert(schema.templates).values([
        {
          name: "Modern Blue",
          type: "fee-receipt",
          content: "<div class='bg-primary text-white text-center py-2 rounded-sm mb-2'><h3 class='text-xs font-bold'>UNITY SCHOOL</h3><p class='text-[8px]'>123 Education St, Dhaka, Bangladesh</p></div>",
          isDefault: true,
          schoolId: schoolId,
          metadata: JSON.stringify({
            style: "modernBlue",
            layout: "1"
          })
        },
        {
          name: "Classic Green",
          type: "fee-receipt",
          content: "<div class='flex items-center justify-between mb-2'><div><h3 class='text-xs font-bold text-success'>UNITY SCHOOL</h3><p class='text-[8px]'>123 Education St, Dhaka</p></div></div>",
          isDefault: false,
          schoolId: schoolId,
          metadata: JSON.stringify({
            style: "classicGreen",
            layout: "1"
          })
        },
        {
          name: "Traditional",
          type: "fee-receipt",
          content: "<div class='text-center mb-2'><h3 class='text-xs font-bold'>UNITY SCHOOL</h3><p class='text-[8px]'>123 Education St, Dhaka, Bangladesh</p></div>",
          isDefault: false,
          schoolId: schoolId,
          metadata: JSON.stringify({
            style: "traditional",
            layout: "1"
          })
        }
      ]);
    }

    // Create credit packages if they don't exist
    const existingCreditPackage = await db.query.creditPackages.findFirst();
    
    if (!existingCreditPackage) {
      console.log("Creating credit packages...");
      await db.insert(schema.creditPackages).values([
        {
          name: "Basic",
          credits: 50,
          price: "199",
          description: "Basic package with 50 credits",
          isActive: true
        },
        {
          name: "Standard",
          credits: 100,
          price: "349",
          description: "Standard package with 100 credits",
          isActive: true
        },
        {
          name: "Premium",
          credits: 250,
          price: "799",
          description: "Premium package with 250 credits",
          isActive: true
        },
        {
          name: "Ultimate",
          credits: 500,
          price: "1499",
          description: "Ultimate package with 500 credits",
          isActive: true
        }
      ]);
    }
    
    // Create sample fee receipt if not exists
    const existingReceipt = await db.query.feeReceipts.findFirst({
      where: (receipts, { eq }) => eq(receipts.receiptNo, "REC-2023-0521")
    });

    if (!existingReceipt && studentId) {
      console.log("Creating sample fee receipts...");
      const [newReceipt] = await db.insert(schema.feeReceipts).values({
        receiptNo: "REC-2023-0521",
        studentId: studentId,
        paymentDate: new Date("2023-05-15"),
        month: "May 2023",
        paymentMethod: "Cash",
        totalAmount: 3300,
        schoolId: schoolId
      }).returning();

      // Create fee items for the receipt
      await db.insert(schema.feeItems).values([
        {
          receiptId: newReceipt.id,
          type: "Tuition Fee",
          amount: 2500,
          description: "Monthly tuition fee for May 2023"
        },
        {
          receiptId: newReceipt.id,
          type: "Exam Fee",
          amount: 500,
          description: "Term exam fee"
        },
        {
          receiptId: newReceipt.id,
          type: "Library Fee",
          amount: 300,
          description: "Monthly library fee"
        }
      ]);
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
