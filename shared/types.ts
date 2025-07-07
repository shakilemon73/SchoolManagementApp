// Common types used across the application

// Language types
export type Language = 'en' | 'bn' | 'ar';

// Document types
export type DocumentType = 
  | 'admitCard' 
  | 'classRoutine' 
  | 'teacherRoutine'
  | 'idCard'
  | 'expenseSheet'
  | 'paySheet'
  | 'resultSheet'
  | 'marksheet'
  | 'feeReceipt'
  | 'admissionForm'
  | 'testimonial'
  | 'other';

// Layout options for documents
export type LayoutType = '1' | '2' | '4' | '9';

// Document template types
export type TemplateType = 'modernBlue' | 'classicGreen' | 'traditional' | 'custom';

// User roles
export type UserRole = 'admin' | 'teacher' | 'staff' | 'student' | 'parent';

// School types
export type SchoolType = 'school' | 'college' | 'madrasha' | 'nurani';

// Student status types
export type StudentStatus = 'active' | 'inactive' | 'transferred' | 'graduated' | 'suspended';

// Teacher status types
export type TeacherStatus = 'active' | 'inactive' | 'transferred' | 'retired' | 'suspended';

// Payment methods
export type PaymentMethod = 'cash' | 'bankTransfer' | 'mobileBanking' | 'check' | 'other';

// Export types
export type ExportType = 'pdf' | 'excel' | 'csv';

// Import types
export type ImportType = 'excel' | 'csv';

// Print sizes
export type PrintSize = 'a4' | 'a5' | 'letter' | 'legal' | 'custom';
