-- Complete Supabase Database Setup SQL
-- Run this in your Supabase SQL Editor to create all required tables

-- Create app_users table (renamed to avoid conflicts with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.app_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL,
  school_id INTEGER,
  student_id INTEGER,
  credits INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  profile_picture TEXT,
  phone_number TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_in_bangla TEXT,
  student_id TEXT UNIQUE NOT NULL,
  class TEXT,
  section TEXT,
  roll_number TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  father_name TEXT,
  father_name_in_bangla TEXT,
  mother_name TEXT,
  mother_name_in_bangla TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_relation TEXT,
  present_address TEXT,
  permanent_address TEXT,
  village TEXT,
  post_office TEXT,
  thana TEXT,
  district TEXT,
  division TEXT,
  phone TEXT,
  email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_phone TEXT,
  school_id INTEGER,
  status TEXT DEFAULT 'active',
  photo TEXT,
  id_card_issue_date DATE,
  id_card_valid_until DATE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create document_templates table
CREATE TABLE IF NOT EXISTS public.document_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  description_bn TEXT,
  template JSONB,
  preview TEXT,
  is_global BOOLEAN DEFAULT false,
  required_credits INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0',
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  icon TEXT,
  difficulty TEXT DEFAULT 'easy',
  estimated_time TEXT,
  is_popular BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_bn TEXT,
  message TEXT NOT NULL,
  message_bn TEXT,
  type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  user_id INTEGER,
  school_id INTEGER DEFAULT 1,
  data JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  principal_name TEXT,
  established_year INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert default admin user
INSERT INTO public.app_users (username, name, email, password_hash, role, is_admin, credits)
VALUES ('admin', 'System Administrator', 'admin@school.edu.bd', '$2b$10$vI3GbFwGG3kRCZa4/eAJhe7QFKzxgvVBGUGwG7QsKKK3nFJp4fQQG', 'admin', true, 1000)
ON CONFLICT (username) DO NOTHING;

-- Insert sample document templates
INSERT INTO public.document_templates (name, name_bn, type, category, description, description_bn, is_global, required_credits, is_active) VALUES
('Student ID Card', 'ছাত্র পরিচয়পত্র', 'id_card', 'student', 'Generate student identification cards', 'ছাত্র পরিচয়পত্র তৈরি করুন', true, 1, true),
('Admit Card', 'প্রবেশপত্র', 'admit_card', 'examination', 'Generate examination admit cards', 'পরীক্ষার প্রবেশপত্র তৈরি করুন', true, 1, true),
('Certificate', 'সনদপত্র', 'certificate', 'academic', 'Generate academic certificates', 'একাডেমিক সনদপত্র তৈরি করুন', true, 2, true),
('Transfer Certificate', 'স্থানান্তর সনদ', 'transfer_certificate', 'academic', 'Generate transfer certificates', 'স্থানান্তর সনদপত্র তৈরি করুন', true, 2, true),
('Character Certificate', 'চরিত্র সনদ', 'character_certificate', 'academic', 'Generate character certificates', 'চরিত্র সনদপত্র তৈরি করুন', true, 2, true)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these later for better security)
CREATE POLICY "Allow all access to app_users" ON public.app_users FOR ALL USING (true);
CREATE POLICY "Allow all access to students" ON public.students FOR ALL USING (true);
CREATE POLICY "Allow all access to document_templates" ON public.document_templates FOR ALL USING (true);
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow all access to schools" ON public.schools FOR ALL USING (true);