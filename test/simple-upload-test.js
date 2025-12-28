const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  try {
    // Create a simple test file
    const testContent = 'Hello from Lockwise upload test!';
    fs.writeFileSync('sample.txt', testContent);

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream('sample.txt'));

    // Make the request
    const response = await axios.post(
      'http://localhost:3002/api/v1/upload/test-upload',
      form,
      {
        headers: form.getHeaders()
      }
    );

    console.log('✅ Upload successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

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
    if (fs.existsSync('sample.txt')) {
      fs.unlinkSync('sample.txt');
    }
  }
}

testUpload();