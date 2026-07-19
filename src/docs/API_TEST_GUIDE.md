# API Endpoint Testing Guide

## Prerequisites
1. Server running on `http://localhost:3001`
2. Database seeded with test user
3. `jq` installed for JSON parsing (optional but recommended)

## Test User Credentials
```
Email: test@example.com
Password: password123
```

## Quick Test (Automated)
Run the bash script:
```bash
./test-endpoints.sh
```

## Manual Testing

### 1. Login & Get Token
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "first_name": "...",
      "last_name": "...",
      "phone_number": "...",
      "estate_id": "...",
      "role": "resident"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token:**
```bash
export TOKEN="<your_token_here>"
```

---

### 2. Update Profile
```bash
curl -X PUT http://localhost:3001/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "estate_id": "...",
    "role": "resident"
  }
}
```

**Test Cases:**
- ✅ Valid update with all fields
- ✅ Partial update (only first_name)
- ❌ Without authentication token (should return 401)
- ❌ Invalid phone format (should validate)

---

### 3. Generate Access Code for Guest (Single Entry)
```bash
curl -X POST http://localhost:3001/access \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "access_type": "visitor",
    "scheduled_entry_date": "2024-12-20T10:00:00Z",
    "scheduled_exit_date": "2024-12-20T18:00:00Z",
    "valid_from": "2024-12-20T00:00:00Z",
    "valid_until": "2024-12-27T23:59:59Z",
    "vehicle_number": "ABC123",
    "remarks": "Guest visitor - John Smith",
    "is_multi_entry": false,
    "max_entries": 1
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Access request created successfully",
  "data": {
    "id": "...",
    "user_id": "...",
    "estate_id": "...",
    "access_type": "visitor",
    "status": "pending",
    "scheduled_entry_date": "2024-12-20T10:00:00.000Z",
    "scheduled_exit_date": "2024-12-20T18:00:00.000Z",
    "valid_from": "2024-12-20T00:00:00.000Z",
    "valid_until": "2024-12-27T23:59:59.000Z",
    "vehicle_number": "ABC123",
    "remarks": "Guest visitor - John Smith",
    "is_multi_entry": false,
    "max_entries": 1,
    "used_entries": 0
  }
}
```

---

### 4. Generate Access Code for Domestic Staff (Unlimited Entry)
```bash
curl -X POST http://localhost:3001/access \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "access_type": "domestic_staff",
    "scheduled_entry_date": "2024-12-20T08:00:00Z",
    "scheduled_exit_date": "2024-12-31T20:00:00Z",
    "valid_from": "2024-12-20T00:00:00Z",
    "valid_until": "2024-12-31T23:59:59Z",
    "remarks": "Housekeeper - Daily access"
  }'
```

**Note:** For `domestic_staff`, `service`, and `maintenance` types:
- `is_multi_entry` is automatically set to `true`
- `max_entries` is set to `null` (unlimited)

---

### 5. Get All Access Codes
```bash
curl -X GET http://localhost:3001/access \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "...",
      "access_type": "visitor",
      "status": "pending",
      "scheduled_entry_date": "...",
      "scheduled_exit_date": "...",
      "vehicle_number": "ABC123",
      "remarks": "Guest visitor - John Smith"
    }
  ]
}
```

**Query Parameters:**
- `estate_id` - Filter by estate
- `user_id` - Filter by user
- `status` - Filter by status (pending, approved, active, expired)
- `limit` - Limit results
- `offset` - Pagination offset

---

### 6. Get Active Access Codes
```bash
curl -X GET "http://localhost:3001/access/active?user_id=USER_ID&estate_id=ESTATE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 7. Get Entry Statistics
```bash
curl -X GET http://localhost:3001/access/ACCESS_ID/statistics \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "totalEntries": 0,
    "remainingEntries": 1,
    "usedEntries": 0,
    "isMultiEntry": false,
    "maxEntries": 1,
    "canAcceptMore": {
      "canEnter": true,
      "message": "Entry allowed"
    }
  }
}
```

---

## Access Types

| Type | Multi-Entry | Max Entries | Use Case |
|------|-------------|-------------|----------|
| `visitor` | false | 1 (default) | One-time guest |
| `domestic_staff` | true | null (unlimited) | Daily housekeeper |
| `service` | true | null (unlimited) | Plumber, electrician |
| `maintenance` | true | null (unlimited) | Building maintenance |
| `delivery` | false | 1 | Package delivery |

---

## Error Scenarios to Test

### 1. Unauthorized Access
```bash
curl -X PUT http://localhost:3001/user/profile \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Test"}'
```
**Expected:** 401 Unauthorized

### 2. Invalid Token
```bash
curl -X GET http://localhost:3001/access \
  -H "Authorization: Bearer invalid_token"
```
**Expected:** 401 Unauthorized

### 3. Missing Required Fields
```bash
curl -X POST http://localhost:3001/access \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "access_type": "visitor"
  }'
```
**Expected:** 400 Bad Request

---

## Testing Checklist

### Profile Update
- [ ] Update all fields successfully
- [ ] Update partial fields
- [ ] Verify changes persist
- [ ] Test without authentication
- [ ] Test with invalid data

### Access Code Generation
- [ ] Generate single-entry visitor code
- [ ] Generate multi-entry domestic staff code
- [ ] Generate service provider code
- [ ] Verify auto-assignment of multi-entry for staff types
- [ ] Test date validation
- [ ] Test without authentication
- [ ] Verify access code appears in list

### Access Code Retrieval
- [ ] Get all access codes
- [ ] Filter by status
- [ ] Get active codes only
- [ ] Get entry statistics
- [ ] Verify pagination works

---

## Notes

1. **Authentication:** All protected endpoints require `Authorization: Bearer <token>` header
2. **Date Format:** Use ISO 8601 format (e.g., `2024-12-20T10:00:00Z`)
3. **Status Flow:** pending → approved → active → expired
4. **Entry Limits:** Automatically enforced by the system
5. **Multi-Entry:** Automatically set for domestic_staff, service, and maintenance types

---

## Troubleshooting

### Server not responding
```bash
# Check if server is running
lsof -ti:3001

# Start server
cd lockwise-server
npm run dev
```

### Token expired
- Login again to get a new token
- Tokens expire after 15 minutes

### Database errors
- Ensure PostgreSQL is running
- Check database connection in `.env`
- Run migrations if needed
