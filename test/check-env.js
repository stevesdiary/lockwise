require('dotenv').config();

console.log('Environment Variables Check:');
console.log('BUCKET_ENDPOINT:', process.env.BUCKET_ENDPOINT || 'NOT SET');
console.log('BUCKET_NAME:', process.env.BUCKET_NAME || 'NOT SET');
console.log('KEY_ID:', process.env.KEY_ID ? 'SET' : 'NOT SET');
console.log('BUCKET_API_KEY:', process.env.BUCKET_API_KEY ? 'SET' : 'NOT SET');

// Test S3 client creation
try {
  const { S3Client } = require('@aws-sdk/client-s3');
  
  const s3Client = new S3Client({
    endpoint: `https://${process.env.BUCKET_ENDPOINT}`,
    region: 'eu-central-003',
    credentials: {
      accessKeyId: process.env.KEY_ID,
      secretAccessKey: process.env.BUCKET_API_KEY,
    },
  });
  
  console.log('✅ S3 Client created successfully');
} catch (error) {
  console.log('❌ S3 Client creation failed:', error.message);
}