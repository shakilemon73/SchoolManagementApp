import { pgTable, text, serial, integer, timestamp, date, decimal, boolean, json, time, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  full_name: text("full_name").notNull(),
  role: text("role").default("user").notNull(),
  email: text("email"),
  phone: text("phone"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  full_name: true,
  role: true,
  email: true,
  phone: true,
  language: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Credit packages available for purchase
export const creditPackages = pgTable("credit_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const creditPackageInsertSchema = createInsertSchema(creditPackages);
export type InsertCreditPackage = z.infer<typeof creditPackageInsertSchema>;
export type CreditPackage = typeof creditPackages.$inferSelect;

// Library Books table
export const libraryBooks = pgTable("library_books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleBn: text("title_bn").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn"),
  category: text("category").notNull(),
  publisher: text("publisher"),
  publishYear: integer("publish_year"),
  totalCopies: integer("total_copies").default(1).notNull(),
  availableCopies: integer("available_copies").default(1).notNull(),
  location: text("location").notNull(),
  description: text("description"),
  schoolId: integer("school_id").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Library Borrowed Books table
export const libraryBorrowedBooks = pgTable("library_borrowed_books", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").references(() => libraryBooks.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  borrowDate: date("borrow_date").defaultNow().notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  status: text("status").default("active").notNull(),
  notes: text("notes"),
  schoolId: integer("school_id").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enhanced Inventory Items table (replaces original)
export const inventoryItems = pgTable("enhanced_inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  brand: text("brand"),
  model: text("model"),
  serialNumber: text("serial_number"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).default("0"),
  currentQuantity: integer("current_quantity").default(0).notNull(),
  minimumThreshold: integer("minimum_threshold").default(10).notNull(),
  unit: text("unit").notNull(),
  supplier: text("supplier"),
  location: text("location").notNull(),
  condition: text("condition").notNull(),
  description: text("description"),
  schoolId: integer("school_id").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory Movements table
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => inventoryItems.id).notNull(),
  type: text("type").notNull(), // 'in', 'out', 'adjustment'
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  reference: text("reference"),
  notes: text("notes"),
  schoolId: integer("school_id").default(1).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Main Transport Routes table
export const transportRoutes = pgTable("enhanced_transport_routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startPoint: text("start_point").notNull(),
  endPoint: text("end_point").notNull(),
  distance: decimal("distance", { precision: 8, scale: 2 }).default("0"),
  estimatedTime: integer("estimated_time").default(0),
  fare: decimal("fare", { precision: 8, scale: 2 }).default("0"),
  stops: json("stops").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  schoolId: integer("school_id").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transport Vehicles table
export const transportVehicles = pgTable("transport_vehicles", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  type: text("type").notNull(),
  capacity: integer("capacity").notNull(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone").notNull(),
  helperName: text("helper_name"),
  helperPhone: text("helper_phone"),
  routeId: integer("route_id").references(() => transportRoutes.id),
  isActive: boolean("is_active").default(true),
  schoolId: integer("school_id").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transport Student Assignments table
export const transportStudentAssignments = pgTable("transport_student_assignments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  routeId: integer("route_id").references(() => transportRoutes.id).notNull(),
  pickupStop: text("pickup_stop").notNull(),
  dropStop: text("drop_stop").notNull(),
  monthlyFee: decimal("monthly_fee", { precision: 8, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  schoolId: integer("school_id").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleBn: text("title_bn").notNull(),
  message: text("message").notNull(),
  messageBn: text("message_bn").notNull(),
  type: text("type").default("info").notNull(),
  priority: text("priority").default("medium").notNull(),
  category: text("category").notNull(),
  categoryBn: text("category_bn").notNull(),
  recipientId: integer("recipient_id").references(() => users.id),
  sender: text("sender"),
  isRead: boolean("is_read").default(false),
  actionRequired: boolean("action_required").default(false),
  schoolId: integer("school_id").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const libraryBooksInsertSchema = createInsertSchema(libraryBooks);
export type InsertLibraryBook = z.infer<typeof libraryBooksInsertSchema>;
export type LibraryBook = typeof libraryBooks.$inferSelect;

export const libraryBorrowedBooksInsertSchema = createInsertSchema(libraryBorrowedBooks);
export type InsertLibraryBorrowedBook = z.infer<typeof libraryBorrowedBooksInsertSchema>;
export type LibraryBorrowedBook = typeof libraryBorrowedBooks.$inferSelect;

export const inventoryItemsInsertSchema = createInsertSchema(inventoryItems);
export type InsertInventoryItem = z.infer<typeof inventoryItemsInsertSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

export const inventoryMovementsInsertSchema = createInsertSchema(inventoryMovements);
export type InsertInventoryMovement = z.infer<typeof inventoryMovementsInsertSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;

export const transportRoutesInsertSchema = createInsertSchema(transportRoutes);
export type InsertTransportRoute = z.infer<typeof transportRoutesInsertSchema>;
export type TransportRoute = typeof transportRoutes.$inferSelect;

export const transportVehiclesInsertSchema = createInsertSchema(transportVehicles);
export type InsertTransportVehicle = z.infer<typeof transportVehiclesInsertSchema>;
export type TransportVehicle = typeof transportVehicles.$inferSelect;

export const transportStudentAssignmentsInsertSchema = createInsertSchema(transportStudentAssignments);
export type InsertTransportStudentAssignment = z.infer<typeof transportStudentAssignmentsInsertSchema>;
export type TransportStudentAssignment = typeof transportStudentAssignments.$inferSelect;

export const notificationsInsertSchema = createInsertSchema(notifications);
export type InsertNotification = z.infer<typeof notificationsInsertSchema>;
export type Notification = typeof notifications.$inferSelect;

// Credit transactions table for tracking credit purchases
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  packageId: integer("package_id").references(() => creditPackages.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  credits: integer("credits").notNull(),
  paymentMethod: text("payment_method", { 
    enum: ['bkash', 'nagad', 'rocket', 'upay', 'bank-transfer', 'cash', 'other'] 
  }).notNull(),
  transactionId: text("transaction_id"),
  paymentNumber: text("payment_number"),
  status: text("status", { 
    enum: ['pending', 'completed', 'failed', 'refunded'] 
  }).default('pending').notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const creditTransactionInsertSchema = createInsertSchema(creditTransactions);
export type InsertCreditTransaction = z.infer<typeof creditTransactionInsertSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

// Credit usage logs for tracking how credits are spent
export const creditUsageLogs = pgTable("credit_usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  feature: text("feature").notNull(), // what feature the credits were spent on
  credits: integer("credits").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditUsageLogInsertSchema = createInsertSchema(creditUsageLogs);
export type InsertCreditUsageLog = z.infer<typeof creditUsageLogInsertSchema>;
export type CreditUsageLog = typeof creditUsageLogs.$inferSelect;

// School table for managing multiple schools
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logo: text("logo"),
  type: text("type").notNull(), // School, College, Madrasha, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSchoolSchema = createInsertSchema(schools);
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = typeof schools.$inferSelect;

// Student table for managing students
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  name: text("name").notNull(),
  nameInBangla: text("name_in_bangla"),
  fatherName: text("father_name"),
  fatherNameInBangla: text("father_name_in_bangla"),
  motherName: text("mother_name"),
  motherNameInBangla: text("mother_name_in_bangla"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  bloodGroup: text("blood_group"),
  presentAddress: text("present_address"),
  permanentAddress: text("permanent_address"),
  village: text("village"),
  postOffice: text("post_office"),
  thana: text("thana"),
  district: text("district"),
  division: text("division"),
  phone: text("phone"),
  email: text("email"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactRelation: text("emergency_contact_relation"),
  emergencyContactPhone: text("emergency_contact_phone"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  guardianRelation: text("guardian_relation"),
  class: text("class").notNull(),
  section: text("section"),
  rollNumber: text("roll_number"),
  schoolId: integer("school_id").references(() => schools.id),
  status: text("status").default("active").notNull(), // active, inactive, transferred, etc.
  photo: text("photo"),
  idCardIssueDate: date("id_card_issue_date"),
  idCardValidUntil: date("id_card_valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studentInsertSchema = createInsertSchema(students);
export type InsertStudent = z.infer<typeof studentInsertSchema>;
export type Student = typeof students.$inferSelect;

// Teacher table for managing teachers
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  teacherId: text("teacher_id").notNull().unique(),
  name: text("name").notNull(),
  qualification: text("qualification"),
  subject: text("subject"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  schoolId: integer("school_id").references(() => schools.id),
  status: text("status").default("active").notNull(), // active, inactive, etc.
  photo: text("photo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teacherInsertSchema = createInsertSchema(teachers);
export type InsertTeacher = z.infer<typeof teacherInsertSchema>;
export type Teacher = typeof teachers.$inferSelect;

// Staff table for managing non-teaching staff
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  staffId: text("staff_id").notNull().unique(),
  name: text("name").notNull(),
  nameInBangla: text("name_in_bangla"),
  department: text("department"),
  designation: text("designation"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  joinDate: date("join_date"),
  salary: integer("salary"),
  schoolId: integer("school_id").references(() => schools.id),
  status: text("status").default("active").notNull(),
  photo: text("photo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const staffInsertSchema = createInsertSchema(staff);
export type InsertStaff = z.infer<typeof staffInsertSchema>;
export type Staff = typeof staff.$inferSelect;

// Parents table for managing student parents/guardians
export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  parentId: text("parent_id").notNull().unique(),
  fatherName: text("father_name"),
  fatherNameInBangla: text("father_name_in_bangla"),
  motherName: text("mother_name"),
  motherNameInBangla: text("mother_name_in_bangla"),
  occupation: text("occupation"),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  nid: text("nid"),
  emergencyContact: text("emergency_contact"),
  schoolId: integer("school_id").references(() => schools.id),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentInsertSchema = createInsertSchema(parents);
export type InsertParent = z.infer<typeof parentInsertSchema>;
export type Parent = typeof parents.$inferSelect;

// Class table for managing classes
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  section: text("section"),
  schoolId: integer("school_id").references(() => schools.id),
  classTeacherId: integer("class_teacher_id").references(() => teachers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const classInsertSchema = createInsertSchema(classes);
export type InsertClass = z.infer<typeof classInsertSchema>;
export type Class = typeof classes.$inferSelect;

// Fee Receipt table
export const feeReceipts = pgTable("fee_receipts", {
  id: serial("id").primaryKey(),
  receiptNo: text("receipt_no").notNull().unique(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  paymentDate: date("payment_date").notNull(),
  month: text("month"),
  paymentMethod: text("payment_method").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feeReceiptInsertSchema = createInsertSchema(feeReceipts);
export type InsertFeeReceipt = z.infer<typeof feeReceiptInsertSchema>;
export type FeeReceipt = typeof feeReceipts.$inferSelect;

// Fee Items for receipts
export const feeItems = pgTable("fee_items", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id").references(() => feeReceipts.id).notNull(),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feeItemInsertSchema = createInsertSchema(feeItems);
export type InsertFeeItem = z.infer<typeof feeItemInsertSchema>;
export type FeeItem = typeof feeItems.$inferSelect;

// Template table for document templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // admit-card, fee-receipt, id-card, etc.
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false),
  schoolId: integer("school_id").references(() => schools.id),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templateInsertSchema = createInsertSchema(templates);
export type InsertTemplate = z.infer<typeof templateInsertSchema>;
export type Template = typeof templates.$inferSelect;

// Relations
export const feeReceiptsRelations = relations(feeReceipts, ({ one, many }) => ({
  student: one(students, {
    fields: [feeReceipts.studentId],
    references: [students.id]
  }),
  feeItems: many(feeItems)
}));

export const feeItemsRelations = relations(feeItems, ({ one }) => ({
  receipt: one(feeReceipts, {
    fields: [feeItems.receiptId],
    references: [feeReceipts.id]
  })
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  school: one(schools, {
    fields: [students.schoolId],
    references: [schools.id]
  }),
  feeReceipts: many(feeReceipts),
  attendance: many(attendance),
  examResults: many(examResults),
  bookIssues: many(bookIssues),
  transportAssignments: many(transportAssignments),
  testimonials: many(testimonials)
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  school: one(schools, {
    fields: [teachers.schoolId],
    references: [schools.id]
  }),
  classes: many(classes)
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, {
    fields: [classes.schoolId],
    references: [schools.id]
  }),
  teacher: one(teachers, {
    fields: [classes.classTeacherId],
    references: [teachers.id]
  })
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
  students: many(students),
  teachers: many(teachers),
  classes: many(classes),
  templates: many(templates)
}));

// Credit relations
export const usersRelations = relations(users, ({ many }) => ({
  creditTransactions: many(creditTransactions),
  creditUsageLogs: many(creditUsageLogs)
}));

export const creditPackagesRelations = relations(creditPackages, ({ many }) => ({
  transactions: many(creditTransactions)
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id]
  }),
  package: one(creditPackages, {
    fields: [creditTransactions.packageId],
    references: [creditPackages.id]
  })
}));

export const creditUsageLogsRelations = relations(creditUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [creditUsageLogs.userId],
    references: [users.id]
  })
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  school: one(schools, {
    fields: [templates.schoolId],
    references: [schools.id]
  })
}));

// Attendance table for tracking student attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(), // present, absent, late, etc.
  remarks: text("remarks"),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const attendanceInsertSchema = createInsertSchema(attendance);
export type InsertAttendance = z.infer<typeof attendanceInsertSchema>;
export type Attendance = typeof attendance.$inferSelect;

// Academic years
export const academicYears = pgTable("academic_years", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isCurrent: boolean("is_current").default(false),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const academicYearInsertSchema = createInsertSchema(academicYears);
export type InsertAcademicYear = z.infer<typeof academicYearInsertSchema>;
export type AcademicYear = typeof academicYears.$inferSelect;

// Exams table
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  academicYearId: integer("academic_year_id").references(() => academicYears.id),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examInsertSchema = createInsertSchema(exams);
export type InsertExam = z.infer<typeof examInsertSchema>;
export type Exam = typeof exams.$inferSelect;

// Exam schedules
export const examSchedules = pgTable("exam_schedules", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => exams.id).notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  subject: text("subject").notNull(),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  venue: text("venue"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examScheduleInsertSchema = createInsertSchema(examSchedules);
export type InsertExamSchedule = z.infer<typeof examScheduleInsertSchema>;
export type ExamSchedule = typeof examSchedules.$inferSelect;

// Student exam results
export const examResults = pgTable("exam_results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  examId: integer("exam_id").references(() => exams.id).notNull(),
  subject: text("subject").notNull(),
  marks: decimal("marks", { precision: 5, scale: 2 }).notNull(),
  totalMarks: decimal("total_marks", { precision: 5, scale: 2 }).notNull(),
  grade: text("grade"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const examResultInsertSchema = createInsertSchema(examResults);
export type InsertExamResult = z.infer<typeof examResultInsertSchema>;
export type ExamResult = typeof examResults.$inferSelect;

// Library books
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn"),
  publisher: text("publisher"),
  category: text("category"),
  copies: integer("copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(1),
  location: text("location"),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookInsertSchema = createInsertSchema(books);
export type InsertBook = z.infer<typeof bookInsertSchema>;
export type Book = typeof books.$inferSelect;

// Library book issues
export const bookIssues = pgTable("book_issues", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  status: text("status").notNull(), // issued, returned, overdue
  fine: decimal("fine", { precision: 10, scale: 2 }).default("0"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookIssueInsertSchema = createInsertSchema(bookIssues);
export type InsertBookIssue = z.infer<typeof bookIssueInsertSchema>;
export type BookIssue = typeof bookIssues.$inferSelect;

// Inventory categories
export const inventoryCategories = pgTable("inventory_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventoryCategoryInsertSchema = createInsertSchema(inventoryCategories);
export type InsertInventoryCategory = z.infer<typeof inventoryCategoryInsertSchema>;
export type InventoryCategory = typeof inventoryCategories.$inferSelect;

// Original inventory items (keeping existing structure)
export const originalInventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => inventoryCategories.id),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  supplier: text("supplier"),
  purchaseDate: date("purchase_date"),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const originalInventoryItemInsertSchema = createInsertSchema(originalInventoryItems);
export type InsertOriginalInventoryItem = z.infer<typeof originalInventoryItemInsertSchema>;
export type OriginalInventoryItem = typeof originalInventoryItems.$inferSelect;

// Transport vehicles
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // bus, van, etc.
  regNumber: text("reg_number").notNull(),
  capacity: integer("capacity").notNull(),
  driver: text("driver"),
  contactNumber: text("contact_number"),
  route: text("route"),
  schoolId: integer("school_id").references(() => schools.id),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicleInsertSchema = createInsertSchema(vehicles);
export type InsertVehicle = z.infer<typeof vehicleInsertSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Original transport routes (keeping existing structure)
export const originalTransportRoutes = pgTable("transport_routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  fare: decimal("fare", { precision: 10, scale: 2 }).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const originalTransportRouteInsertSchema = createInsertSchema(originalTransportRoutes);
export type InsertOriginalTransportRoute = z.infer<typeof originalTransportRouteInsertSchema>;
export type OriginalTransportRoute = typeof originalTransportRoutes.$inferSelect;

// Transport assignments
export const transportAssignments = pgTable("transport_assignments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  routeId: integer("route_id").references(() => transportRoutes.id).notNull(),
  pickupPoint: text("pickup_point"),
  dropPoint: text("drop_point"),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transportAssignmentInsertSchema = createInsertSchema(transportAssignments);
export type InsertTransportAssignment = z.infer<typeof transportAssignmentInsertSchema>;
export type TransportAssignment = typeof transportAssignments.$inferSelect;

// Calendar events table for real-time event management
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  startTime: time("start_time"),
  endTime: time("end_time"),
  location: text("location"),
  eventType: text("event_type").notNull(), // academic, exam, holiday, meeting, sports, cultural
  isAllDay: boolean("is_all_day").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: text("recurrence_pattern"), // daily, weekly, monthly, yearly
  participantGroups: json("participant_groups"), // array of participant group IDs
  notifyParticipants: boolean("notify_participants").default(true),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const calendarEventInsertSchema = createInsertSchema(calendarEvents);
export type InsertCalendarEvent = z.infer<typeof calendarEventInsertSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Calendar events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  allDay: boolean("all_day").default(false),
  location: text("location"),
  eventType: text("event_type").notNull(), // holiday, meeting, exam, etc.
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

export const eventInsertSchema = createInsertSchema(events);
export type InsertEvent = z.infer<typeof eventInsertSchema>;
export type Event = typeof events.$inferSelect;

// Notifications with native Bengali support
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleBn: text("title_bn"), // Native Bengali title
  message: text("message").notNull(),
  messageBn: text("message_bn"), // Native Bengali message
  type: text("type").notNull(), // success, warning, error, info, urgent
  priority: text("priority").default("medium"), // low, medium, high, urgent
  category: text("category").default("General"), // Academic, Payment, Attendance, etc.
  categoryBn: text("category_bn").default("সাধারণ"), // Native Bengali category
  targetUserRole: text("target_user_role"), // admin, teacher, student, parent, etc.
  targetUserId: integer("target_user_id").references(() => users.id),
  recipientId: integer("recipient_id").references(() => users.id), // Direct recipient
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  actionRequired: boolean("action_required").default(false),
  schoolId: integer("school_id").references(() => schools.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sendAt: timestamp("send_at"),
  expiresAt: timestamp("expires_at"),
});

export const notificationInsertSchema = createInsertSchema(notifications);
export type InsertNotification = z.infer<typeof notificationInsertSchema>;
export type Notification = typeof notifications.$inferSelect;

// Testimonials/Certificates
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  issueDate: date("issue_date").notNull(),
  referenceNumber: text("reference_number"),
  signedBy: integer("signed_by").references(() => teachers.id),
  schoolId: integer("school_id").references(() => schools.id),
  templateId: integer("template_id").references(() => templates.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testimonialInsertSchema = createInsertSchema(testimonials);
export type InsertTestimonial = z.infer<typeof testimonialInsertSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Admission forms
export const admissionForms = pgTable("admission_forms", {
  id: serial("id").primaryKey(),
  formNumber: text("form_number").notNull().unique(),
  applicantName: text("applicant_name").notNull(),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  applyingForClass: text("applying_for_class").notNull(),
  previousSchool: text("previous_school"),
  status: text("status").notNull(), // pending, approved, rejected
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const admissionFormInsertSchema = createInsertSchema(admissionForms);
export type InsertAdmissionForm = z.infer<typeof admissionFormInsertSchema>;
export type AdmissionForm = typeof admissionForms.$inferSelect;

// Class Routines
export const periods = pgTable("periods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  dayOfWeek: text("day_of_week").notNull(), // Monday, Tuesday, etc.
  subject: text("subject").notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  teacherId: integer("teacher_id").references(() => teachers.id),
  roomNumber: text("room_number"),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const periodInsertSchema = createInsertSchema(periods);
export type InsertPeriod = z.infer<typeof periodInsertSchema>;
export type Period = typeof periods.$inferSelect;

// Financial Transactions
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  transactionType: text("transaction_type").notNull(), // income, expense
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  description: text("description"),
  paymentMethod: text("payment_method").notNull(),
  referenceNumber: text("reference_number"),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

export const financialTransactionInsertSchema = createInsertSchema(financialTransactions);
export type InsertFinancialTransaction = z.infer<typeof financialTransactionInsertSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;

// Admit Card Templates
export const admitCardTemplates = pgTable("admit_card_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  description: text("description"),
  category: text("category").notNull().default("custom"), // default, custom
  templateData: json("template_data"), // JSON structure for template layout
  previewUrl: text("preview_url"),
  isActive: boolean("is_active").default(true),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const admitCardTemplateInsertSchema = createInsertSchema(admitCardTemplates);
export type InsertAdmitCardTemplate = z.infer<typeof admitCardTemplateInsertSchema>;
export type AdmitCardTemplate = typeof admitCardTemplates.$inferSelect;

// Admit Cards
export const admitCards = pgTable("admit_cards", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  studentNameBn: text("student_name_bn"),
  studentId: text("student_id"),
  rollNumber: text("roll_number").notNull(),
  registrationNumber: text("registration_number"),
  className: text("class_name").notNull(),
  section: text("section"),
  examType: text("exam_type").notNull(),
  examDate: text("exam_date"), // Store as text to avoid date conversion issues
  subjects: json("subjects"), // Array of subjects with codes
  schoolData: json("school_data"), // School name, address, logo etc.
  templateId: integer("template_id").references(() => admitCardTemplates.id).notNull(),
  photoUrl: text("photo_url"),
  status: text("status").notNull().default("generated"), // generated, downloaded, printed
  pdfUrl: text("pdf_url"),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const admitCardInsertSchema = createInsertSchema(admitCards);
export type InsertAdmitCard = z.infer<typeof admitCardInsertSchema>;
export type AdmitCard = typeof admitCards.$inferSelect;

// Admit Card History
export const admitCardHistory = pgTable("admit_card_history", {
  id: serial("id").primaryKey(),
  admitCardId: integer("admit_card_id").references(() => admitCards.id).notNull(),
  action: text("action").notNull(), // generated, downloaded, printed, deleted
  performedBy: integer("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admitCardHistoryInsertSchema = createInsertSchema(admitCardHistory);
export type InsertAdmitCardHistory = z.infer<typeof admitCardHistoryInsertSchema>;
export type AdmitCardHistory = typeof admitCardHistory.$inferSelect;

// Now add additional relations between the tables
export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id]
  }),
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id]
  }),
  school: one(schools, {
    fields: [attendance.schoolId],
    references: [schools.id]
  })
}));

export const academicYearsRelations = relations(academicYears, ({ one, many }) => ({
  school: one(schools, {
    fields: [academicYears.schoolId],
    references: [schools.id]
  }),
  exams: many(exams)
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  academicYear: one(academicYears, {
    fields: [exams.academicYearId],
    references: [academicYears.id]
  }),
  school: one(schools, {
    fields: [exams.schoolId],
    references: [schools.id]
  }),
  schedules: many(examSchedules),
  results: many(examResults)
}));

export const examSchedulesRelations = relations(examSchedules, ({ one }) => ({
  exam: one(exams, {
    fields: [examSchedules.examId],
    references: [exams.id]
  }),
  class: one(classes, {
    fields: [examSchedules.classId],
    references: [classes.id]
  })
}));

export const examResultsRelations = relations(examResults, ({ one }) => ({
  student: one(students, {
    fields: [examResults.studentId],
    references: [students.id]
  }),
  exam: one(exams, {
    fields: [examResults.examId],
    references: [exams.id]
  })
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  school: one(schools, {
    fields: [books.schoolId],
    references: [schools.id]
  }),
  issues: many(bookIssues)
}));

export const bookIssuesRelations = relations(bookIssues, ({ one }) => ({
  book: one(books, {
    fields: [bookIssues.bookId],
    references: [books.id]
  }),
  student: one(students, {
    fields: [bookIssues.studentId],
    references: [students.id]
  })
}));

export const inventoryCategoriesRelations = relations(inventoryCategories, ({ one, many }) => ({
  school: one(schools, {
    fields: [inventoryCategories.schoolId],
    references: [schools.id]
  }),
  items: many(inventoryItems)
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  category: one(inventoryCategories, {
    fields: [inventoryItems.categoryId],
    references: [inventoryCategories.id]
  }),
  school: one(schools, {
    fields: [inventoryItems.schoolId],
    references: [schools.id]
  })
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  school: one(schools, {
    fields: [vehicles.schoolId],
    references: [schools.id]
  }),
  routes: many(transportRoutes)
}));

export const transportRoutesRelations = relations(transportRoutes, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [transportRoutes.vehicleId],
    references: [vehicles.id]
  }),
  school: one(schools, {
    fields: [transportRoutes.schoolId],
    references: [schools.id]
  }),
  assignments: many(transportAssignments)
}));

export const transportAssignmentsRelations = relations(transportAssignments, ({ one }) => ({
  student: one(students, {
    fields: [transportAssignments.studentId],
    references: [students.id]
  }),
  route: one(transportRoutes, {
    fields: [transportAssignments.routeId],
    references: [transportRoutes.id]
  })
}));

export const eventsRelations = relations(events, ({ one }) => ({
  school: one(schools, {
    fields: [events.schoolId],
    references: [schools.id]
  }),
  createdByUser: one(users, {
    fields: [events.createdBy],
    references: [users.id]
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  school: one(schools, {
    fields: [notifications.schoolId],
    references: [schools.id]
  }),
  targetUser: one(users, {
    fields: [notifications.targetUserId],
    references: [users.id]
  })
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  student: one(students, {
    fields: [testimonials.studentId],
    references: [students.id]
  }),
  signedByTeacher: one(teachers, {
    fields: [testimonials.signedBy],
    references: [teachers.id]
  }),
  school: one(schools, {
    fields: [testimonials.schoolId],
    references: [schools.id]
  }),
  template: one(templates, {
    fields: [testimonials.templateId],
    references: [templates.id]
  })
}));

export const admissionFormsRelations = relations(admissionForms, ({ one }) => ({
  school: one(schools, {
    fields: [admissionForms.schoolId],
    references: [schools.id]
  })
}));

export const periodsRelations = relations(periods, ({ one }) => ({
  class: one(classes, {
    fields: [periods.classId],
    references: [classes.id]
  }),
  teacher: one(teachers, {
    fields: [periods.teacherId],
    references: [teachers.id]
  }),
  school: one(schools, {
    fields: [periods.schoolId],
    references: [schools.id]
  })
}));

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  school: one(schools, {
    fields: [financialTransactions.schoolId],
    references: [schools.id]
  }),
  createdByUser: one(users, {
    fields: [financialTransactions.createdBy],
    references: [users.id]
  })
}));

export const admitCardTemplatesRelations = relations(admitCardTemplates, ({ one, many }) => ({
  school: one(schools, {
    fields: [admitCardTemplates.schoolId],
    references: [schools.id]
  }),
  admitCards: many(admitCards)
}));

export const admitCardsRelations = relations(admitCards, ({ one, many }) => ({
  template: one(admitCardTemplates, {
    fields: [admitCards.templateId],
    references: [admitCardTemplates.id]
  }),
  school: one(schools, {
    fields: [admitCards.schoolId],
    references: [schools.id]
  }),
  history: many(admitCardHistory)
}));

export const admitCardHistoryRelations = relations(admitCardHistory, ({ one }) => ({
  admitCard: one(admitCards, {
    fields: [admitCardHistory.admitCardId],
    references: [admitCards.id]
  }),
  performedByUser: one(users, {
    fields: [admitCardHistory.performedBy],
    references: [users.id]
  })
}));

// Additional custom school relations
export const schoolsExtendedRelations = relations(schools, ({ many }) => ({
  academicYears: many(academicYears),
  exams: many(exams),
  attendance: many(attendance),
  books: many(books),
  inventoryCategories: many(inventoryCategories),
  inventoryItems: many(inventoryItems),
  vehicles: many(vehicles),
  transportRoutes: many(transportRoutes),
  events: many(events),
  notifications: many(notifications),
  testimonials: many(testimonials),
  admissionForms: many(admissionForms),
  periods: many(periods),
  financialTransactions: many(financialTransactions)
}));

// Parent-Student relationship table
export const parentStudents = pgTable("parent_students", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => users.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  relation: text("relation").notNull(), // father, mother, guardian, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentStudentInsertSchema = createInsertSchema(parentStudents);
export type InsertParentStudent = z.infer<typeof parentStudentInsertSchema>;
export type ParentStudent = typeof parentStudents.$inferSelect;

// Messages table for parent-teacher communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  studentId: integer("student_id").references(() => students.id),
  subject: text("subject"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  messageType: text("message_type").default("general"), // general, urgent, announcement
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageInsertSchema = createInsertSchema(messages);
export type InsertMessage = z.infer<typeof messageInsertSchema>;
export type Message = typeof messages.$inferSelect;

// Progress tracking for students
export const studentProgress = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  subject: text("subject").notNull(),
  month: text("month").notNull(),
  academicYear: text("academic_year").notNull(),
  attendancePercentage: decimal("attendance_percentage", { precision: 5, scale: 2 }),
  behaviorScore: integer("behavior_score"), // 1-10 scale
  participationScore: integer("participation_score"), // 1-10 scale
  homeworkCompletion: decimal("homework_completion", { precision: 5, scale: 2 }),
  testScores: json("test_scores"), // Array of test scores
  teacherComments: text("teacher_comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const studentProgressInsertSchema = createInsertSchema(studentProgress);
export type InsertStudentProgress = z.infer<typeof studentProgressInsertSchema>;
export type StudentProgress = typeof studentProgress.$inferSelect;

// Parent notifications with native Bengali support
export const parentNotifications = pgTable("parent_notifications", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => users.id).notNull(),
  studentId: integer("student_id").references(() => students.id),
  title: text("title").notNull(),
  titleBn: text("title_bn"), // Native Bengali title
  message: text("message").notNull(),
  messageBn: text("message_bn"), // Native Bengali message
  type: text("type").notNull(), // attendance, fee, grade, event, announcement
  category: text("category").default("General"), // Academic, Payment, Attendance, etc.
  categoryBn: text("category_bn").default("সাধারণ"), // Native Bengali category
  isRead: boolean("is_read").default(false),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  actionRequired: boolean("action_required").default(false),
  actionUrl: text("action_url"), // URL to take action if needed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentNotificationInsertSchema = createInsertSchema(parentNotifications);
export type InsertParentNotification = z.infer<typeof parentNotificationInsertSchema>;
export type ParentNotification = typeof parentNotifications.$inferSelect;

// New relations for parent portal features
export const parentStudentsRelations = relations(parentStudents, ({ one }) => ({
  parent: one(users, { fields: [parentStudents.parentId], references: [users.id] }),
  student: one(students, { fields: [parentStudents.studentId], references: [students.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id] }),
  student: one(students, { fields: [messages.studentId], references: [students.id] }),
}));

export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
  student: one(students, { fields: [studentProgress.studentId], references: [students.id] }),
}));

export const parentNotificationsRelations = relations(parentNotifications, ({ one }) => ({
  parent: one(users, { fields: [parentNotifications.parentId], references: [users.id] }),
  student: one(students, { fields: [parentNotifications.studentId], references: [students.id] }),
}));
