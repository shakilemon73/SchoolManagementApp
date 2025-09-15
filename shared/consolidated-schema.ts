import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  decimal, 
  boolean, 
  timestamp, 
  date, 
  time, 
  json,
  uuid,
  varchar,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================================================================
// CORE ENTITIES - Foundation of the system
// ============================================================================

// Schools - Multi-tenant support
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  principalName: text("principal_name"),
  establishedYear: integer("established_year"),
  schoolCode: text("school_code").unique(),
  status: text("status", { enum: ['active', 'inactive', 'suspended'] }).default('active'),
  subscriptionTier: text("subscription_tier", { enum: ['free', 'basic', 'premium', 'enterprise'] }).default('free'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  schoolCodeIdx: index("school_code_idx").on(table.schoolCode),
}));

// Users - Unified user management (replaces app_users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabaseId: uuid("supabase_id").unique(), // Links to Supabase Auth
  username: text("username").unique(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  role: text("role", { 
    enum: ['super_admin', 'school_admin', 'teacher', 'student', 'parent', 'staff'] 
  }).default('student').notNull(),
  schoolId: integer("school_id").references(() => schools.id),
  isActive: boolean("is_active").default(true),
  profilePicture: text("profile_picture"),
  phoneNumber: text("phone_number"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender", { enum: ['male', 'female', 'other'] }),
  address: text("address"),
  emergencyContact: json("emergency_contact"),
  preferences: json("preferences").default({}),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  supabaseIdIdx: index("users_supabase_id_idx").on(table.supabaseId),
  schoolRoleIdx: index("users_school_role_idx").on(table.schoolId, table.role),
}));

// Students - Extended student information
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  studentId: text("student_id").unique().notNull(),
  admissionNumber: text("admission_number"),
  class: text("class").notNull(),
  section: text("section"),
  rollNumber: text("roll_number"),
  academicYearId: integer("academic_year_id"),
  bloodGroup: text("blood_group"),
  religion: text("religion"),
  nationality: text("nationality").default('Bangladeshi'),
  motherTongue: text("mother_tongue"),
  
  // Family Information
  fatherName: text("father_name"),
  fatherNameBn: text("father_name_bn"),
  fatherOccupation: text("father_occupation"),
  fatherPhone: text("father_phone"),
  motherName: text("mother_name"),
  motherNameBn: text("mother_name_bn"),
  motherOccupation: text("mother_occupation"),
  motherPhone: text("mother_phone"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  guardianRelation: text("guardian_relation"),
  
  // Address Information
  presentAddress: text("present_address"),
  permanentAddress: text("permanent_address"),
  village: text("village"),
  postOffice: text("post_office"),
  thana: text("thana"),
  district: text("district"),
  division: text("division"),
  postalCode: text("postal_code"),
  
  // Academic Information
  previousSchool: text("previous_school"),
  admissionDate: date("admission_date"),
  graduationDate: date("graduation_date"),
  status: text("status", { 
    enum: ['active', 'inactive', 'graduated', 'transferred', 'expelled'] 
  }).default('active'),
  
  // ID Card Information
  idCardIssueDate: date("id_card_issue_date"),
  idCardValidUntil: date("id_card_valid_until"),
  
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  studentIdIdx: index("students_student_id_idx").on(table.studentId),
  classIdx: index("students_class_idx").on(table.class, table.section),
  schoolIdx: index("students_school_idx").on(table.schoolId),
  statusIdx: index("students_status_idx").on(table.status),
}));

// Teachers - Extended teacher information
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  teacherId: text("teacher_id").unique().notNull(),
  employeeId: text("employee_id"),
  designation: text("designation"),
  department: text("department"),
  subjects: text("subjects").array().default([]),
  qualification: text("qualification"),
  experience: integer("experience"), // years
  joiningDate: date("joining_date"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  status: text("status", { 
    enum: ['active', 'inactive', 'on_leave', 'terminated'] 
  }).default('active'),
  permissions: json("permissions").default({}),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  teacherIdIdx: index("teachers_teacher_id_idx").on(table.teacherId),
  schoolIdx: index("teachers_school_idx").on(table.schoolId),
  statusIdx: index("teachers_status_idx").on(table.status),
}));

// ============================================================================
// ACADEMIC MANAGEMENT
// ============================================================================

// Academic Years
export const academicYears = pgTable("academic_years", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isCurrent: boolean("is_current").default(false),
  status: text("status", { 
    enum: ['draft', 'active', 'completed', 'archived'] 
  }).default('draft'),
  description: text("description"),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  schoolCurrentIdx: index("academic_years_school_current_idx").on(table.schoolId, table.isCurrent),
}));

