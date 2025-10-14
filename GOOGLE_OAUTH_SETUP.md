# Google OAuth Setup Guide for Lockwise

## 🚀 Implementation Complete!

### ✅ What's Been Implemented:

1. **Database Migration** - Added `google_id` and `oauth_enabled` fields
2. **Google Auth Service** - Login-only OAuth logic
3. **OAuth Controller** - Handle Google authentication flow
4. **API Routes** - Complete OAuth endpoints
5. **Environment Setup** - OAuth configuration variables

## 🔧 Setup Instructions:

### 1. Google Cloud Console Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3002/api/v1/auth/google/callback`
7. Copy Client ID and Client Secret

### 2. Environment Variables:

Update your `.env` file with real Google credentials:

```env
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret  
GOOGLE_REDIRECT_URI=http://localhost:3002/api/v1/auth/google/callback
```

### 3. Run Database Migration:

```bash
# Run the migration to add Google OAuth fields
npx sequelize-cli db:migrate
```

## 📋 API Endpoints:

### Authentication Flow:

1. **Get OAuth URL:**
   ```
   GET /api/v1/auth/google/url
   Response: { authUrl: "https://accounts.google.com/o/oauth2/..." }
   ```

2. **Handle Callback (after Google auth):**
   ```
   GET /api/v1/auth/google/callback?code=GOOGLE_AUTH_CODE
   Response: { token: "jwt_token", user: {...} }
   ```

### Account Management:

3. **Link Google Account:**
   ```
   POST /api/v1/auth/google/link
   Headers: Authorization: Bearer JWT_TOKEN
   Body: { "google_code": "GOOGLE_AUTH_CODE" }
   ```

4. **Unlink Google Account:**
   ```
   DELETE /api/v1/auth/google/unlink
   Headers: Authorization: Bearer JWT_TOKEN
   ```

## 🎯 User Flow:

### For New Users:
1. **Must register first** via regular form (`POST /api/v1/user/register`)
2. **Then can login** with Google (`GET /api/v1/auth/google/url`)
3. **Complete profile guaranteed** - all required fields captured during registration

### For Existing Users:
1. **Login normally** or **use Google login** (if linked)
2. **Can link Google** account from settings
3. **Can unlink Google** account anytime

## 🧪 Testing:

```bash
# Test the OAuth endpoints
node test-google-auth.js

# Test complete workflow
node working-workflow.js
```

## 🔒 Security Features:

- ✅ **Email verification** - Only registered emails can use Google login
- ✅ **Account linking** - Prevents duplicate accounts
- ✅ **JWT tokens** - Secure session management  
- ✅ **Google ID validation** - Prevents account hijacking
- ✅ **Fallback authentication** - Password login always available

## 🎨 Frontend Integration:

### Login Page Flow:
```javascript
// 1. Get Google OAuth URL
const response = await fetch('/api/v1/auth/google/url');
const { authUrl } = await response.json();

// 2. Redirect user to Google
window.location.href = authUrl;

// 3. Handle callback (Google redirects back)
// Extract code from URL and call callback endpoint
```

### Account Settings:
```javascript
// Link Google account
await fetch('/api/v1/auth/google/link', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ google_code: code })
});

// Unlink Google account  
await fetch('/api/v1/auth/google/unlink', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## ✨ Benefits Achieved:

- 🚀 **Faster login** for returning users
- 🔒 **Complete data integrity** - all users have full profiles
- 🎯 **No confusion** - clear registration → login flow
- 🛡️ **Security maintained** - password fallback always available
- 📱 **Mobile friendly** - Google OAuth works great on mobile

## 🚀 Ready to Use!

The Google OAuth login-only integration is complete and ready for production use. Users must register first, then can enjoy the convenience of Google login while maintaining complete data consistency.