const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// Create a test file
const testContent = 'This is a test file for upload functionality';
fs.writeFileSync('test-file.txt', testContent);

const form = new FormData();
form.append('file', fs.createReadStream('test-file.txt'));

axios.post('http://localhost:3002/upload/test-upload', form, {
  headers: {
    ...form.getHeaders()
  }
})
.then(response => {
  console.log('Upload successful:', response.data);
})
.catch(error => {
  console.error('Upload failed:', error.response?.data || error.message);
})
.finally(() => {
  // Clean up test file
  fs.unlinkSync('test-file.txt');
});