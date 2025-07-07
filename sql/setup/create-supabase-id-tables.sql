-- Create ID Card Templates table
CREATE TABLE IF NOT EXISTS id_card_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  description TEXT,
  category TEXT DEFAULT 'student' NOT NULL,
  template_data JSONB NOT NULL,
  style_config JSONB,
  page_size TEXT DEFAULT 'A4',
  orientation TEXT DEFAULT 'portrait',
  primary_color TEXT DEFAULT '#1e40af',
  secondary_color TEXT DEFAULT '#3b82f6',
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

-- Create ID Cards table
CREATE TABLE IF NOT EXISTS id_cards (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  template_id INTEGER,
  card_number TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  student_name_bn TEXT,
  student_photo TEXT,
  roll_number TEXT NOT NULL,
  class_name TEXT NOT NULL,
  section TEXT NOT NULL,
  session TEXT NOT NULL,
  date_of_birth DATE,
  blood_group TEXT,
  father_name TEXT,
  mother_name TEXT,
  guardian_phone TEXT,
  address TEXT,
  school_name TEXT,
  school_address TEXT,
  eiin TEXT,
  school_logo TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  status TEXT DEFAULT 'active' NOT NULL,
  generated_pdf TEXT,
  generated_image TEXT,
  school_id INTEGER,
  generated_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default ID card template
INSERT INTO id_card_templates (
  name, name_bn, description, category, template_data, style_config, is_default
) VALUES (
  'Modern Student ID Card',
  'আধুনিক শিক্ষার্থী পরিচয়পত্র',
  'Modern design with school logo and student photo',
  'student',
  '{"layout": "modern", "fields": ["name", "id", "class", "photo"]}',
  '{"primaryColor": "#1e40af", "secondaryColor": "#3b82f6"}',
  true
) ON CONFLICT DO NOTHING;

-- Insert sample ID card data for testing
INSERT INTO id_cards (
  student_id, card_number, student_name, student_name_bn, roll_number,
  class_name, section, session, blood_group, father_name, mother_name,
  guardian_phone, address, school_name, school_address, eiin, school_id, generated_by
) VALUES 
(
  1, 'IDC-' || EXTRACT(EPOCH FROM NOW())::bigint || '-001',
  'Mohammad Rahman', 'মোহাম্মদ রহমান', '001',
  'দশম', 'ক', '২০২৪-২৫', 'O+', 'আব্দুল রহমান', 'ফাতিমা বেগম',
  '01711223344', 'ঢাকা, বাংলাদেশ', 'আদর্শ উচ্চ বিদ্যালয়',
  'ঢাকা, বাংলাদেশ', '123456', 1, 1
),
(
  2, 'IDC-' || EXTRACT(EPOCH FROM NOW())::bigint || '-002',
  'Fatima Khatun', 'ফাতিমা খাতুন', '002',
  'নবম', 'খ', '২০২৪-২৫', 'A+', 'আলী হোসেন', 'রাশিদা বেগম',
  '01811334455', 'চট্টগ্রাম, বাংলাদেশ', 'আদর্শ উচ্চ বিদ্যালয়',
  'ঢাকা, বাংলাদেশ', '123456', 1, 1
)
ON CONFLICT (card_number) DO NOTHING;