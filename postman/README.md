# Lockwise API - Postman Documentation

## Import Collection

1. Open Postman
2. Click **Import** button
3. Select `Lockwise-API.postman_collection.json`
4. Collection will be imported with all endpoints

## Setup

### Environment Variables
- `baseUrl`: `http://localhost:3000/api/v1`
- `accessToken`: Auto-populated after login

## Registration Flow

### 1. Register Referrer (Optional)
```
POST /referrers
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "referral_code": "REF123"
}
```

### 2. Register Estate
```
POST /estate
{
  "name": "Lekki Gardens",
  "address": "Admiralty Way, Lagos",
  "type": "residential",
  "contact_phone": "08012345678",
  "contact_email": "info@estate.com",
  "total_number_of_apartments": 100,
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "referrer_id": "uuid-from-step-1"
}
```

### 3. Register Manager
```
POST /user/register
{
  "title": "Mr",
  "first_name": "James",
  "last_name": "Smith",
  "email": "manager@estate.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "phone": "08012345678",
  "role": "manager",
  "estate_code": "EST123"
}
```

### 4. Register Residents
```
POST /user/register
{
  "title": "Mrs",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "resident@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "phone": "08012345678",
  "role": "resident",
  "estate_code": "EST123"
}
```

### 5. Register Security Personnel
```
POST /user/register
{
  "title": "Mr",
  "first_name": "Mike",
  "last_name": "Security",
  "email": "security@estate.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "phone": "08012345678",
  "role": "security",
  "estate_code": "EST123"
}
```

## User Roles

- **super_admin**: Full system access
- **admin**: Estate-level administration
- **manager**: Estate management
- **resident**: Resident access
- **security**: Security personnel access

## Authentication

All authenticated endpoints require Bearer token:
```
Authorization: Bearer <accessToken>
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Phone Number Format

Nigerian format: `08012345678` or `+2348012345678`