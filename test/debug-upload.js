const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function debugUpload() {
  try {
    // Create a simple test file
    fs.writeFileSync('debug.txt', 'Debug upload test');

    const form = new FormData();
    form.append('file', fs.createReadStream('debug.txt'));

    const response = await axios.post(
      'http://localhost:3000/api/v1/upload/test-upload',
      form,
      { headers: form.getHeaders() }
    );

    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error details:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.log('Network error:', error.message);
    }
  } finally {
    if (fs.existsSync('debug.txt')) {
      fs.unlinkSync('debug.txt');
    }
  }
}

debugUpload();