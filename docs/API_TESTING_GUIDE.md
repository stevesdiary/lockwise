# Lockwise API Testing Guide

## Overview
This guide provides comprehensive documentation for testing all Lockwise API endpoints. The API is fully documented with Swagger/OpenAPI 3.0 specifications.

## Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.lockwise.com/api/v1`

## Authentication
Most endpoints require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

## Swagger Documentation
Access the interactive API documentation at:
- **Development**: `http://localhost:3000/api-docs`
- **Production**: `https://api.lockwise.com/api-docs`

## API Endpoints by Module

### 1. Authentication Module
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/google/login` - Google OAuth login
- `POST /auth/password/reset` - Request password reset

### 2. User Management Module
- `POST /user/register` - Register new user
- `GET /user/all` - Get all users (paginated)
- `GET /user/one/{id}` - Get user by ID
- `DELETE /user/delete/{id}` - Delete user

### 3. Estate Management Module
- `POST /estate/register` - Register new estate
- `GET /estate/estates` - Get all estates
- `GET /estate/one/{estateId}` - Get estate by ID
- `PUT /estate/update/{estateId}` - Update estate
- `DELETE /estate/delete/{estateId}` - Delete estate

### 4. Access Control Module
- `POST /access` - Create access record
- `GET /access/all` - Get all access records
- `GET /access/active` - Get active access records
- `PUT /access/{accessId}/approve` - Approve access request
- `POST /access/{accessId}/entry` - Record entry
- `POST /access/{accessId}/exit` - Record exit
- `POST /access-codes/generate` - Generate access code
- `POST /access-codes/validate` - Validate access code

### 5. Payment Module
- `POST /payment/initiate` - Initiate payment
- `GET /payment/verify/{reference}` - Verify payment
- `GET /payment/all` - Get all payments (paginated)
- `GET /payment/id/{paymentId}` - Get payment by ID
- `GET /payment/ref/{reference}` - Get payment by reference

### 6. Plan Management Module
- `GET /plan` - Get all plans
- `POST /plan` - Create plan
- `GET /plan/{id}` - Get plan by ID
- `PUT /plan/{id}` - Update plan
- `DELETE /plan/{id}` - Delete plan

### 7. Referral System Module
- `POST /referral/register` - Register referrer
- `GET /referral/{code}` - Get referrer by code
- `GET /referral` - List all referrers
- `DELETE /referral/delete/{id}` - Delete referrer

### 8. Amenities Module
- `GET /amenities/estate/{estateId}` - Get estate amenities
- `POST /amenities/estate/{estateId}` - Create amenity
- `PATCH /amenities/{amenityId}` - Update amenity
- `DELETE /amenities/{amenityId}` - Delete amenity

### 9. Reservations Module
- `GET /reservations` - Get reservations
- `POST /reservations` - Create reservation
- `PUT /reservations/{id}` - Update reservation
- `DELETE /reservations/{id}` - Cancel reservation

### 10. Community Module
- `GET /community/posts` - Get community posts
- `POST /community/posts` - Create community post
- `POST /community/posts/{postId}/comments` - Add comment to post
- `GET /community/chat` - Get chat messages
- `POST /community/chat` - Send chat message
- `POST /community/announcements` - Create announcement
- `POST /community/meetings` - Create meeting

### 11. Support Module
- `POST /support/tickets` - Create support ticket
- `GET /support/tickets/my` - Get my tickets
- `GET /support/tickets/open` - Get open tickets (admin/manager)
- `GET /support/tickets/assigned` - Get assigned tickets (agents)
- `GET /support/tickets/{ticketId}/messages` - Get ticket messages
- `POST /support/tickets/{ticketId}/messages` - Send message
- `POST /support/tickets/{ticketId}/assign` - Assign ticket
- `PATCH /support/tickets/{ticketId}/status` - Update ticket status

### 12. FAQ Module
- `GET /faqs` - Get FAQs (with filtering)
- `POST /faqs` - Create FAQ (admin/manager)
- `PUT /faqs/{id}` - Update FAQ (admin/manager)
- `DELETE /faqs/{id}` - Delete FAQ (admin/manager)
- `GET /faqs/admin` - Get admin FAQs

### 13. Analytics Module
- `GET /analytics/detailed` - Get detailed system analytics (admin)
- `GET /analytics/estate/{estateId}` - Get estate analytics
- `GET /analytics/revenue` - Get revenue analytics
- `GET /analytics/stats` - Get system statistics
- `GET /dashboard` - Get dashboard data
- `GET /admin/dashboard` - Get admin dashboard data

### 14. Notification Module
- `POST /notifications` - Send notification
- `GET /notifications` - Get notifications
- `PUT /notifications/{id}/read` - Mark notification as read
- `POST /notifications/bulk` - Send bulk notifications

### 15. Communication Module
- `POST /chat/create` - Create support chat
- `POST /chat/send` - Send chat message
- `GET /chat/history/{chatId}` - Get chat history
- `POST /emergency` - Report emergency
- `GET /emergency` - Get emergency reports

### 16. Upload Module
- `POST /upload/upload` - Upload file
- `GET /upload/files` - Get uploaded files
- `POST /upload/test-upload` - Test upload (no auth)
- `GET /upload/test-files` - Test get files (no auth)

### 17. Bulk Upload Module
- `POST /bulk-upload/estates` - Bulk upload estates
- `POST /bulk-upload/residents` - Bulk upload residents
- `POST /bulk-upload/addresses` - Bulk upload addresses
- `GET /bulk-upload/jobs` - Get bulk upload jobs
- `GET /bulk-upload/jobs/{id}` - Get bulk upload job status

### 18. Location Module
- `POST /address` - Create address
- `GET /address` - Get addresses
- `GET /address/{id}` - Get address by ID
- `PUT /address/{id}` - Update address
- `DELETE /address/{id}` - Delete address
- `GET /address/map/{estateId}` - Get estate map data
- `PUT /address/{id}/location` - Update address coordinates
- `GET /address/directions` - Get directions

### 19. Mobile Module
- `POST /mobile/register` - Register mobile device
- `GET /mobile/devices` - Get registered devices
- `DELETE /mobile/devices/{id}` - Unregister device
- `POST /mobile/sync` - Sync mobile data
- `POST /mobile/push/test` - Test push notification

### 20. Admin Module
- `POST /admin/register` - Register admin
- `POST /admin/agents/create` - Create customer service agent
- `GET /role` - Get roles
- `POST /role` - Create role
- `PUT /role/{id}` - Update role
- `DELETE /role/{id}` - Delete role
- `GET /permission` - Get permissions
- `POST /permission` - Create permission
- `GET /api-key` - Get API keys
- `POST /api-key` - Create API key
- `DELETE /api-key/{id}` - Delete API key
- `GET /config` - Get configuration
- `PUT /config` - Update configuration

### 21. Parking Module
- `GET /parking` - Get parking slots
- `POST /parking` - Create parking slot
- `PUT /parking/{id}` - Update parking slot
- `DELETE /parking/{id}` - Delete parking slot
- `POST /parking/{id}/reserve` - Reserve parking slot
- `POST /parking/{id}/release` - Release parking slot
- `GET /ev-charging` - Get EV charging stations
- `POST /ev-charging/session` - Start charging session
- `PUT /ev-charging/session/{id}/end` - End charging session

### 22. Legal Module
- `GET /legal/terms` - Get terms and conditions
- `GET /legal/privacy` - Get privacy policy
- `PUT /legal/terms` - Update terms (admin)
- `PUT /legal/privacy` - Update privacy policy (admin)

### 23. Webhook Module
- `POST /webhooks/paystack` - Paystack webhook
- `POST /webhooks/flutterwave` - Flutterwave webhook

### 24. Monitoring Module
- `GET /monitoring/health` - Health check
- `GET /monitoring/metrics` - Get system metrics
- `GET /monitoring/logs` - Get system logs

## Testing Scenarios

### 1. Authentication Flow
1. Login with valid credentials
2. Access protected endpoints with token
3. Logout and verify token invalidation
4. Test Google OAuth flow
5. Test password reset flow

### 2. User Management Flow
1. Register new user
2. Get user details
3. Update user information
4. List all users (admin)
5. Delete user (admin)

### 3. Estate Management Flow
1. Create new estate
2. Get estate details
3. Update estate information
4. List all estates
5. Delete estate

### 4. Access Control Flow
1. Create access record
2. Generate access code
3. Validate access code
4. Record entry/exit
5. Approve/deny access requests

### 5. Payment Flow
1. Initiate payment
2. Verify payment status
3. Get payment history
4. Handle webhook notifications

### 6. Community Features Flow
1. Create community post
2. Add comments
3. Create announcements
4. Schedule meetings
5. Manage FAQs

### 7. Support System Flow
1. Create support ticket
2. Send messages
3. Assign tickets (admin)
4. Update ticket status
5. Close tickets

### 8. File Upload Flow
1. Upload single file
2. Bulk upload data
3. Get upload status
4. Download files

## Error Handling
All endpoints return standardized error responses:
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error",
      "type": "validation_type"
    }
  ]
}
```

## Rate Limiting
- **Default**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP
- **Strict**: 10 requests per 15 minutes for sensitive operations

## Pagination
For endpoints returning lists:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response format:
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

## Testing Tools
1. **Swagger UI**: Interactive API testing at `/api-docs`
2. **Postman**: Import collection from `/postman/`
3. **cURL**: Command-line testing
4. **Jest**: Automated testing suite

## Environment Variables
Required for testing:
- `JWT_SECRET`: JWT signing secret
- `DATABASE_URL`: Database connection string
- `PAYSTACK_SECRET_KEY`: Payment provider key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `REDIS_URL`: Redis connection string

## Security Testing
1. Test authentication bypass attempts
2. Verify role-based access control
3. Test input validation
4. Check for SQL injection vulnerabilities
5. Verify rate limiting effectiveness

## Performance Testing
1. Load testing with multiple concurrent users
2. Database query optimization verification
3. File upload performance testing
4. API response time monitoring

This comprehensive documentation covers all 100+ endpoints across 24 modules, providing complete API testing coverage for the Lockwise system.