#!/usr/bin/env node

/**
 * Direct Verification Script for 500 Error Fixes
 * Tests the production endpoints directly
 */

const BACKEND_URL = 'https://banda-chao-backend.onrender.com';

// Get token from command line or test endpoint directly
const token = process.argv[2];

if (!token) {
  console.error('❌ Error: Token is required');
  console.log('\nUsage: node verify-live-fix-direct.js <token>');
  console.log('Or test health endpoint: node verify-live-fix-direct.js health');
  process.exit(1);
}

async function verifyFix() {
  console.log('🔍 Starting direct verification of production fixes...\n');
  console.log(`📡 Backend URL: ${BACKEND_URL}\n`);

  try {
    // If "health" is passed, test health endpoint
    if (token === 'health') {
      console.log('1️⃣  Testing /api/health endpoint...');
      const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
      const healthText = await healthResponse.text();
      
      console.log(`   Status: ${healthResponse.status} ${healthResponse.statusText}`);
      console.log(`   Response: ${healthText}`);
      
      if (healthResponse.status === 200) {
        console.log('✅ Backend is healthy!\n');
      } else {
        console.error('❌ Backend health check failed!\n');
      }
      return;
    }

    // Step 1: Test /api/v1/users/me endpoint with provided token
    console.log('1️⃣  Testing /api/v1/users/me endpoint...');
    console.log(`   Using token: ${token.substring(0, 20)}...\n`);
    
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
    } else if (meResponse.status === 401 || meResponse.status === 403) {
      console.error(`❌ Authentication failed: ${meResponse.status}`);
      console.error('   Token may be invalid or expired');
      console.error('\n📋 Response:');
      console.error(JSON.stringify(meData, null, 2));
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

