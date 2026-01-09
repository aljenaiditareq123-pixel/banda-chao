#!/usr/bin/env node

/**
 * Generate a secure JWT secret for production use
 * This script generates a cryptographically secure random string
 * suitable for use as JWT_SECRET in production environments
 */

const crypto = require('crypto');

// Generate a 64-byte (512-bit) random hex string
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n🔐 Generated JWT Secret for Production:');
console.log('━'.repeat(80));
console.log(secret);
console.log('━'.repeat(80));
console.log('\n📋 Instructions:');
console.log('1. Copy the secret above (it\'s already selected)');
console.log('2. Go to Render Dashboard → banda-chao-backend → Environment');
console.log('3. Add new environment variable:');
console.log('   Key: JWT_SECRET');
console.log('   Value: [Paste the secret above]');
console.log('4. Click "Save Changes"');
console.log('5. Render will automatically redeploy your service');
console.log('\n✅ After deployment, check logs to verify the secret is loaded correctly.\n');
