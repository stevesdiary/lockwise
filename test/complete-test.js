const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function completeWorkflow() {
  let token = null;
  
  try {
    console.log('🚀 Starting complete workflow test...\n');

    // Step 1: Register a user
    console.log('1️⃣ Registering user...');
    const userResponse = await axios.post(`${BASE_URL}/user/register`, {
      title: 'Mr',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'Password123!',
      confirm_password: 'Password123!',
      phone: '08012345678',
      role: 'manager'
    });
    console.log('✅ User registered:', userResponse.data.message);

    // Step 2: Login to get token
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/log/login`, {
      email: 'test@example.com',
      password: 'Password123!'
    });
    token = loginResponse.data.data.token;
    console.log('✅ Login successful, token obtained');

    // Step 3: Create estate
    console.log('\n3️⃣ Creating estate...');
    const estateResponse = await axios.post(`${BASE_URL}/estate`, {
      name: 'Test Estate',
      type: 'residential',
      number_of_appartments: 50,
      total_number_of_floors: 5,
      address: {
        street: '123 Test Street',
        city: 'Test City',
        country: 'Test Country'
      }
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Estate created:', estateResponse.data.data?.name);

    // Step 4: Test file upload
    console.log('\n4️⃣ Testing file upload...');
    
    // Create a test file
    const testContent = 'This is a test document for the estate';
    fs.writeFileSync('estate-document.txt', testContent);

    const form = new FormData();
    form.append('file', fs.createReadStream('estate-document.txt'));

    const uploadResponse = await axios.post(`${BASE_URL}/upload/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ File uploaded successfully!');
    console.log('Upload result:', JSON.stringify(uploadResponse.data, null, 2));

  } catch (error) {
    console.log('\n❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Network error:', error.message);
    }
  } finally {
    // Clean up test file
    if (fs.existsSync('estate-document.txt')) {
      fs.unlinkSync('estate-document.txt');
    }
  }
}

completeWorkflow();