// Classes and Sections
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  level: integer("level"), // 1-12 for grades
  capacity: integer("capacity").default(50),
  classTeacherId: integer("class_teacher_id").references(() => teachers.id),
  academicYearId: integer("academic_year_id").references(() => academicYears.id),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  schoolYearIdx: index("classes_school_year_idx").on(table.schoolId, table.academicYearId),
}));

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  capacity: integer("capacity").default(40),
  sectionTeacherId: integer("section_teacher_id").references(() => teachers.id),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subjects
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  code: text("code"),
  description: text("description"),
  isCore: boolean("is_core").default(false),
  credits: integer("credits").default(1),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// LIBRARY MANAGEMENT
// ============================================================================

export const libraryBooks = pgTable("library_books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleBn: text("title_bn"),
  author: text("author").notNull(),
  authorBn: text("author_bn"),
  isbn: text("isbn"),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  publisher: text("publisher"),
  publishYear: integer("publish_year"),
  edition: text("edition"),
  language: text("language").default('Bengali'),
  totalCopies: integer("total_copies").default(1).notNull(),
  availableCopies: integer("available_copies").default(1).notNull(),
  location: text("location").notNull(),
  rackNumber: text("rack_number"),
  price: decimal("price", { precision: 8, scale: 2 }),
  condition: text("condition", { 
    enum: ['new', 'good', 'fair', 'poor', 'damaged'] 
  }).default('good'),
  description: text("description"),
  coverImage: text("cover_image"),
  tags: text("tags").array().default([]),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  titleIdx: index("library_books_title_idx").on(table.title),
  categoryIdx: index("library_books_category_idx").on(table.category),
  isbnIdx: index("library_books_isbn_idx").on(table.isbn),
}));

export const libraryBorrowedBooks = pgTable("library_borrowed_books", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").references(() => libraryBooks.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  borrowDate: date("borrow_date").defaultNow().notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  renewalCount: integer("renewal_count").default(0),
  status: text("status", { 
    enum: ['borrowed', 'returned', 'overdue', 'lost', 'damaged'] 
  }).default('borrowed'),
  fine: decimal("fine", { precision: 8, scale: 2 }).default("0"),
  notes: text("notes"),
  approvedBy: integer("approved_by").references(() => teachers.id),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  studentStatusIdx: index("library_borrowed_student_status_idx").on(table.studentId, table.status),
  dueDateIdx: index("library_borrowed_due_date_idx").on(table.dueDate),
}));

// ============================================================================
// ATTENDANCE MANAGEMENT
// ============================================================================

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  date: date("date").notNull(),
  status: text("status", { 
    enum: ['present', 'absent', 'late', 'excused'] 
  }).notNull(),
  timeIn: time("time_in"),
  timeOut: time("time_out"),
  notes: text("notes"),
  markedBy: integer("marked_by").references(() => teachers.id),
  classId: integer("class_id").references(() => classes.id),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  studentDateIdx: index("attendance_student_date_idx").on(table.studentId, table.date),
  dateStatusIdx: index("attendance_date_status_idx").on(table.date, table.status),
}));

// ============================================================================
// FINANCIAL MANAGEMENT
// ============================================================================

export const feeTypes = pgTable("fee_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isRecurring: boolean("is_recurring").default(false),
  frequency: text("frequency", { enum: ['monthly', 'quarterly', 'yearly', 'one_time'] }),
  isOptional: boolean("is_optional").default(false),
  applicableClasses: text("applicable_classes").array().default([]),
  dueDate: date("due_date"),
  lateFeePenalty: decimal("late_fee_penalty", { precision: 8, scale: 2 }).default("0"),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feePayments = pgTable("fee_payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  feeTypeId: integer("fee_type_id").references(() => feeTypes.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  status: text("status", { 
    enum: ['pending', 'partial', 'paid', 'overdue', 'waived'] 
  }).default('pending'),
  paymentMethod: text("payment_method", { 
    enum: ['cash', 'bank', 'online', 'mobile_banking'] 
  }),
  transactionId: text("transaction_id"),
  receiptNumber: text("receipt_number"),
  lateFee: decimal("late_fee", { precision: 8, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 8, scale: 2 }).default("0"),
  notes: text("notes"),
  collectedBy: integer("collected_by").references(() => users.id),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  studentStatusIdx: index("fee_payments_student_status_idx").on(table.studentId, table.status),
  dueDateIdx: index("fee_payments_due_date_idx").on(table.dueDate),
}));

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  type: text("type").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  template: json("template"),
  settings: json("settings").default({}),
  preview: text("preview"),
  isGlobal: boolean("is_global").default(false),
  isActive: boolean("is_active").default(true),
  requiredCredits: integer("required_credits").default(1),
  usageCount: integer("usage_count").default(0),
  tags: text("tags").array().default([]),
  version: text("version").default("1.0"),
  createdBy: integer("created_by").references(() => users.id),
  schoolId: integer("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  typeIdx: index("document_templates_type_idx").on(table.type),
  categoryIdx: index("document_templates_category_idx").on(table.category),
}));

