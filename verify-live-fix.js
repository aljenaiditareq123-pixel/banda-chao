#!/usr/bin/env node

/**
 * Verification Script for 500 Error Fixes
 * Tests the production endpoints to verify fixes are working
 */

const BACKEND_URL = 'https://banda-chao-backend.onrender.com';

// Get credentials from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Error: Email and Password are required');
  console.log('\nUsage: node verify-live-fix.js <email> <password>');
  console.log('Example: node verify-live-fix.js user@example.com mypassword');
  process.exit(1);
}

async function verifyFix() {
  console.log('🔍 Starting verification of production fixes...\n');
  console.log(`📡 Backend URL: ${BACKEND_URL}\n`);

  try {
    // Step 1: Login
    console.log('1️⃣  Attempting to login...');
    const loginResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error('❌ Login failed!');
      console.error('Status:', loginResponse.status);
      console.error('Response:', JSON.stringify(loginData, null, 2));
      process.exit(1);
    }

    if (!loginData.token && !loginData.success) {
      console.error('❌ Login response missing token');
      console.error('Response:', JSON.stringify(loginData, null, 2));
      process.exit(1);
    }

    const token = loginData.token;
    console.log('✅ Login successful!');
    console.log(`   Token received: ${token.substring(0, 20)}...\n`);

    // Step 2: Test /api/v1/users/me endpoint
    console.log('2️⃣  Testing /api/v1/users/me endpoint...');
    const meResponse = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const meData = await meResponse.json();

    console.log(`   Status: ${meResponse.status} ${meResponse.statusText}`);

    if (meResponse.status === 200) {
      console.log('✅ SUCCESS! /api/v1/users/me returned 200 OK');
      console.log('\n📋 User Data:');
      console.log(JSON.stringify(meData, null, 2));
      console.log('\n🎉 Fix verification PASSED!');
      process.exit(0);
    } else if (meResponse.status === 500) {
      console.error('❌ FAILED! /api/v1/users/me still returns 500 Internal Server Error');
      console.error('\n📋 Error Response:');
      console.error(JSON.stringify(meData, null, 2));
      console.log('\n⚠️  Fix verification FAILED - 500 error still exists');
      process.exit(1);
    } else {
      console.error(`❌ Unexpected status: ${meResponse.status}`);
      console.error('\n📋 Response:');
      console.error(JSON.stringify(meData, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during verification:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run verification
verifyFix();

