# Backblaze B2 Native Implementation

## Overview
Implemented Backblaze B2 native SDK to resolve S3-compatibility issues and provide better B2 support.

## Key Changes

### 1. **Native B2 SDK** (`src/services/backblaze-b2.service.ts`)
- Uses `backblaze-b2` package instead of AWS SDK
- Proper B2 authentication and bucket handling
- Correct public URL generation
- Native download authorization (replaces signed URLs)

### 2. **Unified Storage Service** (`src/services/unified-storage.service.ts`)
- Supports both AWS S3 and Backblaze B2
- Provider selection via environment variable
- Consistent API interface regardless of provider

### 3. **Resolved Issues**

#### ❌ Previous S3-Compatible Issues:
- `ACL: 'public-read'` not supported by B2
- Incorrect public URL format
- `@aws-sdk/s3-request-presigner` dependency missing
- Signed URLs unreliable with B2

#### ✅ B2 Native Solutions:
- No ACL needed (bucket-level permissions)
- Correct B2 public URL format: `https://f{bucket_id}.backblazeb2.com/file/{bucket_name}/{file_name}`
- Native download authorization tokens
- Proper B2 API integration

## Configuration

### Environment Variables
```env
# Storage Provider Selection
STORAGE_PROVIDER=b2

# Backblaze B2 Configuration
B2_APPLICATION_KEY_ID=your_b2_application_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET_NAME=lockwise-uploads
B2_BUCKET_ID=your_b2_bucket_id
```

### B2 Setup Steps
1. Create Backblaze B2 account
2. Create application key with read/write permissions
3. Create bucket (public or private)
4. Get bucket ID from B2 console
5. Configure environment variables

## API Differences

### Upload
- **B2**: Uses native upload URL and auth token
- **S3**: Uses PutObjectCommand

### Delete
- **B2**: Requires file ID lookup then delete by version
- **S3**: Direct delete by key

### Temporary Access
- **B2**: Download authorization tokens
- **S3**: Presigned URLs

## Benefits of Native B2

1. **Better Reliability**: Native API calls vs S3-compatibility layer
2. **Proper URL Generation**: Correct B2 public URLs
3. **No ACL Issues**: Works with B2's permission model
4. **Download Authorization**: Secure temporary access without presigned URLs
5. **Cost Efficiency**: Direct B2 API usage

## Migration Notes

### From S3-Compatible to Native B2:
- No code changes needed in controllers/routes
- Same API interface maintained
- Better error handling and reliability
- Proper B2 URL formats

### Fallback Support:
- Can switch between providers via `STORAGE_PROVIDER` env var
- AWS S3 support maintained for flexibility
- Unified interface for both providers

## Usage Example

```typescript
// Same interface works for both providers
const result = await cloudStorage.uploadFile(key, buffer, contentType);
// Returns correct URL format for selected provider
```

## Dependencies Added
```json
{
  "backblaze-b2": "^1.7.0"
}
```

This implementation resolves all B2-specific compatibility issues while maintaining a clean, unified interface for file operations.