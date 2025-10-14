const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testTenantUpload() {
  try {
    console.log('🚀 Testing tenant-specific file upload...\n');

    // Test 1: Upload with tenant info
    console.log('1️⃣ Testing upload with tenant folder...');
    
    const testContent1 = 'Document for Estate ABC';
    fs.writeFileSync('estate-document.pdf', testContent1);

    const form1 = new FormData();
    form1.append('file', fs.createReadStream('estate-document.pdf'));
    form1.append('tenant_id', 'EST001');
    form1.append('tenant_name', 'Sunrise Estate');

    const response1 = await axios.post(`${BASE_URL}/upload/test-upload`, form1, {
      headers: form1.getHeaders()
    });

    console.log('✅ Upload with tenant folder successful!');
    console.log('Result:', JSON.stringify(response1.data, null, 2));

    // Test 2: Upload without tenant info (should go to root)
    console.log('\n2️⃣ Testing upload without tenant info...');
    
    const testContent2 = 'General document';
    fs.writeFileSync('general-doc.txt', testContent2);

    const form2 = new FormData();
    form2.append('file', fs.createReadStream('general-doc.txt'));

    const response2 = await axios.post(`${BASE_URL}/upload/test-upload`, form2, {
      headers: form2.getHeaders()
    });

    console.log('✅ Upload without tenant info successful!');
    console.log('Result:', JSON.stringify(response2.data, null, 2));

    // Test 3: Upload with special characters in tenant name
    console.log('\n3️⃣ Testing upload with special characters in tenant name...');
    
    const testContent3 = 'Document for special estate';
    fs.writeFileSync('special-doc.jpg', testContent3);

    const form3 = new FormData();
    form3.append('file', fs.createReadStream('special-doc.jpg'));
    form3.append('tenant_id', 'EST002');
    form3.append('tenant_name', 'Royal Gardens & Towers (Phase 1)');

    const response3 = await axios.post(`${BASE_URL}/upload/test-upload`, form3, {
      headers: form3.getHeaders()
    });

    console.log('✅ Upload with special characters successful!');
    console.log('Result:', JSON.stringify(response3.data, null, 2));

    console.log('\n🎉 All tenant upload tests completed successfully!');

  } catch (error) {
    console.log('\n❌ Upload failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Network error:', error.message);
    }
  } finally {
    // Clean up test files
    ['estate-document.pdf', 'general-doc.txt', 'special-doc.jpg'].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}

testTenantUpload();