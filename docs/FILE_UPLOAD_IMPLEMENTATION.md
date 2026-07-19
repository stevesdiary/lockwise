# File Upload Implementation

## Overview
Comprehensive file upload system with S3/Backblaze B2 integration, image processing, security validation, and estate document management.

## Features Implemented

### 1. **Cloud Storage Service** (`src/services/cloud-storage.service.ts`)
- **S3 Compatible**: Works with AWS S3 and Backblaze B2
- **File Operations**: Upload, delete, signed URL generation
- **Flexible Configuration**: Environment-based storage provider selection

### 2. **Image Processing Service** (`src/services/image-processing.service.ts`)
- **Automatic Optimization**: Web-optimized image compression
- **Thumbnail Generation**: Automatic thumbnail creation for images
- **Format Support**: JPEG, PNG, WebP processing
- **Graceful Fallback**: Works without Sharp dependency

### 3. **File Validation & Security** (`src/services/file-validation.service.ts`)
- **MIME Type Validation**: Whitelist-based file type checking
- **File Signature Verification**: Magic byte validation
- **Size Limits**: Configurable file size restrictions
- **Security Scanning**: Malicious content detection
- **Extension Validation**: Double extension attack prevention

### 4. **File Upload Service** (`src/services/file-upload.service.ts`)
- **Multer Integration**: Memory-based file handling
- **Batch Processing**: Multiple file upload support
- **Organized Storage**: Folder-based file organization
- **Error Handling**: Comprehensive error management

## API Endpoints

### File Upload
- `POST /api/v1/upload/single` - Upload single file
- `POST /api/v1/upload/multiple` - Upload multiple files (max 5)
- `POST /api/v1/upload/estate-document` - Upload estate-specific documents

### File Management
- `DELETE /api/v1/upload/delete/{key}` - Delete file
- `GET /api/v1/upload/signed-url/{key}` - Get signed URL for private access

## Configuration

### Environment Variables

#### AWS S3 Configuration
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
STORAGE_BUCKET=lockwise-uploads
```

#### Backblaze B2 Configuration
```env
B2_ACCESS_KEY_ID=your_b2_key_id
B2_SECRET_ACCESS_KEY=your_b2_secret_key
STORAGE_ENDPOINT=https://s3.us-east-005.backblazeb2.com
STORAGE_BUCKET=lockwise-uploads
```

## File Types Supported

### Images
- JPEG/JPG (max 5MB)
- PNG (max 5MB)
- WebP (max 5MB)
- GIF (max 5MB)

### Documents
- PDF (max 10MB)
- Microsoft Word (.doc, .docx) (max 10MB)
- Microsoft Excel (.xls, .xlsx) (max 10MB)
- Plain Text (.txt) (max 10MB)
- CSV (.csv) (max 10MB)

## Security Features

### File Validation
- **Magic Byte Verification**: Ensures file content matches declared type
- **MIME Type Checking**: Whitelist-based type validation
- **Size Restrictions**: Prevents oversized uploads
- **Malicious Content Scanning**: Detects suspicious patterns

### Access Control
- **Signed URLs**: Temporary access to private files
- **Folder Organization**: Estate-specific document isolation
- **Authentication Required**: All endpoints require valid JWT

## Usage Examples

### Single File Upload
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder', 'profiles');

fetch('/api/v1/upload/single', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Estate Document Upload
```javascript
const formData = new FormData();
formData.append('file', documentFile);
formData.append('estateId', 'estate_123');
formData.append('documentType', 'certificate');

fetch('/api/v1/upload/estate-document', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## File Organization Structure

```
storage-bucket/
├── general/           # General uploads
├── profiles/          # User profile images
├── estates/
│   ├── {estate_id}/
│   │   ├── certificates/
│   │   ├── contracts/
│   │   ├── images/
│   │   └── thumbnails/
└── thumbnails/        # Auto-generated thumbnails
```

## Response Format

### Successful Upload
```json
{
  "status": "success",
  "data": {
    "url": "https://bucket.s3.region.amazonaws.com/path/file.jpg",
    "thumbnailUrl": "https://bucket.s3.region.amazonaws.com/path/thumbnails/file.jpg",
    "key": "folder/unique_id.jpg"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "File type not allowed"
}
```

## Installation Requirements

Add to package.json dependencies:
```json
{
  "sharp": "^0.32.0",
  "multer-s3": "^3.0.1",
  "mime-types": "^2.1.35",
  "file-type": "^18.0.0"
}
```

## Benefits

1. **Multi-Provider Support**: Works with AWS S3 and Backblaze B2
2. **Security First**: Comprehensive file validation and scanning
3. **Performance Optimized**: Automatic image optimization and thumbnails
4. **Estate-Specific**: Organized document management for estates
5. **Scalable**: Cloud storage with CDN capabilities
6. **Developer Friendly**: Clear API with Swagger documentation