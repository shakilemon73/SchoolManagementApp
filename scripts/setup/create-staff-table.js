import { createClient } from '@supabase/supabase-js';

async function createStaffTable() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create staff table
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS staff (
          id SERIAL PRIMARY KEY,
          staff_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          name_in_bangla TEXT,
          department TEXT,
          designation TEXT,
          date_of_birth DATE,
          gender TEXT,
          address TEXT,
          phone TEXT,
          email TEXT,
          join_date DATE,
          salary INTEGER,
          school_id INTEGER,
          status TEXT DEFAULT 'active' NOT NULL,
          photo TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        -- Insert sample staff data
        INSERT INTO staff (staff_id, name, name_in_bangla, department, designation, phone, email, school_id, status) VALUES
        ('STF-001', 'Abdul Rahman', 'আব্দুল রহমান', 'Administration', 'Administrative Officer', '+8801712345678', 'rahman@unityschool.edu.bd', 1, 'active'),
        ('STF-002', 'Fatima Khatun', 'ফাতিমা খাতুন', 'Accounts', 'Accountant', '+8801812345678', 'fatima@unityschool.edu.bd', 1, 'active')
        ON CONFLICT (staff_id) DO NOTHING;
      `
    });

    if (error) {
      console.error('Error creating staff table:', error);
    } else {
      console.log('✓ Staff table created successfully with sample data');
    }

  } catch (error) {
    console.error('Exception creating staff table:', error);
  }
}

createStaffTable();