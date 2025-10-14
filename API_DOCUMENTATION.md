# Lockwise API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require JWT token:
```
Authorization: Bearer <jwt_token>
```

## Access Code Management

### Generate Themed Access Code
Generate a themed access code based on current weekly category.

**Endpoint**: `POST /access-codes/generate`

**Response**:
```json
{
  "status": "success",
  "data": {
    "accessCode": "Dog47",
    "category": "animals"
  }
}
```

### Generate Custom Event Code
Create custom access code for events.

**Endpoint**: `POST /access-codes/custom`

**Request Body**:
```json
{
  "eventName": "Clara's Birthday Party"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "accessCode": "ClarasBirthdayParty76"
  }
}
```

### Refresh Category
Force refresh of weekly category for estate.

**Endpoint**: `POST /access-codes/refresh-category`

**Response**:
```json
{
  "status": "success",
  "data": {
    "category": "countries"
  }
}
```

## Location & Mapping

### Get Estate Map Data
Retrieve map data for estate with all unit locations.

**Endpoint**: `GET /addresses/map/:estateId?`

**Response**:
```json
{
  "status": "success",
  "data": {
    "estate": {
      "name": "Sunset Gardens",
      "address": "123 Main St, Lagos",
      "latitude": 6.5244,
      "longitude": 3.3792
    },
    "locations": [
      {
        "address_id": "uuid",
        "apartment_number": "A101",
        "latitude": 6.5245,
        "longitude": 3.3793,
        "full_address": "A101, Block A, Sunset Gardens, Lagos"
      }
    ]
  }
}
```

### Update Address Coordinates
Update latitude/longitude for specific address.

**Endpoint**: `PUT /addresses/:addressId/location`

**Response**:
```json
{
  "status": "success",
  "message": "Address coordinates updated successfully"
}
```

### Get Directions
Generate Google Maps directions URL.

**Endpoint**: `GET /addresses/directions`

**Query Parameters**:
- `fromLat`: Starting latitude
- `fromLng`: Starting longitude  
- `toLat`: Destination latitude
- `toLng`: Destination longitude

**Response**:
```json
{
  "status": "success",
  "data": {
    "directionsUrl": "https://www.google.com/maps/dir/6.5244,3.3792/6.5245,3.3793"
  }
}
```

## Access Management

### Create Access Entry
Create new access permission for guest/resident.

**Endpoint**: `POST /access`

**Request Body**:
```json
{
  "access_code": "Dog47",
  "date_in": "2024-01-15",
  "date_out": "2024-01-15",
  "access_type": "guest",
  "is_multi_entry": true,
  "max_entries": 5,
  "resident_id": "uuid",
  "remarks": "Birthday party guest"
}
```

### Verify Access Code
Validate access code and record entry.

**Endpoint**: `POST /access/verify`

**Request Body**:
```json
{
  "access_code": "Dog47",
  "gate_id": "main_gate"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "access_granted": true,
    "remaining_entries": 4,
    "access_type": "guest",
    "resident_name": "John Doe"
  }
}
```

## User Management

### Get User Profile
Retrieve current user information.

**Endpoint**: `GET /user/profile`

**Response**:
```json
{
  "status": "success",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "resident",
    "estate_id": "uuid",
    "estate_name": "Sunset Gardens"
  }
}
```

## Estate Management

### Get Estate Details
Retrieve estate information.

**Endpoint**: `GET /estate/:estateId`

**Response**:
```json
{
  "status": "success",
  "data": {
    "estate_id": "uuid",
    "name": "Sunset Gardens",
    "address": "123 Main St, Lagos",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "total_number_of_apartments": 200,
    "status": "active"
  }
}
```

## FAQ Management

### Get FAQs
Retrieve frequently asked questions, optionally filtered by category or search term.

**Endpoint**: `GET /faqs`

**Query Parameters**:
- `category`: Filter by category (`general`, `access_codes`, `payments`, `security`, `technical`)
- `search`: Search in questions and answers

**Response**:
```json
{
  "status": "success",
  "data": {
    "general": [
      {
        "id": "uuid",
        "question": "How do I reset my password?",
        "answer": "Click on 'Forgot Password' on the login page..."
      }
    ],
    "access_codes": [
      {
        "id": "uuid",
        "question": "How long are access codes valid?",
        "answer": "Access codes are valid for the duration specified..."
      }
    ]
  }
}
```

### Create FAQ (Admin)
Create a new FAQ entry.

**Endpoint**: `POST /faqs`

