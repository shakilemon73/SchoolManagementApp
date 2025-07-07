import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase database connection...');

    // Test app_users table
    const { data: usersData, error: usersError } = await supabase
      .from('app_users')
      .select('count(*)')
      .limit(1);
    
    if (usersError) {
      console.log('❌ app_users table error:', usersError.message);
    } else {
      console.log('✅ app_users table accessible');
    }

    // Test students table
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('count(*)')
      .limit(1);
    
    if (studentsError) {
      console.log('❌ students table error:', studentsError.message);
    } else {
      console.log('✅ students table accessible');
    }

    // Test document_templates table
    const { data: templatesData, error: templatesError } = await supabase
      .from('document_templates')
      .select('count(*)')
      .limit(1);
    
    if (templatesError) {
      console.log('❌ document_templates table error:', templatesError.message);
    } else {
      console.log('✅ document_templates table accessible');
    }

    // Test admin user exists
    const { data: adminData, error: adminError } = await supabase
      .from('app_users')
      .select('username, role, is_admin')
      .eq('username', 'admin')
      .limit(1);
    
    if (adminError) {
      console.log('❌ Admin user check failed:', adminError.message);
    } else if (adminData && adminData.length > 0) {
      console.log('✅ Admin user exists:', adminData[0]);
    } else {
      console.log('⚠️ No admin user found');
    }

    console.log('✅ Database connection test completed');

  } catch (err) {
    console.log('❌ Connection test failed:', err.message);
  }
}

testConnection();