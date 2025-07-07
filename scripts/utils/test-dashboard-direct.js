import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

async function testDashboardSupabaseConnection() {
  try {
    console.log('Testing Dashboard Supabase Connection...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Step 1: Create test user
    console.log('1. Creating test user...');
    const testEmail = 'dashboard@school.com';
    const testPassword = 'dashboard123';
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Dashboard Test User',
        role: 'admin'
      }
    });
    
    if (userError && !userError.message.includes('already registered')) {
      console.error('User creation failed:', userError.message);
    } else {
      console.log('✓ Test user ready');
    }
    
    // Step 2: Get authentication token
    console.log('2. Getting authentication token...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.error('Authentication failed:', authError.message);
      return;
    }
    
    const accessToken = authData.session.access_token;
    console.log('✓ Authentication token obtained');
    
    // Step 3: Test dashboard endpoints with token
    console.log('3. Testing dashboard endpoints...');
    
    const baseUrl = 'http://localhost:5000';
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test stats endpoint
    try {
      const statsResponse = await fetch(`${baseUrl}/api/supabase/dashboard/stats`, { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✓ Stats endpoint working:', statsData);
      } else {
        console.log('✗ Stats endpoint failed:', statsResponse.status, await statsResponse.text());
      }
    } catch (statsError) {
      console.log('✗ Stats endpoint error:', statsError.message);
    }
    
    // Test activities endpoint
    try {
      const activitiesResponse = await fetch(`${baseUrl}/api/supabase/dashboard/activities`, { headers });
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        console.log('✓ Activities endpoint working:', activitiesData.length, 'activities');
      } else {
        console.log('✗ Activities endpoint failed:', activitiesResponse.status);
      }
    } catch (activitiesError) {
      console.log('✗ Activities endpoint error:', activitiesError.message);
    }
    
    // Test documents endpoint
    try {
      const documentsResponse = await fetch(`${baseUrl}/api/supabase/dashboard/documents`, { headers });
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        console.log('✓ Documents endpoint working:', documentsData.length, 'documents');
      } else {
        console.log('✗ Documents endpoint failed:', documentsResponse.status);
      }
    } catch (documentsError) {
      console.log('✗ Documents endpoint error:', documentsError.message);
    }
    
    // Step 4: Test direct Supabase table access
    console.log('4. Testing direct table access...');
    
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('id')
      .limit(1);
      
    if (studentsError) {
      console.log('✗ Students table access failed:', studentsError.message);
    } else {
      console.log('✓ Students table accessible');
    }
    
    const { data: teachersData, error: teachersError } = await supabase
      .from('teachers')
      .select('id')
      .limit(1);
      
    if (teachersError) {
      console.log('✗ Teachers table access failed:', teachersError.message);
    } else {
      console.log('✓ Teachers table accessible');
    }
    
    console.log('\nDashboard Connection Test Complete!');
    console.log('Test credentials for frontend login:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('Access Token:', accessToken.substring(0, 20) + '...');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDashboardSupabaseConnection();