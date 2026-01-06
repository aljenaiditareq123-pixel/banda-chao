#!/usr/bin/env node

/**
 * Login Test Script
 * Tests the login functionality with admin credentials
 */

const https = require('https');

const ADMIN_EMAIL = 'admin@bandachao.com';
const ADMIN_PASSWORD = 'password123';
const BACKEND_URL = 'https://banda-chao-backend.onrender.com';
const FRONTEND_URL = 'https://banda-chao.onrender.com';

console.log('🔍 Testing Banda Chao Login Functionality...\n');

// Test 1: Backend Health Check
console.log('1️⃣ Testing Backend Health...');
https.get(`${BACKEND_URL}/api/health`, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('   ✅ Backend is healthy\n');
      testLogin();
    } else {
      console.log(`   ❌ Backend returned status ${res.statusCode}\n`);
      console.log('   ⚠️  Backend might be sleeping. Wait 30 seconds and try again.\n');
    }
  });
}).on('error', (err) => {
  console.log(`   ❌ Backend connection failed: ${err.message}\n`);
  console.log('   ⚠️  Backend might be sleeping or deploying. Wait 1-2 minutes.\n');
});

// Test 2: Login API
function testLogin() {
  console.log('2️⃣ Testing Login API...');
  const loginData = JSON.stringify({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  const options = {
    hostname: 'banda-chao-backend.onrender.com',
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length,
    },
    timeout: 15000,
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          if (response.token && response.user) {
            console.log('   ✅ Login successful!');
            console.log(`   📧 Email: ${response.user.email}`);
            console.log(`   👤 Name: ${response.user.name}`);
            console.log(`   🔑 Role: ${response.user.role}`);
            console.log(`   🎫 Token: ${response.token.substring(0, 20)}...\n`);
            console.log('✅ All tests passed! Login is working correctly.\n');
            testUserEndpoint(response.token);
          } else {
            console.log('   ❌ Login failed: Invalid response format');
            console.log('   Response:', data.substring(0, 200));
          }
        } catch (e) {
          console.log('   ❌ Failed to parse response:', e.message);
          console.log('   Response:', data.substring(0, 200));
        }
      } else if (res.statusCode === 401) {
        console.log('   ❌ Login failed: Invalid credentials');
        console.log('   ⚠️  Check if admin user exists in database\n');
      } else if (res.statusCode === 500) {
        console.log('   ❌ Login failed: Server error');
        console.log('   Response:', data.substring(0, 200));
        if (data.includes('JWT_SECRET')) {
          console.log('   ⚠️  JWT_SECRET issue detected. Check backend environment variables.\n');
        }
      } else {
        console.log(`   ❌ Login failed: Status ${res.statusCode}`);
        console.log('   Response:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (err) => {
    console.log(`   ❌ Request failed: ${err.message}\n`);
  });

  req.on('timeout', () => {
    req.destroy();
    console.log('   ❌ Request timeout (15 seconds)\n');
  });

  req.write(loginData);
  req.end();
}

// Test 3: User Endpoint (with token)
function testUserEndpoint(token) {
  console.log('3️⃣ Testing User Endpoint (with token)...');
  const options = {
    hostname: 'banda-chao-backend.onrender.com',
    path: '/api/v1/users/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    timeout: 15000,
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('   ✅ User endpoint working!');
        try {
          const user = JSON.parse(data);
          console.log(`   📧 Email: ${user.email}`);
          console.log(`   👤 Name: ${user.name}`);
          console.log(`   🔑 Role: ${user.role}\n`);
        } catch (e) {
          console.log('   ⚠️  Response received but parsing failed\n');
        }
      } else {
        console.log(`   ❌ User endpoint failed: Status ${res.statusCode}\n`);
      }
      console.log('🎉 Testing complete!\n');
    });
  });

  req.on('error', (err) => {
    console.log(`   ❌ Request failed: ${err.message}\n`);
  });

  req.on('timeout', () => {
    req.destroy();
    console.log('   ❌ Request timeout\n');
  });

  req.end();
}
