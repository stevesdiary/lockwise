# Chat Attachments API

## Overview
The chat system now supports file attachments with proper authentication and permission controls.

## Endpoints

### Send Message with Attachments
```
POST /api/chat/send
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `chatId` (string): Chat identifier
- `message` (string, optional): Text message
- `attachments` (files, optional): Up to 3 files (max 15MB total)

**Supported File Types:**
- Images: JPEG, PNG, WebP, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX
- Text: TXT, CSV

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "1234567890",
    "chatId": "chat_user123_1234567890",
    "message": "Here are the documents",
    "senderId": "user123",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "type": "user",
    "attachments": [
      {
        "id": "1234567890",
        "filename": "document.pdf",
        "url": "http://localhost:3000/api/upload/file/chat/chat_user123_1234567890/abc123.pdf",
        "size": 1024000,
        "mimeType": "application/pdf"
      }
    ]
  }
}
```

### Get Chat History
```
GET /api/chat/history/:chatId
Authorization: Bearer <token>
```

**Permissions:**
- Users can only access their own chats
- Admins and Managers can access all chats

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **File Validation**: Files are validated for type and size
3. **Access Control**: Users can only access their own chats
4. **File Limits**: 
   - Max 3 files per message
   - Max 15MB total size per message
   - Max 10MB per individual file
5. **Secure Storage**: Files stored in organized folders by chat ID

## File Organization
Files are stored in the following structure:
```
chat/
  └── {chatId}/
      ├── file1.pdf
      ├── file2.jpg
      └── thumbnails/
          └── file2.jpg
```

## Error Responses

**File Too Large:**
```json
{
  "status": "error",
  "message": "Total file size cannot exceed 15MB"
}
```

**Too Many Files:**
```json
{
  "status": "error", 
  "message": "Maximum 3 files allowed per message"
}
```

**Access Denied:**
```json
{
  "status": "error",
  "message": "Access denied to this chat"
}
```