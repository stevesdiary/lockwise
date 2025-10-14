const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testAuthUpload() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3002/api/v1/log/login', {
      email: 'your-email@example.com',
      password: 'your-password'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, got token');

    // Create a test file
    const testContent = 'Authenticated upload test file';
    fs.writeFileSync('auth-test.txt', testContent);

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream('auth-test.txt'));

    // Upload with authentication
    const uploadResponse = await axios.post(
      'http://localhost:3002/api/v1/upload/upload',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Authenticated upload successful!');
    console.log('Response:', JSON.stringify(uploadResponse.data, null, 2));

  } catch (error) {
    console.log('❌ Upload failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  } finally {
    // Clean up
    if (fs.existsSync('auth-test.txt')) {
      fs.unlinkSync('auth-test.txt');
    }
  }
}

testAuthUpload();