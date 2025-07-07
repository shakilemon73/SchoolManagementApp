import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fetch from 'node-fetch';

config();

async function testAllAuthEndpoints() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authentication token
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: 'admin@school.com',
      password: 'admin123'
    });
    
    const token = authData.session.access_token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const baseUrl = 'http://localhost:5000';
    
    console.log('Testing all authentication endpoints...\n');
    
    const endpoints = [
      // Dashboard endpoints
      { path: '/api/dashboard/stats', name: 'Dashboard Stats' },
      { path: '/api/dashboard/activities', name: 'Dashboard Activities' },
      { path: '/api/dashboard/documents', name: 'Dashboard Documents' },
      { path: '/api/supabase/dashboard/stats', name: 'Supabase Dashboard Stats' },
      { path: '/api/supabase/dashboard/activities', name: 'Supabase Dashboard Activities' },
      { path: '/api/supabase/dashboard/documents', name: 'Supabase Dashboard Documents' },
      
      // Calendar endpoints
      { path: '/api/calendar/events', name: 'Calendar Events' },
      
      // Student management
      { path: '/api/students', name: 'Students Management' },
      
      // Teacher management
      { path: '/api/teachers', name: 'Teachers Management' },
      
      // Library endpoints
      { path: '/api/library/stats', name: 'Library Stats' },
      { path: '/api/library/books', name: 'Library Books' },
      
      // Financial endpoints
      { path: '/api/finance/transactions', name: 'Financial Transactions' },
      
      // Transport endpoints
      { path: '/api/transport/routes', name: 'Transport Routes' },
      
      // Inventory endpoints
      { path: '/api/inventory', name: 'Inventory Management' },
      
      // Class routine endpoints
      { path: '/api/class-routines', name: 'Class Routines' },
      
      // Admin endpoints
      { path: '/api/admin/stats', name: 'Admin Stats' },
      { path: '/api/admin/users', name: 'Admin Users' },
      
      // Credit system
      { path: '/api/credits/overview', name: 'Credits Overview' },
      
      // Notifications
      { path: '/api/notifications', name: 'Notifications' },
      
      // Settings
      { path: '/api/school-settings', name: 'School Settings' },
      { path: '/api/academic-years', name: 'Academic Years' },
      
      // Document generation
      { path: '/api/admit-cards/stats', name: 'Admit Cards Stats' },
      { path: '/api/id-cards/stats', name: 'ID Cards Stats' },
      
      // User profile
      { path: '/api/user', name: 'User Profile' },
      
      // Portal endpoints
      { path: '/api/student/profile', name: 'Student Portal' },
      { path: '/api/teacher/dashboard', name: 'Teacher Portal' },
      { path: '/api/parent/children', name: 'Parent Portal' }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint.path}`, { 
          headers,
          timeout: 5000 
        });
        
        const status = response.status;
        let result = 'UNKNOWN';
        
        if (status === 200) {
          result = 'SUCCESS';
        } else if (status === 401) {
          result = 'AUTH_FAILED';
        } else if (status === 403) {
          result = 'PERMISSION_DENIED';
        } else if (status === 404) {
          result = 'NOT_FOUND';
        } else if (status >= 500) {
          result = 'SERVER_ERROR';
        } else {
          result = `STATUS_${status}`;
        }
        
        results.push({
          name: endpoint.name,
          path: endpoint.path,
          status,
          result
        });
        
        console.log(`${endpoint.name.padEnd(30)} ${status.toString().padEnd(5)} ${result}`);
        
      } catch (error) {
        results.push({
          name: endpoint.name,
          path: endpoint.path,
          status: 'ERROR',
          result: 'CONNECTION_ERROR'
        });
        console.log(`${endpoint.name.padEnd(30)} ERROR CONNECTION_ERROR`);
      }
    }
    
    // Summary
    const summary = {
      total: results.length,
      success: results.filter(r => r.result === 'SUCCESS').length,
      authFailed: results.filter(r => r.result === 'AUTH_FAILED').length,
      permissionDenied: results.filter(r => r.result === 'PERMISSION_DENIED').length,
      notFound: results.filter(r => r.result === 'NOT_FOUND').length,
      serverError: results.filter(r => r.result === 'SERVER_ERROR').length,
      connectionError: results.filter(r => r.result === 'CONNECTION_ERROR').length
    };
    
    console.log('\n=== AUTHENTICATION STATUS SUMMARY ===');
    console.log(`Total Endpoints Tested: ${summary.total}`);
    console.log(`✓ Working (200): ${summary.success}`);
    console.log(`✗ Auth Failed (401): ${summary.authFailed}`);
    console.log(`✗ Permission Denied (403): ${summary.permissionDenied}`);
    console.log(`✗ Not Found (404): ${summary.notFound}`);
    console.log(`✗ Server Error (5xx): ${summary.serverError}`);
    console.log(`✗ Connection Error: ${summary.connectionError}`);
    
    const workingPercentage = Math.round((summary.success / summary.total) * 100);
    console.log(`\nOverall Authentication Success Rate: ${workingPercentage}%`);
    
    if (summary.authFailed > 0) {
      console.log('\nEndpoints with Authentication Issues:');
      results.filter(r => r.result === 'AUTH_FAILED').forEach(r => {
        console.log(`- ${r.name} (${r.path})`);
      });
    }
    
  } catch (error) {
    console.error('Authentication test failed:', error.message);
  }
}

testAllAuthEndpoints();