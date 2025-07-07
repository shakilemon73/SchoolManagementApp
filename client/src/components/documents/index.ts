// Document generator exports
export { IdCardGenerator } from './id-card-generator';
export { ReceiptGenerator } from './receipt-generator';
export { AdmitCardGenerator } from './admit-card-generator';
export { MarksheetGenerator } from './marksheet-generator';
export { SalarySlipGenerator } from './salary-slip-generator';
export { ClassRoutineGenerator } from './class-routine-generator';
export { CertificateGenerator } from './certificate-generator';

// Template and utility exports
export { DocumentPageTemplate } from './DocumentPageTemplate';
export { TemplateSelector } from './template-selector';
export { LayoutSelector } from './layout-selector';
export { FeeTable } from './fee-table';

// Preview components
export { IdCardPreview } from './id-card-preview';
export { BangladeshIdCardPreview } from './bangladesh-id-card-preview';

// Style and template files
export { bangladeshIdTemplates } from './bangladesh-id-templates';
export { BangladeshIdTemplateSelector } from './bangladesh-id-template-selector';
export { IdCardTemplates } from './id-card-templates';

// Document type mappings for routing
export const documentGeneratorMap = {
  // Student Documents
  'student-id-cards': IdCardGenerator,
  'admit-cards': AdmitCardGenerator,
  'fee-receipts': ReceiptGenerator,
  'marksheets': MarksheetGenerator,
  'result-sheets': MarksheetGenerator, // Same component, different template
  'testimonials': CertificateGenerator,
  'transfer-certificates': CertificateGenerator,
  'character-certificates': CertificateGenerator,
  'leaving-certificates': CertificateGenerator,
  'progress-reports': MarksheetGenerator,
  'attendance-certificates': CertificateGenerator,
  'merit-certificates': CertificateGenerator,

  // Teacher Documents
  'teacher-id-cards': IdCardGenerator,
  'class-routines': ClassRoutineGenerator,
  'teacher-routines': ClassRoutineGenerator,
  'exam-papers': CertificateGenerator, // Generic document template
  'omr-sheets': CertificateGenerator,
  'mcq-formats': CertificateGenerator,
  'question-formats': CertificateGenerator,
  'lesson-plans': CertificateGenerator,
  'assignment-sheets': CertificateGenerator,
  'attendance-sheets': CertificateGenerator,
  'grade-books': MarksheetGenerator,
  'parent-letters': CertificateGenerator,

  // Administrative Documents
  'staff-id-cards': IdCardGenerator,
  'meeting-minutes': CertificateGenerator,
  'notice-boards': CertificateGenerator,
  'event-invitations': CertificateGenerator,
  'school-calendars': ClassRoutineGenerator,
  'admission-forms': CertificateGenerator,
  'registration-forms': CertificateGenerator,
  'emergency-forms': CertificateGenerator,
  'school-reports': CertificateGenerator,
  'policy-documents': CertificateGenerator,

  // Financial Documents
  'salary-slips': SalarySlipGenerator,
  'fee-vouchers': ReceiptGenerator,
  'financial-reports': CertificateGenerator,
  'budget-plans': CertificateGenerator,
  'expense-reports': CertificateGenerator,
  'income-statements': CertificateGenerator,
  'tax-documents': CertificateGenerator,
  'audit-reports': CertificateGenerator,
  'donation-receipts': ReceiptGenerator,
  'purchase-orders': CertificateGenerator,
};

// Document categories for navigation
export const documentCategories = {
  student: {
    name: 'Student Documents',
    nameBn: 'শিক্ষার্থী নথি',
    icon: 'Users',
    color: 'blue',
    documents: [
      'student-id-cards',
      'admit-cards',
      'fee-receipts',
      'marksheets',
      'result-sheets',
      'testimonials',
      'transfer-certificates',
      'character-certificates',
      'leaving-certificates',
      'progress-reports',
      'attendance-certificates',
      'merit-certificates',
    ]
  },
  teacher: {
    name: 'Teacher Documents',
    nameBn: 'শিক্ষক নথি',
    icon: 'GraduationCap',
    color: 'green',
    documents: [
      'teacher-id-cards',
      'class-routines',
      'teacher-routines',
      'exam-papers',
      'omr-sheets',
      'mcq-formats',
      'question-formats',
      'lesson-plans',
      'assignment-sheets',
      'attendance-sheets',
      'grade-books',
      'parent-letters',
    ]
  },
  admin: {
    name: 'Administrative Documents',
    nameBn: 'প্রশাসনিক নথি',
    icon: 'Building',
    color: 'purple',
    documents: [
      'staff-id-cards',
      'meeting-minutes',
      'notice-boards',
      'event-invitations',
      'school-calendars',
      'admission-forms',
      'registration-forms',
      'emergency-forms',
      'school-reports',
      'policy-documents',
    ]
  },
  financial: {
    name: 'Financial Documents',
    nameBn: 'আর্থিক নথি',
    icon: 'DollarSign',
    color: 'orange',
    documents: [
      'salary-slips',
      'fee-vouchers',
      'financial-reports',
      'budget-plans',
      'expense-reports',
      'income-statements',
      'tax-documents',
      'audit-reports',
      'donation-receipts',
      'purchase-orders',
    ]
  }
};