**Authorization**: Admin, Manager

**Request Body**:
```json
{
  "question": "How do I generate access codes?",
  "answer": "To generate access codes, go to the Access Codes section...",
  "category": "access_codes",
  "order_index": 1
}
```

### Update FAQ (Admin)
Update an existing FAQ.

**Endpoint**: `PUT /faqs/:id`

**Authorization**: Admin, Manager

### Delete FAQ (Admin)
Delete an FAQ entry.

**Endpoint**: `DELETE /faqs/:id`

**Authorization**: Admin, Manager

### Get Admin FAQs
Retrieve all FAQs with admin details.

**Endpoint**: `GET /faqs/admin`

**Authorization**: Admin, Manager

## Analytics

### Get Detailed System Analytics
Retrieve comprehensive system analytics including estates, residents, security staff, and revenue.

**Endpoint**: `GET /analytics/detailed`

**Authorization**: Admin only

**Response**:
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalEstates": 25,
      "totalResidents": 1250,
      "totalSecurityStaff": 75,
      "totalRevenue": 125000,
      "totalUsers": 1400
    },
    "estateBreakdown": [
      {
        "estate_id": "uuid",
        "name": "Sunset Gardens",
        "location": "Lagos, Lagos",
        "status": "active",
        "resident_count": 150
      }
    ],
    "userRoleDistribution": [
      { "role": "resident", "count": 1250 },
      { "role": "security", "count": 75 },
      { "role": "manager", "count": 50 }
    ],
    "monthlyRevenue": [
      {
        "month": "2024-01-01",
        "revenue": 15000,
        "payment_count": 45
      }
    ],
    "accessTypeDistribution": [
      { "type": "guest", "count": 2500 },
      { "type": "resident", "count": 8000 }
    ]
  }
}
```

### Get Estate-Specific Analytics
Retrieve analytics for a specific estate.

**Endpoint**: `GET /analytics/estate/:estateId`

**Authorization**: Admin, Manager

**Response**:
```json
{
  "status": "success",
  "data": {
    "estate": {
      "estate_id": "uuid",
      "name": "Sunset Gardens",
      "address": "123 Main St, Lagos",
      "total_number_of_apartments": 200,
      "status": "active"
    },
    "metrics": {
      "totalResidents": 150,
      "securityStaff": 8,
      "recentAccessCount": 450,
      "totalRevenue": 25000,
      "occupancyRate": "75.0"
    }
  }
}
```

### Get Revenue Analytics
Retrieve revenue analytics for specified period.

**Endpoint**: `GET /analytics/revenue`

**Query Parameters**:
- `period`: `week`, `month`, or `year` (default: `month`)

**Authorization**: Admin, Manager

**Response**:
```json
{
  "status": "success",
  "data": {
    "totalRevenue": 45000,
    "paymentCount": 125,
    "period": "month",
    "payments": [
      {
        "amount": 500,
        "createdAt": "2024-01-15T10:30:00Z",
        "currency": "NGN"
      }
    ]
  }
}
```

### Get System Statistics
Retrieve basic system statistics.

**Endpoint**: `GET /analytics/stats`

**Authorization**: Admin only

**Response**:
```json
{
  "status": "success",
  "data": {
    "totalUsers": 1400,
    "totalEstates": 25,
    "activeSubscriptions": 20,
    "totalRevenue": 125000
  }
}
```

## File Upload

### Upload Address File
Bulk upload addresses from Excel/CSV file.

**Endpoint**: `POST /addresses/upload`

**Content-Type**: `multipart/form-data`

**Form Data**:
- `addressFile`: Excel or CSV file

**Response**:
```json
{
  "status": "success",
  "message": "Addresses uploaded successfully",
  "data": {
    "totalProcessed": 50,
    "addressesCreated": 45,
    "errors": 5,
    "errorDetails": ["Row 3: Invalid apartment number"]
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "status": "fail",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing JWT token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting
- **Default**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP

## Pagination
For endpoints returning lists:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format**:
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

## Webhooks
Configure webhooks for real-time notifications:

**Events**:
- `access.granted`: When access is granted
- `access.denied`: When access is denied
- `user.created`: When new user is added

**Payload Format**:
```json
{
  "event": "access.granted",
  "timestamp": "2024-01-15T10:30:00Z",
  "estate_id": "uuid",
  "data": {
    "access_code": "Dog47",
    "user_id": "uuid",
    "gate_id": "main_gate"
  }
}
```