/**
 * Test Login Script
 * Run this in Node.js to test login API
 * 
 * Usage: node test-login.js
 */

const https = require('https');

const testLogin = () => {
  const email = 'founder@bandachao.com';
  const password = '123456';
  // Backend API URL (not frontend)
  const apiUrl = 'https://banda-chao-backend.onrender.com/api/v1/auth/login';

  const postData = JSON.stringify({
    email: email,
    password: password
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🧪 Testing Login...');
  console.log('📧 Email:', email);
  console.log('🔗 URL:', apiUrl);
  console.log('⏳ Sending request...\n');

  const req = https.request(apiUrl, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📊 Response Status:', res.statusCode);
      console.log('📄 Response Headers:', res.headers);
      console.log('\n📝 Response Body:');
      
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
        
        if (json.success) {
          console.log('\n✅ LOGIN SUCCESSFUL!');
          console.log('🎉 Token received:', json.token ? 'Yes' : 'No');
          console.log('👤 User:', json.user ? json.user.email : 'N/A');
        } else {
          console.log('\n❌ LOGIN FAILED');
          if (json.error) {
            console.log('🔴 Error:', json.error);
            
            if (json.error.includes('JWT_SECRET')) {
              console.log('\n⚠️  SOLUTION: Restart Backend Service (banda-chao)');
            }
          }
          if (json.message) {
            console.log('📢 Message:', json.message);
          }
        }
      } catch (e) {
        console.log('⚠️  Response is not JSON:');
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
    console.error('\n💡 Possible causes:');
    console.error('  - Backend service is down');
    console.error('  - Network connection issue');
    console.error('  - Backend is in Sleep Mode (wait 30-60 seconds)');
  });

  req.write(postData);
  req.end();
};

// Run test
testLogin();
