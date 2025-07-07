-- Create admit card templates table
CREATE TABLE IF NOT EXISTS admit_card_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  description TEXT,
  category TEXT DEFAULT 'custom' NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  field_mappings JSONB,
  style_config JSONB,
  board_type TEXT,
  exam_level TEXT,
  subject_groups JSONB,
  page_size TEXT DEFAULT 'A4',
  orientation TEXT DEFAULT 'portrait',
  margins JSONB,
  header_config JSONB,
  footer_config JSONB,
  preview_url TEXT,
  thumbnail_url TEXT,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  school_id INTEGER,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admit cards table  
CREATE TABLE IF NOT EXISTS admit_cards (
  id SERIAL PRIMARY KEY,
  student_id INTEGER,
  exam_id INTEGER,
  template_id INTEGER REFERENCES admit_card_templates(id),
  
  -- Card Identification
  card_number TEXT UNIQUE NOT NULL,
  serial_number TEXT,
  
  -- Student Personal Information
  student_name TEXT NOT NULL,
  student_name_bn TEXT,
  father_name TEXT,
  father_name_bn TEXT,
  mother_name TEXT,
  mother_name_bn TEXT,
  student_photo TEXT,
  
  -- Academic Information
  roll_number TEXT NOT NULL,
  class_roll TEXT,
  registration_number TEXT,
  class_name TEXT NOT NULL,
  section TEXT,
  "group" TEXT,
  session TEXT,
  
  -- Institution Details
  college_code TEXT,
  college_name TEXT,
  college_name_bn TEXT,
  thana_upazilla TEXT,
  district TEXT,
  board_name TEXT,
  board_name_bn TEXT,
  
  -- Exam Information
  exam_type TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  exam_name_bn TEXT,
  exam_date DATE,
  exam_time TEXT,
  exam_center TEXT,
  exam_center_bn TEXT,
  exam_center_code TEXT,
  
  -- Subject Information
  subjects JSONB DEFAULT '[]',
  additional_subjects JSONB,
  
  -- Validity and Instructions
  valid_until DATE,
  exam_instructions TEXT,
  exam_instructions_bn TEXT,
  
  -- Signature Areas
  student_signature TEXT,
  head_of_institution_signature TEXT,
  inspector_signature TEXT,
  
  -- Security Features
  qr_code TEXT,
  verification_code TEXT,
  digital_signature TEXT,
  watermark TEXT,
  
  -- Status and Tracking
  issued_date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  print_count INTEGER DEFAULT 0,
  last_printed_at TIMESTAMP,
  
  -- Additional Fields
  special_instructions TEXT,
  special_instructions_bn TEXT,
  
  -- System Fields
  school_id INTEGER,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admit card history table
CREATE TABLE IF NOT EXISTS admit_card_history (
  id SERIAL PRIMARY KEY,
  admit_card_id INTEGER REFERENCES admit_cards(id) NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  performed_by INTEGER,
  performed_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert default templates
INSERT INTO admit_card_templates (
  name, name_bn, description, category, exam_level,
  template_data, style_config, is_active, is_default
) VALUES 
(
  'HSC Admit Card Template', 
  'এইচএসসি প্রবেশপত্র টেমপ্লেট', 
  'Standard HSC examination admit card template',
  'hsc',
  'hsc',
  '{"layout": "hsc_standard", "fields": ["student_name", "roll_number", "registration_number", "exam_center", "subjects"]}',
  '{"primaryColor": "#1e40af", "secondaryColor": "#3b82f6", "fontSize": "12px"}',
  true,
  true
),
(
  'SSC Admit Card Template', 
  'এসএসসি প্রবেশপত্র টেমপ্লেট', 
  'Standard SSC examination admit card template',
  'ssc',
  'ssc',
  '{"layout": "ssc_standard", "fields": ["student_name", "roll_number", "exam_center", "subjects"]}',
  '{"primaryColor": "#059669", "secondaryColor": "#10b981", "fontSize": "12px"}',
  true,
  false
),
(
  'JSC Admit Card Template', 
  'জেএসসি প্রবেশপত্র টেমপ্লেট', 
  'Standard JSC examination admit card template',
  'jsc',
  'jsc',
  '{"layout": "jsc_standard", "fields": ["student_name", "roll_number", "exam_center", "subjects"]}',
  '{"primaryColor": "#dc2626", "secondaryColor": "#ef4444", "fontSize": "12px"}',
  true,
  false
)
ON CONFLICT (name) DO NOTHING;