export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => documentTemplates.id).notNull(),
  studentId: integer("student_id").references(() => students.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  status: text("status", { 
    enum: ['generating', 'completed', 'failed'] 
  }).default('generating'),
  generatedBy: integer("generated_by").references(() => users.id).notNull(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleBn: text("title_bn"),
  message: text("message").notNull(),
  messageBn: text("message_bn"),
  type: text("type", { 
    enum: ['info', 'warning', 'error', 'success', 'announcement'] 
  }).default('info'),
  priority: text("priority", { 
    enum: ['low', 'medium', 'high', 'urgent'] 
  }).default('medium'),
  recipientType: text("recipient_type", { 
    enum: ['all', 'students', 'teachers', 'parents', 'staff', 'specific'] 
  }).notNull(),
  recipientIds: integer("recipient_ids").array().default([]),
  classIds: integer("class_ids").array().default([]),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  scheduledFor: timestamp("scheduled_for"),
  expiresAt: timestamp("expires_at"),
  actionUrl: text("action_url"),
  imageUrl: text("image_url"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  recipientTypeIdx: index("notifications_recipient_type_idx").on(table.recipientType),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// EVENT AND CALENDAR MANAGEMENT
// ============================================================================

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleBn: text("title_bn"),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  allDay: boolean("all_day").default(false),
  location: text("location"),
  type: text("type", { 
    enum: ['exam', 'holiday', 'meeting', 'event', 'reminder'] 
  }).default('event'),
  status: text("status", { 
    enum: ['draft', 'published', 'cancelled'] 
  }).default('draft'),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceRule: text("recurrence_rule"),
  attendees: integer("attendees").array().default([]),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("events_date_idx").on(table.startDate),
  typeIdx: index("events_type_idx").on(table.type),
}));

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: json("value"),
  category: text("category").default('general'),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  schoolId: integer("school_id").references(() => schools.id),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  keyIdx: index("settings_key_idx").on(table.key),
  schoolKeyIdx: index("settings_school_key_idx").on(table.schoolId, table.key),
}));

// ============================================================================
// RELATIONS - Define relationships between tables
// ============================================================================

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  students: many(students),
  teachers: many(teachers),
  academicYears: many(academicYears),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id],
  }),
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  teacher: one(teachers, {
    fields: [users.id],
    references: [teachers.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [students.schoolId],
    references: [schools.id],
  }),
  borrowedBooks: many(libraryBorrowedBooks),
  attendance: many(attendance),
  feePayments: many(feePayments),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [teachers.schoolId],
    references: [schools.id],
  }),
  classes: many(classes),
}));

// ============================================================================
// SCHEMA EXPORTS - Zod schemas for validation
// ============================================================================

// School schemas
export const insertSchoolSchema = createInsertSchema(schools);
export const selectSchoolSchema = createSelectSchema(schools);
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = z.infer<typeof selectSchoolSchema>;

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

// Student schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectStudentSchema = createSelectSchema(students);
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = z.infer<typeof selectStudentSchema>;

// Teacher schemas
export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectTeacherSchema = createSelectSchema(teachers);
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = z.infer<typeof selectTeacherSchema>;

// Library schemas
export const insertLibraryBookSchema = createInsertSchema(libraryBooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLibraryBookSchema = createSelectSchema(libraryBooks);
export type InsertLibraryBook = z.infer<typeof insertLibraryBookSchema>;
export type LibraryBook = z.infer<typeof selectLibraryBookSchema>;

// Document schemas
export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});
export const selectDocumentTemplateSchema = createSelectSchema(documentTemplates);
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = z.infer<typeof selectDocumentTemplateSchema>;

// Notification schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
  readAt: true,
});
export const selectNotificationSchema = createSelectSchema(notifications);
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;

// Event schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});
export const selectEventSchema = createSelectSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = z.infer<typeof selectEventSchema>;

// Fee payment schemas
export const insertFeePaymentSchema = createInsertSchema(feePayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectFeePaymentSchema = createSelectSchema(feePayments);
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;
export type FeePayment = z.infer<typeof selectFeePaymentSchema>;

// Attendance schemas
export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});
export const selectAttendanceSchema = createSelectSchema(attendance);
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = z.infer<typeof selectAttendanceSchema>;