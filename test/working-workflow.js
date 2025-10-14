const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function workingWorkflow() {
  let token = null;
  
  try {
    console.log('🚀 Starting working workflow...\n');

    // Step 1: Register a user (manager role doesn't need estate_code)
    console.log('1️⃣ Registering manager user...');
    try {
      const userResponse = await axios.post(`${BASE_URL}/user/register`, {
        title: 'Mr',
        first_name: 'Manager',
        last_name: 'User',
        email: 'manager@lockwise.com',
        password: 'Password123!',
        confirm_password: 'Password123!',
        phone: '08012345678',
        role: 'manager'
      });
      console.log('✅ User registered:', userResponse.data.message);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists, proceeding to login...');
      } else {
        throw error;
      }
    }

    // Step 2: Login to get token
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/log/login`, {
      email: 'manager@lockwise.com',
      password: 'Password123!'
    });
    
    token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');

    // Step 3: Create estate
    console.log('\n3️⃣ Creating estate...');
    try {
      const estateResponse = await axios.post(`${BASE_URL}/estate`, {
        name: 'Lockwise Test Estate',
        type: 'residential',
        number_of_appartments: 100,
        total_number_of_floors: 10,
        address: {
          street: '123 Lockwise Street',
          city: 'Lagos',
          country: 'Nigeria'
        }
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Estate created:', estateResponse.data.data?.name);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️ Estate creation failed, but continuing with upload test...');
      } else {
        throw error;
      }
    }

    // Step 4: Test authenticated file upload
    console.log('\n4️⃣ Testing authenticated file upload...');
    
    const testContent = 'Estate management document - uploaded via authenticated endpoint';
    fs.writeFileSync('estate-doc.pdf', testContent);

    const form = new FormData();
    form.append('file', fs.createReadStream('estate-doc.pdf'));

    const uploadResponse = await axios.post(`${BASE_URL}/upload/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Authenticated file upload successful!');
    console.log('Upload result:', JSON.stringify(uploadResponse.data, null, 2));

    // Step 5: Test unauthenticated upload as well
    console.log('\n5️⃣ Testing unauthenticated file upload...');
    
    const testContent2 = 'Public document - uploaded via test endpoint';
    fs.writeFileSync('public-doc.txt', testContent2);

    const form2 = new FormData();
    form2.append('file', fs.createReadStream('public-doc.txt'));

    const uploadResponse2 = await axios.post(`${BASE_URL}/upload/test-upload`, form2, {
      headers: form2.getHeaders()
    });

    console.log('✅ Unauthenticated file upload successful!');
    console.log('Upload result:', JSON.stringify(uploadResponse2.data, null, 2));

    console.log('\n🎉 All tests completed successfully!');

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
    ['estate-doc.pdf', 'public-doc.txt'].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}

workingWorkflow();