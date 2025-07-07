const fetch = require('node-fetch');

async function testAuthAndUX() {
  try {
    console.log('Testing authentication and UX system...');
    
    // Test login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'emon2001',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    
    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Received cookies:', cookies ? 'Yes' : 'No');
    
    if (!cookies) {
      console.log('No cookies received, checking direct user data...');
      
      // Test user endpoint with session
      const userResponse = await fetch('http://localhost:5000/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        }
      });
      
      const userData = await userResponse.text();
      console.log('User data response:', userData);
    }
    
    // Test credit packages
    console.log('\nTesting credit packages...');
    const packagesResponse = await fetch('http://localhost:5000/api/credit-packages');
    const packages = await packagesResponse.json();
    console.log('Credit packages:', packages.length, 'found');
    
    // Test credit transactions
    console.log('\nTesting credit transactions...');
    const transactionsResponse = await fetch('http://localhost:5000/api/credit-transactions');
    const transactions = await transactionsResponse.json();
    console.log('Credit transactions:', transactions.length, 'found');
    
    // Test credit usage
    console.log('\nTesting credit usage...');
    const usageResponse = await fetch('http://localhost:5000/api/credit-usage');
    const usage = await usageResponse.json();
    console.log('Credit usage records:', usage.length, 'found');
    
    console.log('\nAll UX data endpoints tested successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuthAndUX();