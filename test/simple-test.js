const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function simpleTest() {
  try {
    console.log('🚀 Testing file upload without authentication...\n');

    // Create a test file
    const testContent = 'This is a simple test file for upload';
    fs.writeFileSync('simple-test.txt', testContent);

    const form = new FormData();
    form.append('file', fs.createReadStream('simple-test.txt'));

    // Test upload without authentication
    const uploadResponse = await axios.post(`${BASE_URL}/upload/test-upload`, form, {
      headers: form.getHeaders()
    });

    console.log('✅ File uploaded successfully!');
    console.log('Upload result:', JSON.stringify(uploadResponse.data, null, 2));

  } catch (error) {
    console.log('❌ Upload failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Network error:', error.message);
    }
  } finally {
    // Clean up test file
    if (fs.existsSync('simple-test.txt')) {
      fs.unlinkSync('simple-test.txt');
    }
  }
}

simpleTest();