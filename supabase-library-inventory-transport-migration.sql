-- Comprehensive Supabase Migration for Library, Inventory, and Transport Modules
-- This script creates all necessary tables with proper indexes and constraints

-- Create library_books table
CREATE TABLE IF NOT EXISTS public.library_books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  category TEXT NOT NULL,
  publisher TEXT,
  publish_year INTEGER,
  total_copies INTEGER DEFAULT 1 NOT NULL,
  available_copies INTEGER DEFAULT 1 NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  school_id INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create library_borrowed_books table
CREATE TABLE IF NOT EXISTS public.library_borrowed_books (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES library_books(id) NOT NULL,
  student_id INTEGER NOT NULL,
  borrow_date DATE DEFAULT CURRENT_DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status TEXT DEFAULT 'active' NOT NULL,
  fine DECIMAL(8,2) DEFAULT 0,
  notes TEXT,
  school_id INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  unit_price DECIMAL(10,2) DEFAULT 0,
  current_quantity INTEGER DEFAULT 0 NOT NULL,
  minimum_threshold INTEGER DEFAULT 10 NOT NULL,
  unit TEXT NOT NULL,
  supplier TEXT,
  location TEXT NOT NULL,
  condition TEXT NOT NULL,
  description TEXT,
  school_id INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create inventory_movements table
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES inventory_items(id) NOT NULL,
  type TEXT NOT NULL, -- in, out, adjustment
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  school_id INTEGER DEFAULT 1 NOT NULL,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create transport_routes table
CREATE TABLE IF NOT EXISTS public.transport_routes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fare DECIMAL(8,2) NOT NULL,
  vehicle_id INTEGER,
  school_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create transport_vehicles table
CREATE TABLE IF NOT EXISTS public.transport_vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_number TEXT NOT NULL,
  type TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  helper_name TEXT,
  helper_phone TEXT,
  route_id INTEGER REFERENCES transport_routes(id),
  is_active BOOLEAN DEFAULT true,
  school_id INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create transport_student_assignments table
CREATE TABLE IF NOT EXISTS public.transport_student_assignments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  route_id INTEGER REFERENCES transport_routes(id) NOT NULL,
  vehicle_id INTEGER REFERENCES transport_vehicles(id),
  pickup_point TEXT NOT NULL,
  drop_point TEXT NOT NULL,
  monthly_fee DECIMAL(8,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  school_id INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample library data
INSERT INTO library_books (title, title_bn, author, category, publisher, publish_year, total_copies, available_copies, location) VALUES
('Computer Science Fundamentals', 'কম্পিউটার বিজ্ঞানের মূলনীতি', 'Dr. Ahmed Rahman', 'Technology', 'Dhaka Publishers', 2023, 5, 5, 'Section A-1'),
('Bengali Literature', 'বাংলা সাহিত্য', 'Kazi Nazrul Islam', 'Literature', 'Bangla Academy', 2022, 8, 7, 'Section B-2'),
('Mathematics for Class X', 'দশম শ্রেণীর গণিত', 'Prof. Mohammad Ali', 'Mathematics', 'Education Board', 2023, 10, 9, 'Section C-1'),
('Physics Concepts', 'পদার্থবিজ্ঞানের ধারণা', 'Dr. Fatima Khan', 'Science', 'Science Publications', 2023, 6, 6, 'Section D-1'),
('History of Bangladesh', 'বাংলাদেশের ইতিহাস', 'Professor Anisul Haque', 'History', 'National Publishers', 2022, 7, 7, 'Section E-1');

-- Insert sample inventory data
INSERT INTO inventory_items (name, name_bn, category, unit, current_quantity, minimum_threshold, location, condition) VALUES
('Whiteboard Markers', 'হোয়াইটবোর্ড মার্কার', 'Office Supplies', 'পিস', 50, 20, 'Main Store', 'Good'),
('A4 Paper Ream', 'এ৪ কাগজ রিম', 'Stationery', 'রিম', 25, 10, 'Store Room', 'New'),
('Desktop Computer', 'ডেস্কটপ কম্পিউটার', 'Electronics', 'সেট', 15, 5, 'Computer Lab', 'Working'),
('Football', 'ফুটবল', 'Sports Equipment', 'পিস', 8, 3, 'Sports Room', 'Good'),
('Science Lab Equipment', 'বিজ্ঞান গবেষণাগার সরঞ্জাম', 'Laboratory', 'সেট', 12, 5, 'Science Lab', 'Good');

-- Insert sample transport data
INSERT INTO transport_routes (name, description, fare) VALUES
('Route A - Dhanmondi', 'Dhanmondi to School via Elephant Road', 1500.00),
('Route B - Uttara', 'Uttara to School via Airport Road', 1800.00),
('Route C - Gulshan', 'Gulshan to School via Tejgaon', 1600.00),
('Route D - Wari', 'Wari to School via Paltan', 1400.00);

INSERT INTO transport_vehicles (vehicle_number, type, capacity, driver_name, driver_phone, helper_name, helper_phone, route_id) VALUES
('DHK-GA-11-2345', 'Bus', 40, 'Mohammad Karim', '+8801712345678', 'Abdul Rahman', '+8801812345679', 1),
('DHK-GA-11-2346', 'Microbus', 20, 'Rashid Ahmed', '+8801712345680', 'Hafiz Uddin', '+8801812345681', 2),
('DHK-GA-11-2347', 'Bus', 35, 'Nasir Hossain', '+8801712345682', 'Belal Ahmed', '+8801812345683', 3),
('DHK-GA-11-2348', 'Van', 15, 'Shahid Mia', '+8801712345684', 'Monir Hossain', '+8801812345685', 4);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_library_books_category ON library_books(category);
CREATE INDEX IF NOT EXISTS idx_library_books_school_id ON library_books(school_id);
CREATE INDEX IF NOT EXISTS idx_library_borrowed_books_student_id ON library_borrowed_books(student_id);
CREATE INDEX IF NOT EXISTS idx_library_borrowed_books_status ON library_borrowed_books(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_school_id ON inventory_items(school_id);
CREATE INDEX IF NOT EXISTS idx_transport_vehicles_route_id ON transport_vehicles(route_id);
CREATE INDEX IF NOT EXISTS idx_transport_assignments_student_id ON transport_student_assignments(student_id);

-- Enable Row Level Security (RLS)
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_borrowed_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_student_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic school-based access)
CREATE POLICY "Users can view library books from their school" ON library_books
    FOR SELECT USING (school_id = 1);

CREATE POLICY "Users can view library borrowed books from their school" ON library_borrowed_books
    FOR SELECT USING (school_id = 1);

CREATE POLICY "Users can view inventory items from their school" ON inventory_items
    FOR SELECT USING (school_id = 1);

CREATE POLICY "Users can view transport data from their school" ON transport_routes
    FOR SELECT USING (school_id = 1);

CREATE POLICY "Users can view transport vehicles from their school" ON transport_vehicles
    FOR SELECT USING (school_id = 1);

-- Grant necessary permissions
GRANT ALL ON library_books TO postgres, anon, authenticated;
GRANT ALL ON library_borrowed_books TO postgres, anon, authenticated;
GRANT ALL ON inventory_items TO postgres, anon, authenticated;
GRANT ALL ON inventory_movements TO postgres, anon, authenticated;
GRANT ALL ON transport_routes TO postgres, anon, authenticated;
GRANT ALL ON transport_vehicles TO postgres, anon, authenticated;
GRANT ALL ON transport_student_assignments TO postgres, anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;