/**
 * Test Script for Alibaba Cloud OSS Connection
 * Run: cd server && npx tsx scripts/test-alibaba-oss.ts
 */

import { AlibabaOSSProvider } from '../src/lib/alibaba-oss';

async function testAlibabaOSS() {
  console.log('🧪 Testing Alibaba Cloud OSS Connection...\n');

  // Check configuration
  const provider = new AlibabaOSSProvider();
  
  console.log('📋 Configuration Check:');
  console.log('  - Access Key ID:', process.env.ALIBABA_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
  console.log('  - Access Key Secret:', process.env.ALIBABA_ACCESS_KEY_SECRET ? '✅ Set' : '❌ Not set');
  console.log('  - Bucket:', process.env.ALIBABA_OSS_BUCKET || '❌ Not set');
  console.log('  - Region:', process.env.ALIBABA_OSS_REGION || '❌ Not set');
  console.log('  - Endpoint:', process.env.ALIBABA_OSS_ENDPOINT || 'Auto-generated');
  console.log('');

  if (!provider.isConfigured()) {
    console.error('❌ Alibaba Cloud OSS is not configured. Please set environment variables:');
    console.error('   - ALIBABA_ACCESS_KEY_ID');
    console.error('   - ALIBABA_ACCESS_KEY_SECRET');
    console.error('   - ALIBABA_OSS_BUCKET');
    console.error('   - ALIBABA_OSS_REGION');
    process.exit(1);
  }

  console.log('✅ Configuration check passed!\n');

  // Test upload
  console.log('📤 Testing file upload...');
  try {
    const testContent = Buffer.from('Test file for Alibaba Cloud OSS connection - ' + new Date().toISOString());
    const testFileName = 'test-connection.txt';
    
    const url = await provider.uploadFile(testContent, testFileName, 'test');
    
    console.log('✅ Upload successful!');
    console.log('   URL:', url);
    console.log('');
    
    // Test deletion (optional)
    console.log('🗑️  Testing file deletion...');
    await provider.deleteFile(url);
    console.log('✅ Deletion successful!');
    
    console.log('\n🎉 All tests passed! Alibaba Cloud OSS is working correctly.');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('   Full error:', error);
    process.exit(1);
  }
}

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

testAlibabaOSS().catch(console.error);




