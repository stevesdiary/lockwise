const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testAuthTenantUpload() {
  let token = null;
  
  try {
    console.log('🚀 Testing authenticated tenant upload...\n');

    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/log/login`, {
      email: 'manager@lockwise.com',
      password: 'Password123!'
    });
    
    token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Upload file with authentication (should auto-detect tenant from user)
    console.log('\n2️⃣ Testing authenticated upload (auto-detect tenant)...');
    
    const testContent1 = 'Authenticated document for logged-in manager';
    fs.writeFileSync('auth-doc.pdf', testContent1);

    const form1 = new FormData();
    form1.append('file', fs.createReadStream('auth-doc.pdf'));

    const response1 = await axios.post(`${BASE_URL}/upload/upload`, form1, {
      headers: {
        ...form1.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Authenticated upload successful!');
    console.log('Result:', JSON.stringify(response1.data, null, 2));

    // Step 3: Upload with explicit tenant_id override
    console.log('\n3️⃣ Testing upload with explicit tenant_id...');
    
    const testContent2 = 'Document with explicit tenant override';
    fs.writeFileSync('override-doc.txt', testContent2);

    const form2 = new FormData();
    form2.append('file', fs.createReadStream('override-doc.txt'));
    form2.append('tenant_id', 'EST123'); // This should override user's estate_id

    const response2 = await axios.post(`${BASE_URL}/upload/upload`, form2, {
      headers: {
        ...form2.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Upload with tenant override successful!');
    console.log('Result:', JSON.stringify(response2.data, null, 2));

    console.log('\n🎉 All authenticated tenant upload tests completed!');

  } catch (error) {
    console.log('\n❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Network error:', error.message);
    }
  } finally {
    // Clean up test files
    ['auth-doc.pdf', 'override-doc.txt'].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}

testAuthTenantUpload();