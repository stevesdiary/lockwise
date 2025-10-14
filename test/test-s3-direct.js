require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

async function testS3Direct() {
  try {
    console.log('Testing S3 upload directly...');
    
    // Create S3 client
    const s3Client = new S3Client({
      endpoint: `https://${process.env.BUCKET_ENDPOINT}`,
      region: 'eu-central-003',
      credentials: {
        accessKeyId: process.env.KEY_ID,
        secretAccessKey: process.env.BUCKET_API_KEY,
      },
    });

    // Create test file
    const testContent = 'Direct S3 test file';
    const key = `test-${Date.now()}.txt`;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    });

    console.log('Uploading to S3...');
    await s3Client.send(command);
    
    const url = `https://${process.env.BUCKET_ENDPOINT}/${process.env.BUCKET_NAME}/${key}`;
    console.log('✅ S3 upload successful!');
    console.log('File URL:', url);

  } catch (error) {
    console.log('❌ S3 upload failed:');
    console.log('Error:', error.message);
    console.log('Error details:', error);
  }
}

testS3Direct();