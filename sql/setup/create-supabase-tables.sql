-- Create comprehensive tables for all modules in Supabase

-- Library Management Tables
CREATE TABLE IF NOT EXISTS library_books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    publisher VARCHAR(255),
    publish_year INTEGER,
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    school_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_borrowed_books (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES library_books(id),
    student_id INTEGER REFERENCES students(id),
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    school_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Management Tables
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_price DECIMAL(10,2) DEFAULT 0,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    minimum_threshold INTEGER NOT NULL DEFAULT 10,
    unit VARCHAR(50) NOT NULL,
    supplier VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    description TEXT,
    school_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory_items(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    reference VARCHAR(100),
    notes TEXT,
    school_id INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transport Management Tables
CREATE TABLE IF NOT EXISTS transport_routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_point VARCHAR(255) NOT NULL,
    end_point VARCHAR(255) NOT NULL,
    distance DECIMAL(8,2) DEFAULT 0,
    estimated_time INTEGER DEFAULT 0,
    fare DECIMAL(8,2) DEFAULT 0,
    stops TEXT[], -- Array of stop names
    is_active BOOLEAN DEFAULT true,
    school_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    helper_name VARCHAR(255),
    helper_phone VARCHAR(20),
    route_id INTEGER REFERENCES transport_routes(id),
    is_active BOOLEAN DEFAULT true,
    school_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_student_assignments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    route_id INTEGER REFERENCES transport_routes(id),
    pickup_stop VARCHAR(255) NOT NULL,
    drop_stop VARCHAR(255) NOT NULL,
    monthly_fee DECIMAL(8,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    school_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial Management Tables
CREATE TABLE IF NOT EXISTS financial_transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference VARCHAR(100),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    school_id INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_bn TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    category VARCHAR(100) NOT NULL,
    category_bn VARCHAR(100) NOT NULL,
    recipient_id INTEGER REFERENCES users(id),
    sender VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    action_required BOOLEAN DEFAULT false,
    school_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data for all modules

-- Library Books
INSERT INTO library_books (title, title_bn, author, isbn, category, publisher, publish_year, total_copies, available_copies, location, description) VALUES
('Advanced Mathematics', 'উচ্চতর গণিত', 'ড. মোহাম্মদ আলী', '978-984-123-456-7', 'textbook', 'বাংলা প্রকাশনী', 2024, 15, 12, 'শেলফ A-১', 'দশম শ্রেণীর গণিত বই'),
('Bengali Literature', 'বাংলা সাহিত্য', 'রবীন্দ্রনাথ ঠাকুর', '978-984-234-567-8', 'literature', 'সাহিত্য প্রকাশন', 2023, 20, 18, 'শেলফ B-২', 'বাংলা সাহিত্যের সংকলন'),
('Physics Fundamentals', 'পদার্থবিজ্ঞানের মূলভিত্তি', 'ড. আব্দুল করিম', '978-984-345-678-9', 'science', 'বিজ্ঞান প্রকাশনী', 2024, 12, 8, 'শেলফ C-৩', 'নবম ও দশম শ্রেণীর পদার্থবিজ্ঞান'),
('English Grammar', 'ইংরেজি ব্যাকরণ', 'শামসুর রহমান', '978-984-456-789-0', 'textbook', 'ইংরেজি প্রকাশনী', 2024, 25, 20, 'শেলফ D-৪', 'ইংরেজি ব্যাকরণ ও রচনা'),
('History of Bangladesh', 'বাংলাদেশের ইতিহাস', 'ড. আহমদ শরীফ', '978-984-567-890-1', 'history', 'ইতিহাস প্রকাশনী', 2023, 18, 15, 'শেলফ E-৫', 'বাংলাদেশের স্বাধীনতা যুদ্ধের ইতিহাস');

-- Library Borrowed Books
INSERT INTO library_borrowed_books (book_id, student_id, borrow_date, due_date, status) VALUES
(1, 1, '2025-06-01', '2025-06-15', 'active'),
(3, 2, '2025-06-03', '2025-06-17', 'active'),
(4, 3, '2025-05-28', '2025-06-11', 'overdue');

-- Inventory Items
INSERT INTO inventory_items (name, name_bn, category, brand, model, purchase_price, current_quantity, minimum_threshold, unit, location, condition, description) VALUES
('Desktop Computer', 'ডেস্কটপ কম্পিউটার', 'electronics', 'Dell', 'OptiPlex 3090', 45000, 25, 5, 'piece', 'কম্পিউটার ল্যাব', 'good', 'শিক্ষার্থীদের জন্য কম্পিউটার'),
('Whiteboard', 'হোয়াইটবোর্ড', 'furniture', 'Standard', NULL, 1500, 30, 10, 'piece', 'স্টোর রুম A', 'good', 'ক্লাসরুমের জন্য হোয়াইটবোর্ড'),
('Projector', 'প্রজেক্টর', 'electronics', 'Epson', 'EB-X06', 35000, 3, 2, 'piece', 'AV রুম', 'excellent', 'প্রেজেন্টেশনের জন্য প্রজেক্টর'),
('Office Chair', 'অফিস চেয়ার', 'furniture', 'Local', NULL, 3500, 50, 15, 'piece', 'স্টোর রুম B', 'good', 'শিক্ষক ও কর্মচারীদের জন্য চেয়ার'),
('Printer', 'প্রিন্টার', 'electronics', 'HP', 'LaserJet Pro', 25000, 8, 3, 'piece', 'অফিস', 'good', 'ডকুমেন্ট প্রিন্টিংয়ের জন্য');

-- Inventory Movements
INSERT INTO inventory_movements (item_id, type, quantity, reason, created_by) VALUES
(1, 'in', 10, 'নতুন ক্রয়', 1),
(3, 'out', 2, 'মেরামতের জন্য', 1),
(2, 'in', 15, 'সাপ্লাই থেকে প্রাপ্ত', 1);

-- Transport Routes
INSERT INTO transport_routes (name, start_point, end_point, distance, estimated_time, fare, stops) VALUES
('ধানমন্ডি - স্কুল', 'ধানমন্ডি', 'স্কুল', 15, 45, 1200, ARRAY['ধানমন্ডি', 'কলাবাগান', 'রমনা', 'স্কুল']),
('উত্তরা - স্কুল', 'উত্তরা', 'স্কুল', 25, 60, 1500, ARRAY['উত্তরা', 'শাহবাগ', 'পল্টন', 'স্কুল']),
('মিরপুর - স্কুল', 'মিরপুর', 'স্কুল', 18, 50, 1300, ARRAY['মিরপুর', 'কাজীপাড়া', 'শ্যামলী', 'স্কুল']);

-- Transport Vehicles
INSERT INTO transport_vehicles (vehicle_number, type, capacity, driver_name, driver_phone, helper_name, helper_phone, route_id) VALUES
('ঢাকা মেট্রো-গ-১২৩৪', 'bus', 40, 'মোহাম্মদ আলী', '01712345001', 'করিম উদ্দিন', '01887654321', 1),
('ঢাকা মেট্রো-খ-৫৬৭৮', 'microbus', 20, 'আব্দুল রহমান', '01987654321', NULL, NULL, 2),
('ঢাকা মেট্রো-ঘ-৯১০১', 'van', 12, 'মো. রফিক', '01612345678', NULL, NULL, 3);

-- Transport Student Assignments
INSERT INTO transport_student_assignments (student_id, route_id, pickup_stop, drop_stop, monthly_fee) VALUES
(1, 1, 'ধানমন্ডি', 'স্কুল', 1200),
(2, 2, 'উত্তরা', 'স্কুল', 1500);

-- Financial Transactions
INSERT INTO financial_transactions (amount, type, category, description, payment_method, created_by) VALUES
(50000, 'income', 'fee', 'জুন মাসের টিউশন ফি সংগ্রহ', 'bank_transfer', 1),
(25000, 'expense', 'salary', 'শিক্ষকদের বেতন প্রদান', 'bank_transfer', 1),
(15000, 'expense', 'utility', 'বিদ্যুৎ বিল পরিশোধ', 'cash', 1),
(35000, 'income', 'fee', 'ভর্তি ফি সংগ্রহ', 'bkash', 1);

-- Notifications
INSERT INTO notifications (title, title_bn, message, message_bn, type, priority, category, category_bn, sender, recipient_id) VALUES
('নতুন বই সংযোজিত হয়েছে', 'নতুন বই সংযোজিত হয়েছে', 'গণিত অংক সমাধান বই লাইব্রেরিতে নতুন এসেছে। আগ্রহী শিক্ষার্থীরা ইস্যু করতে পারেন।', 'গণিত অংক সমাধান বই লাইব্রেরিতে নতুন এসেছে। আগ্রহী শিক্ষার্থীরা ইস্যু করতে পারেন।', 'info', 'medium', 'library', 'গ্রন্থাগার', 'গ্রন্থাগারিক', 1),
('বই ফেরত দেওয়ার অনুরোধ', 'বই ফেরত দেওয়ার অনুরোধ', 'আমিনুল ইসলাম - বাংলা ব্যাকরণ বইটি ১৫ দিন অতিক্রম করেছে। দয়া করে আজই ফেরত দিন।', 'আমিনুল ইসলাম - বাংলা ব্যাকরণ বইটি ১৫ দিন অতিক্রম করেছে। দয়া করে আজই ফেরত দিন।', 'warning', 'high', 'library', 'গ্রন্থাগার', 'গ্রন্থাগারিক', 1),
('নতুন পরিবহন রুট চালু', 'নতুন পরিবহন রুট চালু', 'উত্তরা থেকে স্কুল পর্যন্ত নতুন বাস সেবা চালু হয়েছে। মাসিক ভাড়া ১৫০০ টাকা।', 'উত্তরা থেকে স্কুল পর্যন্ত নতুন বাস সেবা চালু হয়েছে। মাসিক ভাড়া ১৫০০ টাকা।', 'success', 'medium', 'transport', 'পরিবহন', 'পরিবহন বিভাগ', 1),
('ইনভেন্টরি আপডেট', 'ইনভেন্টরি আপডেট', 'কম্পিউটার ল্যাবের জন্য ১০টি নতুন কম্পিউটার ক্রয় করা হয়েছে। শীঘ্রই ইনস্টল করা হবে।', 'কম্পিউটার ল্যাবের জন্য ১০টি নতুন কম্পিউটার ক্রয় করা হয়েছে। শীঘ্রই ইনস্টল করা হবে।', 'info', 'low', 'inventory', 'ইনভেন্টরি', 'প্রশাসন', 1);