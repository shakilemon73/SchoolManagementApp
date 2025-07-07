#!/usr/bin/env node

/**
 * Comprehensive Deployment Readiness Test
 * Tests all critical components before deployment
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const TEST_RESULTS = [];

// Test configuration
const tests = [
  {
    name: 'Health Check',
    endpoint: '/api/health',
    method: 'GET',
    expected: { status: 'healthy' },
    critical: true
  },
  {
    name: 'System Health',
    endpoint: '/api/system/health',
    method: 'GET',
    expected: { status: 'HEALTHY' },
    critical: true
  },
  {
    name: 'Dashboard Stats',
    endpoint: '/api/dashboard/stats?schoolId=1',
    method: 'GET',
    expected: { students: 'number' },
    critical: true
  },
  {
    name: 'Document Templates',
    endpoint: '/api/documents/templates',
    method: 'GET',
    expected: 'array',
    critical: true
  },
  {
    name: 'Students API',
    endpoint: '/api/students?schoolId=1',
    method: 'GET',
    expected: 'array',
    critical: false
  },
  {
    name: 'Teachers API',
    endpoint: '/api/teachers?schoolId=1',
    method: 'GET',
    expected: 'array',
    critical: false
  },
  {
    name: 'Library Books',
    endpoint: '/api/library/books?schoolId=1',
    method: 'GET',
    expected: 'array',
    critical: false
  },
  {
    name: 'Notifications',
    endpoint: '/api/notifications?schoolId=1',
    method: 'GET',
    expected: 'array',
    critical: false
  }
];

async function runTest(test) {
  console.log(`\n🧪 Testing: ${test.name}`);
  
  try {
    const response = await fetch(`${BASE_URL}${test.endpoint}`, {
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    let passed = false;
    
    if (test.expected === 'array') {
      passed = Array.isArray(data);
    } else if (typeof test.expected === 'object') {
      passed = Object.keys(test.expected).every(key => {
        if (test.expected[key] === 'number') {
          return typeof data[key] === 'number';
        }
        return data[key] === test.expected[key];
      });
    }

    const result = {
      name: test.name,
      endpoint: test.endpoint,
      status: response.status,
      passed,
      critical: test.critical,
      responseTime: response.headers.get('x-response-time') || 'N/A',
      dataSize: JSON.stringify(data).length
    };

    TEST_RESULTS.push(result);

    if (passed) {
      console.log(`✅ ${test.name} - PASSED (${response.status})`);
      if (test.expected === 'array') {
        console.log(`   📊 Returned ${data.length} items`);
      }
    } else {
      console.log(`❌ ${test.name} - FAILED (${response.status})`);
      console.log(`   Expected: ${JSON.stringify(test.expected)}`);
      console.log(`   Got: ${JSON.stringify(data).substring(0, 100)}...`);
    }

  } catch (error) {
    console.log(`💥 ${test.name} - ERROR: ${error.message}`);
    TEST_RESULTS.push({
      name: test.name,
      endpoint: test.endpoint,
      status: 0,
      passed: false,
      critical: test.critical,
      error: error.message
    });
  }
}

async function checkEnvironment() {
  console.log('\n🔍 Environment Check');
  
  const requiredFiles = [
    'package.json',
    'deployment/Dockerfile',
    'deployment/docker-compose.yml',
    'deployment/deploy.json',
    '.env.example'
  ];

  console.log('\n📁 Required Files:');
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
  });

  console.log('\n🌍 Environment Variables:');
  const envVars = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SESSION_SECRET'];
  envVars.forEach(envVar => {
    const exists = !!process.env[envVar];
    console.log(`${exists ? '✅' : '❌'} ${envVar}`);
  });
}

async function generateReport() {
  console.log('\n\n📊 DEPLOYMENT READINESS REPORT');
  console.log('=' .repeat(50));

  const passedTests = TEST_RESULTS.filter(t => t.passed).length;
  const totalTests = TEST_RESULTS.length;
  const criticalFailures = TEST_RESULTS.filter(t => t.critical && !t.passed).length;

  console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} tests passed`);
  console.log(`🚨 Critical Failures: ${criticalFailures}`);

  if (criticalFailures === 0) {
    console.log('\n🎉 DEPLOYMENT READY!');
    console.log('✅ All critical systems operational');
    console.log('✅ Application ready for production deployment');
  } else {
    console.log('\n⚠️  DEPLOYMENT NOT READY');
    console.log(`❌ ${criticalFailures} critical system(s) failing`);
    console.log('🔧 Fix critical issues before deployment');
  }

  console.log('\n📈 Test Results:');
  TEST_RESULTS.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const critical = result.critical ? ' [CRITICAL]' : '';
    console.log(`${icon} ${result.name}${critical} - ${result.status}`);
  });

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    overallScore: `${passedTests}/${totalTests}`,
    criticalFailures,
    deploymentReady: criticalFailures === 0,
    results: TEST_RESULTS
  };

  fs.writeFileSync('deployment-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Detailed report saved to: deployment-test-report.json');

  return criticalFailures === 0;
}

async function main() {
  console.log('🚀 SCHOOL MANAGEMENT SYSTEM - DEPLOYMENT READINESS TEST');
  console.log(`🌐 Testing against: ${BASE_URL}`);
  console.log('⏰ Started at:', new Date().toISOString());

  await checkEnvironment();

  console.log('\n🧪 Running API Tests...');
  for (const test of tests) {
    await runTest(test);
    // Small delay to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const ready = await generateReport();
  
  process.exit(ready ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});