import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

async function createTestUser() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create test user with admin privileges
    const testEmail = 'admin@school.com';
    const testPassword = 'admin123';
    
    console.log('Creating test user for authentication...');
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'System Administrator',
        role: 'admin',
        username: 'admin'
      }
    });
    
    if (userError && !userError.message.includes('already registered')) {
      console.error('User creation failed:', userError.message);
      return;
    }
    
    console.log('✓ Test user already exists, proceeding with authentication test');
    
    // Test sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.error('Authentication test failed:', authError.message);
      return;
    }
    
    console.log('✓ Authentication test successful');
    console.log('\nTest Credentials:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('Access Token:', authData.session.access_token.substring(0, 20) + '...');
    
    // Test API endpoints with the token
    const token = authData.session.access_token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\nTesting API endpoints...');
    
    // Test calendar endpoint
    try {
      const response = await fetch('http://localhost:5000/api/calendar/events', { headers });
      console.log('Calendar endpoint:', response.status, response.ok ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('Calendar endpoint: CONNECTION_ERROR');
    }
    
    // Test dashboard stats
    try {
      const response = await fetch('http://localhost:5000/api/supabase/dashboard/stats', { headers });
      console.log('Dashboard stats:', response.status, response.ok ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('Dashboard stats: CONNECTION_ERROR');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

createTestUser();