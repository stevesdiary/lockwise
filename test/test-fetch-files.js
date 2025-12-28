const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testFetchFiles() {
  let token = null;
  
  try {
    console.log('🚀 Testing file upload and fetch functionality...\n');

    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/log/login`, {
      email: 'manager@lockwise.com',
      password: 'Password123!'
    });
    
    token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Upload some test files
    console.log('\n2️⃣ Uploading test files...');
    
    // Upload file 1
    const testContent1 = 'Test document 1';
    fs.writeFileSync('test-doc-1.pdf', testContent1);
    const form1 = new FormData();
    form1.append('file', fs.createReadStream('test-doc-1.pdf'));
    
    await axios.post(`${BASE_URL}/upload/upload`, form1, {
      headers: {
        ...form1.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    // Upload file 2
    const testContent2 = 'Test document 2';
    fs.writeFileSync('test-doc-2.txt', testContent2);
    const form2 = new FormData();
    form2.append('file', fs.createReadStream('test-doc-2.txt'));
    
    await axios.post(`${BASE_URL}/upload/upload`, form2, {
      headers: {
        ...form2.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Test files uploaded');

    // Step 3: Fetch files for logged-in user's tenant
    console.log('\n3️⃣ Fetching files for user\'s tenant...');
    
    const filesResponse = await axios.get(`${BASE_URL}/upload/files`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Files fetched successfully!');
    console.log('Files for tenant:', JSON.stringify(filesResponse.data, null, 2));

    // Step 4: Fetch files for specific tenant
    console.log('\n4️⃣ Fetching files for specific tenant...');
    
    const specificTenantResponse = await axios.get(`${BASE_URL}/upload/files?tenant_id=EST123`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Specific tenant files fetched!');
    console.log('Files for EST123:', JSON.stringify(specificTenantResponse.data, null, 2));

    // Step 5: Fetch all files (admin view)
    console.log('\n5️⃣ Fetching all files...');
    
    const allFilesResponse = await axios.get(`${BASE_URL}/upload/test-files`);

    console.log('✅ All files fetched!');
    console.log('All files:', JSON.stringify(allFilesResponse.data, null, 2));

    console.log('\n🎉 All file fetch tests completed!');

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
    ['test-doc-1.pdf', 'test-doc-2.txt'].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}

testFetchFiles();