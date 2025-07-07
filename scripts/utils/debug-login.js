import fetch from 'node-fetch';

// Registration function
async function register(username, password) {
  console.log(`Attempting to register user: ${username}`);
  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role: 'user' }),
    });
    
    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Registration successful:', data);
    return data;
  } catch (error) {
    console.error('Registration error:', error.message);
    return null;
  }
}

// Login function
async function login(username, password) {
  console.log(`Attempting to login user: ${username}`);
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Login successful:', data);
    
    // Get the cookies from the response
    const cookies = response.headers.raw()['set-cookie'];
    console.log('Cookies received:', cookies);
    
    return { user: data, cookies };
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

// Check user function
async function checkUser(cookies) {
  console.log('Checking current user with cookies');
  try {
    const response = await fetch('http://localhost:5000/api/user', {
      method: 'GET',
      headers: {
        Cookie: cookies.join('; '),
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`User check failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('User check successful:', data);
    return data;
  } catch (error) {
    console.error('User check error:', error.message);
    return null;
  }
}

// Main function
async function main() {
  const testUsername = `test_user_${Date.now()}`;
  const testPassword = 'password123';
  
  // Register a new user
  const user = await register(testUsername, testPassword);
  if (!user) {
    console.error('Test failed: Unable to register user');
    return;
  }
  
  // Login with the new user
  const loginResult = await login(testUsername, testPassword);
  if (!loginResult) {
    console.error('Test failed: Unable to login');
    return;
  }
  
  // Check if the user is authenticated
  const currentUser = await checkUser(loginResult.cookies);
  if (!currentUser) {
    console.error('Test failed: Unable to verify current user');
    return;
  }
  
  console.log('Test passed: Full authentication flow works');
}

main().catch(error => {
  console.error('Unhandled error:', error);
});