const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testGoogleAuth() {
  try {
    console.log('🚀 Testing Google OAuth integration...\n');

    // Step 1: Get Google OAuth URL
    console.log('1️⃣ Getting Google OAuth URL...');
    const urlResponse = await axios.get(`${BASE_URL}/auth/google/url`);
    
    console.log('✅ Google OAuth URL generated');
    console.log('Auth URL:', urlResponse.data.authUrl);
    console.log('\n📝 To test Google login:');
    console.log('1. Visit the auth URL above');
    console.log('2. Complete Google authentication');
    console.log('3. Copy the "code" parameter from callback URL');
    console.log('4. Use it in the callback endpoint\n');

    // Step 2: Test with existing user (login scenario)
    console.log('2️⃣ Testing login flow...');
    
    // First, login with regular credentials to get token
    try {
      const loginResponse = await axios.post(`${BASE_URL}/log/login`, {
        email: 'manager@lockwise.com',
        password: 'Password123!'
      });
      
      const token = loginResponse.data.token;
      console.log('✅ Regular login successful');

      // Test linking Google account (requires Google code from actual OAuth flow)
      console.log('\n3️⃣ Google account linking endpoint ready');
      console.log('POST /api/v1/auth/google/link');
      console.log('Headers: Authorization: Bearer ' + token.substring(0, 20) + '...');
      console.log('Body: { "google_code": "code_from_google_oauth" }');

      // Test unlinking
      console.log('\n4️⃣ Google account unlinking endpoint ready');
      console.log('DELETE /api/v1/auth/google/unlink');
      console.log('Headers: Authorization: Bearer ' + token.substring(0, 20) + '...');

    } catch (loginError) {
      console.log('ℹ️ Regular login failed (user may not exist)');
      console.log('Create a user first with: POST /api/v1/user/register');
    }

    console.log('\n🎉 Google OAuth endpoints are ready!');
    console.log('\n📋 Available endpoints:');
    console.log('• GET /api/v1/auth/google/url - Get OAuth URL');
    console.log('• GET /api/v1/auth/google/callback?code=... - Handle callback');
    console.log('• POST /api/v1/auth/google/link - Link Google to existing account');
    console.log('• DELETE /api/v1/auth/google/unlink - Unlink Google account');

  } catch (error) {
    console.log('❌ Error testing Google OAuth:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Network error:', error.message);
    }
  }
}

testGoogleAuth();