// Helper function to get component by document type
export const getDocumentGenerator = (documentType: string) => {
  return documentGeneratorMap[documentType as keyof typeof documentGeneratorMap];
};

// Helper function to get category by document type
export const getDocumentCategory = (documentType: string) => {
  for (const [categoryKey, category] of Object.entries(documentCategories)) {
    if (category.documents.includes(documentType)) {
      return categoryKey;
    }
  }
  return 'admin'; // Default fallback
};

// Helper function to get document display name
export const getDocumentDisplayName = (documentType: string): { en: string; bn: string } => {
  const displayNames: Record<string, { en: string; bn: string }> = {
    'student-id-cards': { en: 'Student ID Cards', bn: 'শিক্ষার্থী পরিচয়পত্র' },
    'admit-cards': { en: 'Admit Cards', bn: 'প্রবেশপত্র' },
    'fee-receipts': { en: 'Fee Receipts', bn: 'বেতন রসিদ' },
    'marksheets': { en: 'Marksheets', bn: 'নম্বরপত্র' },
    'result-sheets': { en: 'Result Sheets', bn: 'ফলাফল পত্র' },
    'testimonials': { en: 'Testimonials', bn: 'প্রশংসাপত্র' },
    'transfer-certificates': { en: 'Transfer Certificates', bn: 'স্থানান্তর সনদ' },
    'character-certificates': { en: 'Character Certificates', bn: 'চরিত্র সনদ' },
    'leaving-certificates': { en: 'Leaving Certificates', bn: 'ত্যাগপত্র' },
    'progress-reports': { en: 'Progress Reports', bn: 'অগ্রগতি প্রতিবেদন' },
    'attendance-certificates': { en: 'Attendance Certificates', bn: 'উপস্থিতি সনদ' },
    'merit-certificates': { en: 'Merit Certificates', bn: 'মেধা সনদ' },
    'teacher-id-cards': { en: 'Teacher ID Cards', bn: 'শিক্ষক পরিচয়পত্র' },
    'class-routines': { en: 'Class Routines', bn: 'ক্লাস রুটিন' },
    'teacher-routines': { en: 'Teacher Routines', bn: 'শিক্ষক রুটিন' },
    'exam-papers': { en: 'Exam Papers', bn: 'পরীক্ষার প্রশ্নপত্র' },
    'omr-sheets': { en: 'OMR Sheets', bn: 'ওএমআর শীট' },
    'mcq-formats': { en: 'MCQ Formats', bn: 'এমসিকিউ ফরম্যাট' },
    'question-formats': { en: 'Question Paper Formats', bn: 'প্রশ্নপত্র ফরম্যাট' },
    'lesson-plans': { en: 'Lesson Plans', bn: 'পাঠ পরিকল্পনা' },
    'assignment-sheets': { en: 'Assignment Sheets', bn: 'অ্যাসাইনমেন্ট শীট' },
    'attendance-sheets': { en: 'Attendance Sheets', bn: 'উপস্থিতি শীট' },
    'grade-books': { en: 'Grade Books', bn: 'গ্রেড বুক' },
    'parent-letters': { en: 'Parent Communication Letters', bn: 'অভিভাবক পত্র' },
    'staff-id-cards': { en: 'Staff ID Cards', bn: 'কর্মচারী পরিচয়পত্র' },
    'meeting-minutes': { en: 'Meeting Minutes', bn: 'সভার কার্যবিবরণী' },
    'notice-boards': { en: 'Notice Boards', bn: 'নোটিশ বোর্ড' },
    'event-invitations': { en: 'Event Invitations', bn: 'অনুষ্ঠানের আমন্ত্রণ' },
    'school-calendars': { en: 'School Calendars', bn: 'স্কুল ক্যালেন্ডার' },
    'admission-forms': { en: 'Admission Forms', bn: 'ভর্তি ফরম' },
    'registration-forms': { en: 'Registration Forms', bn: 'নিবন্ধন ফরম' },
    'emergency-forms': { en: 'Emergency Contact Forms', bn: 'জরুরি যোগাযোগ ফরম' },
    'school-reports': { en: 'School Reports', bn: 'স্কুল প্রতিবেদন' },
    'policy-documents': { en: 'Policy Documents', bn: 'নীতিমালা নথি' },
    'salary-slips': { en: 'Salary Slips', bn: 'বেতনপত্র' },
    'fee-vouchers': { en: 'Fee Vouchers', bn: 'বেতন ভাউচার' },
    'financial-reports': { en: 'Financial Reports', bn: 'আর্থিক প্রতিবেদন' },
    'budget-plans': { en: 'Budget Plans', bn: 'বাজেট পরিকল্পনা' },
    'expense-reports': { en: 'Expense Reports', bn: 'ব্যয় প্রতিবেদন' },
    'income-statements': { en: 'Income Statements', bn: 'আয়ের বিবরণী' },
    'tax-documents': { en: 'Tax Documents', bn: 'কর নথি' },
    'audit-reports': { en: 'Audit Reports', bn: 'নিরীক্ষা প্রতিবেদন' },
    'donation-receipts': { en: 'Donation Receipts', bn: 'দান রসিদ' },
    'purchase-orders': { en: 'Purchase Orders', bn: 'ক্রয় আদেশ' },
  };

  return displayNames[documentType] || { en: documentType, bn: documentType };
};