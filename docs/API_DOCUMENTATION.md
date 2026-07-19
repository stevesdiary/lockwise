# Lockwise API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require a JWT token:
```
Authorization: Bearer <jwt_token>
```

---

## Auth

### Register
`POST /user/register`

**Body**:
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "password": "secret",
  "phone": "+2348012345678",
  "user_type": "resident",
  "estate_code": "EST-001"
}
```
`user_type` is `"resident"` or `"super_admin"`. `estate_code` is omitted for `super_admin`.

### Login
`POST /auth/login`

**Body**: `{ "email": "...", "password": "..." }`

**Response**: `{ "token": "<jwt>", "user": { ... } }`

### Logout
`POST /auth/logout` 🔒

### Get All Users
`GET /user/all` 🔒 Manager+

### Get User by ID
`GET /user/one/:id` 🔒 Manager+

### Delete User
`DELETE /user/delete/:id` 🔒 Admin

### Link User to Estate
`POST /user/link-estate` 🔒

**Body**: `{ "estate_code": "EST-001" }`

### Get Current User's Estate
`GET /user/estate` 🔒

### Upload Avatar
`POST /user/avatar` 🔒 — `multipart/form-data`, field: `avatar` (image, max 5 MB)

### Update Profile
`PUT /user/profile` 🔒

---

## Email Verification

### Send Verification Code
`POST /auth/email/send-code`

**Body**: `{ "email": "jane@example.com" }`

### Verify Code
`POST /auth/email/verify-code`

**Body**: `{ "email": "jane@example.com", "code": "123456" }`

---

## Phone Verification

### Send OTP
`POST /auth/phone/send-otp`

**Body**: `{ "phone": "+2348012345678" }`

### Verify OTP
`POST /auth/phone/verify-otp`

**Body**: `{ "phone": "+2348012345678", "otp": "123456" }`

---

## Password Reset

### Request Reset
`POST /auth/password/request`

**Body**: `{ "email": "jane@example.com" }`

### Reset Password
`POST /auth/password/reset`

**Body**: `{ "token": "<reset_token>", "password": "newpassword" }`

### Change Password
`POST /auth/password/change` 🔒

**Body**: `{ "current_password": "...", "new_password": "..." }`

---

## Google OAuth

### Get OAuth URL
`GET /auth/google/google/url`

### OAuth Callback
`GET /auth/google/google/callback`

### Link Google Account
`POST /auth/google/google/link` 🔒

### Unlink Google Account
`DELETE /auth/google/google/unlink` 🔒

---

## Estate

### Register Estate
`POST /estate/register` 🔒 Admin — requires verified account

**Body**:
```json
{
  "name": "Sunset Gardens",
  "address": "123 Main St",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "total_number_of_apartments": 200
}
```

### Get All Estates
`GET /estate/estates`

### Get Pending Estates
`GET /estate/estates/pending` 🔒 Admin

### Approve Estate
`PATCH /estate/estates/:estateId/approve` 🔒 Admin

### Get Estate by ID
`GET /estate/one/:estateId`

### Get Estate by Code
`GET /estate/code/:estate_code`

### Search Estate
`GET /estate/search/:estate_code`

### Update Estate
`PUT /estate/update/:estateId` 🔒

### Delete Estate
`DELETE /estate/delete/:estateId` 🔒

### Generate Invitation Link
`POST /estate/invite/:estateId` 🔒 Manager+

### Validate Invitation Token
`POST /estate/validate-invite`

**Body**: `{ "token": "<invite_token>" }`

### Bulk Invite Residents
`POST /estate/residents/bulk-invite` 🔒 Manager+

**Body**: `{ "emails": ["a@example.com", "b@example.com"] }`

### Resend Invitation
`POST /estate/residents/resend-invite` 🔒 Manager+

**Body**: `{ "email": "a@example.com" }`

### Estate Health Check
`GET /estate/health`

---

## Estate Addresses (Streets & Units)

### Get Streets for Estate
`GET /estate/estates/:estate_id/streets` 🔒

### Get Units for Street
`GET /estate/streets/:street_id/units` 🔒

### Create Street
`POST /estate/estates/:estate_id/streets` 🔒

**Body**: `{ "name": "Oak Avenue" }`

### Create Unit
`POST /estate/streets/:street_id/units` 🔒

**Body**: `{ "unit_number": "A101" }`

### Get Full Address for Unit
`GET /estate/units/:unit_id/address` 🔒

---

## Access

### Create Access Record
`POST /access`

**Body**:
```json
{
  "access_code": "Dog47",
  "date_in": "2024-01-15",
  "date_out": "2024-01-15",
  "access_type": "guest",
  "is_multi_entry": true,
  "max_entries": 5,
  "resident_id": "<uuid>",
  "remarks": "Birthday party guest"
}
```

### Get All Access Records
`GET /access`

### Get Active Access Records
`GET /access/active`

### Scan Access Code (Gate)
`POST /access/scan`

**Body**: `{ "code": "Dog47", "gate_id": "<uuid>" }`

### Approve Access
`PATCH /access/:accessId/approve` 🔒 — requires `ACCESS_CODES:APPROVE` permission

### Revoke Access
`PATCH /access/:accessId/revoke` 🔒

---

## Access Codes

### Generate Code
`POST /access-codes/generate` 🔒 Resident

### Validate Code
`POST /access-codes/validate` 🔒

**Body**: `{ "code": "Dog47" }`

### Approve Access via Code
`POST /access-codes/approve` 🔒

### Reject Access via Code
`POST /access-codes/reject` 🔒

### Confirm Access
`POST /access-codes/:code/confirm` 🔒

### Revoke Code
`POST /access-codes/:code/revoke` 🔒 Resident

### Get My Access Codes
`GET /access-codes` 🔒

---

## NFC

### Validate NFC Access (Gate reader)
`POST /nfc/validate`

**Body**: `{ "card_uid": "<uid>", "gate_id": "<uuid>" }`

### Get My NFC Card
`GET /nfc/my-card` 🔒

### Get My NFC History
`GET /nfc/my-history` 🔒

### Report Card Lost
`POST /nfc/report-lost` 🔒

---

## Payment

### Initiate Payment
`POST /payment/initiate` 🔒 Resident

**Body**: `{ "amount": 5000, "plan_id": "<uuid>" }`

### Initiate Subscription
`POST /payment/subscription` 🔒 Manager

### Get Current Subscription
`GET /payment/subscription` 🔒 Resident

### Payment Callback (Paystack redirect)
`GET /payment/callback`

### Verify Payment
`GET /payment/verify/:reference` 🔒 Resident

### Get All Payments
`GET /payment/all` 🔒 Resident

### Get Payment by ID
`GET /payment/id/:paymentId` 🔒 Resident

### Get Payment by Reference
`GET /payment/ref/:reference` 🔒 Resident

### Paystack Webhook
`POST /webhooks/paystack`

---

## Plans

### List Plans
`GET /plan`

### Get Plan by ID
`GET /plan/:id`

### Create Plan
`POST /plan`

**Body**: `{ "name": "Basic", "price": 5000, "duration_days": 30 }`

### Update Plan
`PUT /plan/:id`

### Delete Plan
`DELETE /plan/:id`

---

## Referrals

### Register Referrer
`POST /referral/register`

**Body**: `{ "name": "John", "email": "john@example.com", "phone": "+234..." }`

### Get Referrer by Code
`GET /referral/:code`

### List Referrers
`GET /referral`

### Delete Referrer
`DELETE /referral/delete/:id`

### Get Unpaid Bonuses
`GET /referral/bonuses/unpaid` 🔒 Admin

### Get Referrer Bonuses
`GET /referral/referrer/:referrerId/bonuses` 🔒

### Mark Bonus as Paid
`POST /referral/bonuses/:bonusId/pay` 🔒 Admin

---

## Amenities

### Get Estate Amenities
`GET /amenities/estate/:estateId` 🔒

### Create Amenity
`POST /amenities/estate/:estateId` 🔒 Admin/Manager

**Body**: `{ "name": "Swimming Pool", "description": "...", "capacity": 20 }`

### Update Amenity
`PATCH /amenities/:amenityId` 🔒 Admin/Manager

### Delete Amenity
`DELETE /amenities/:amenityId` 🔒 Admin/Manager

---

## Reservations

### Create Reservation
`POST /reservations` 🔒

**Body**: `{ "amenity_id": "<uuid>", "start_time": "2024-01-15T10:00:00Z", "end_time": "2024-01-15T12:00:00Z" }`

### Get My Reservations
`GET /reservations/my` 🔒

### Cancel Reservation
`PATCH /reservations/:reservationId/cancel` 🔒

### Get Available Slots
`GET /reservations/amenities/:amenityId/available` 🔒

**Query**: `?date=2024-01-15`

### Get Estate Reservations
`GET /reservations/estate/:estateId` 🔒 Admin/Manager

---

## Parking

### Get My Parking Slot
`GET /parking/my-slot` 🔒

### Release Slot to Guest
`POST /parking/guest-release` 🔒

**Body**: `{ "guest_name": "Alice", "vehicle_plate": "ABC-123", "duration_hours": 2 }`

### Get My Guest Parkings
`GET /parking/guest-parkings` 🔒

### Cancel Guest Parking
`PATCH /parking/guest-parkings/:id/cancel` 🔒

### Get Estate Parking Slots
`GET /parking/estate/:estateId/slots` 🔒 Admin/Manager

---

## EV Charging

### Get Charging Slots
`GET /ev-charging/estate/:estateId/slots` 🔒

### Start Charging Session
`POST /ev-charging/sessions/start` 🔒

**Body**: `{ "slot_id": "<uuid>" }`

### Stop Charging Session
`POST /ev-charging/sessions/:sessionId/stop` 🔒

### Get My Sessions
`GET /ev-charging/sessions/my` 🔒

### Get Active Session
`GET /ev-charging/sessions/active` 🔒

---

## Notifications

### Get My Notifications
`GET /notifications` 🔒

### Mark Notification as Read
`PATCH /notifications/:id` 🔒

### Mark All as Read
`PATCH /notifications/mark-all-read` 🔒

### Clear All Notifications
`DELETE /notifications/clear-all` 🔒

### Send Test SMS
`POST /notifications/test/sms` 🔒

### Get Queue Stats
`GET /notifications/queue/stats` 🔒

### Send Bulk Notification
`POST /notifications/bulk` 🔒

**Body**: `{ "user_ids": ["<uuid>"], "title": "...", "message": "..." }`

---

## Chat

### Create Support Chat
`POST /chat/create` 🔒

### Send Message
`POST /chat/send` 🔒 — `multipart/form-data`, field: `attachments` (up to 3 files)

**Body fields**: `chat_id`, `message`

### Get Chat History
`GET /chat/history/:chatId` 🔒

---

## Emergency

### Create Alert
`POST /emergency/alerts` 🔒

**Body**: `{ "type": "fire", "description": "...", "location": "Block A" }`

### Get Alerts
`GET /emergency/alerts` 🔒

### Resolve Alert
`PUT /emergency/alerts/:alertId/resolve` 🔒

### Get Emergency Contacts
`GET /emergency/contacts` 🔒

### Create Emergency Contact
`POST /emergency/contacts` 🔒

**Body**: `{ "name": "Police", "phone": "+234...", "type": "police" }`

### Setup Default Contacts
`POST /emergency/contacts/setup-defaults` 🔒

---

## Community (Real-time Messages)

### Get Messages
`GET /community/messages` 🔒

### Send Message
`POST /community/messages` 🔒

**Body**: `{ "content": "Hello estate!" }`

### Send Message with File
`POST /community/messages/file` 🔒 — `multipart/form-data`, field: `file`

### Add Reaction
`POST /community/messages/:messageId/reactions` 🔒

**Body**: `{ "emoji": "👍" }`

### Remove Reaction
`DELETE /community/messages/:messageId/reactions/:emoji` 🔒

### Send Announcement
`POST /community/announcements` 🔒

**Body**: `{ "title": "...", "content": "..." }`

---

## Community Board

### Get Posts
`GET /community/posts` 🔒

### Create Post
`POST /community/posts` 🔒

**Body**: `{ "title": "...", "content": "..." }`

### Add Comment
`POST /community/posts/:postId/comments` 🔒

**Body**: `{ "content": "..." }`

### Get Chat Messages
`GET /community/chat` 🔒

### Send Chat Message
`POST /community/chat` 🔒

**Body**: `{ "content": "..." }`

### Create Announcement
`POST /community/announcements` 🔒

### Create Meeting
`POST /community/meetings` 🔒

**Body**: `{ "title": "AGM", "scheduled_at": "2024-02-01T10:00:00Z", "location": "Community Hall" }`

---

## FAQs

### Get FAQs
`GET /faqs`

**Query**: `?category=general&search=password`

Categories: `general`, `access_codes`, `payments`, `security`, `technical`

### Create FAQ
`POST /faqs` 🔒 Admin/Manager

**Body**: `{ "question": "...", "answer": "...", "category": "general", "order_index": 1 }`

### Update FAQ
`PUT /faqs/:id` 🔒 Admin/Manager

### Delete FAQ
`DELETE /faqs/:id` 🔒 Admin/Manager

### Get Admin FAQs
`GET /faqs/admin` 🔒 Admin/Manager

---

## Support

### Get Support Info
`GET /support/info` 🔒

### Create Ticket
`POST /support/tickets` 🔒

**Body**: `{ "subject": "...", "message": "...", "category": "billing" }`

### Get My Tickets
`GET /support/tickets/my` 🔒

### Get Ticket Messages
`GET /support/tickets/:ticketId/messages` 🔒

### Send Ticket Message
`POST /support/tickets/:ticketId/messages` 🔒

**Body**: `{ "message": "..." }`

### Get Open Tickets (Agent)
`GET /support/tickets/open` 🔒 — requires `SUPPORT_TICKETS:UPDATE`

### Get Assigned Tickets (Agent)
`GET /support/tickets/assigned` 🔒 — requires `SUPPORT_TICKETS:UPDATE`

### Assign Ticket
`POST /support/tickets/:ticketId/assign` 🔒 — requires `SUPPORT_TICKETS:UPDATE`

**Body**: `{ "agent_id": "<uuid>" }`

### Update Ticket Status
`PATCH /support/tickets/:ticketId/status` 🔒 — requires `SUPPORT_TICKETS:UPDATE`

**Body**: `{ "status": "resolved" }`

---

## Admin Support

### Get All Tickets
`GET /admin/support/tickets` 🔒 Admin/Manager

### Assign Ticket
`PUT /admin/support/tickets/:ticketId/assign` 🔒 Admin/Manager

### Update Ticket Status
`PUT /admin/support/tickets/:ticketId/status` 🔒 Admin/Manager

### Add Admin Message
`POST /admin/support/tickets/:ticketId/messages` 🔒 Admin/Manager

### Get Ticket Stats
`GET /admin/support/stats` 🔒 Admin/Manager

### Search Tickets
`GET /admin/support/search` 🔒 Admin/Manager

**Query**: `?q=billing&status=open`

---

## Analytics

### Get Dashboard
`GET /analytics/dashboard` 🔒 Manager+

### Get User Analytics
`GET /analytics/user/:userId` 🔒 Manager+

### Get Performance Report
`GET /analytics/performance` 🔒 Admin

### Get System Status
`GET /analytics/system` 🔒 Admin

### Track Custom Event
`POST /analytics/track` 🔒

**Body**: `{ "event": "page_view", "properties": { ... } }`

---

## Dashboard

### Admin Overview
`GET /dashboard/admin/overview` 🔒 Admin

### Admin Payments
`GET /dashboard/admin/payments` 🔒 Admin

### Admin Users
`GET /dashboard/admin/users` 🔒 Admin

### Admin Access Logs
`GET /dashboard/admin/access-logs` 🔒 Admin

### Admin Analytics
`GET /dashboard/admin/analytics` 🔒 Admin

### Manager Estate Overview
`GET /dashboard/manager/:estate_id/overview` 🔒 Manager+

### Manager Residents
`GET /dashboard/manager/:estate_id/residents` 🔒 Manager+

### Manager Pending Residents
`GET /dashboard/manager/:estate_id/residents/pending` 🔒 Manager+

### Manager Access Logs
`GET /dashboard/manager/:estate_id/access-logs` 🔒 Manager+

### Manager Payments
`GET /dashboard/manager/:estate_id/payments` 🔒 Manager+

### Pending Access Requests
`GET /dashboard/manager/:estate_id/access/pending` 🔒 Manager+

### Approve Access Request
`POST /dashboard/manager/access/:access_id/approve` 🔒 Manager+

### Revoke Access Request
`POST /dashboard/manager/access/:access_id/revoke` 🔒 Manager+

### Update User Role (Manager)
`PUT /dashboard/manager/users/:user_id/role` 🔒 Manager+

**Body**: `{ "role": "security" }`

### Approve Resident
`POST /dashboard/manager/residents/:user_id/approve` 🔒 Manager+

### Set Resident Inactive
`POST /dashboard/manager/residents/:user_id/inactive` 🔒 Manager+

### Reject Resident
`POST /dashboard/manager/residents/:user_id/reject` 🔒 Manager+

---

## Admin Dashboard

### Get Dashboard
`GET /admin/dashboard` 🔒 Admin

### Get Estates
`GET /admin/dashboard/estates` 🔒 Admin

### Resident Stats
`GET /admin/dashboard/stats/residents` 🔒 Admin

### Access Code Stats
`GET /admin/dashboard/stats/access-codes` 🔒 Admin

### Referrer Stats
`GET /admin/dashboard/stats/referrers` 🔒 Admin

---

## Monitoring

### Health Check
`GET /monitoring/health`

### Get Metrics
`GET /monitoring/metrics` 🔒

### Reset Metrics
`POST /monitoring/metrics/reset` 🔒

---

## Upload

### Upload File
`POST /upload/upload` 🔒 — `multipart/form-data`, field: `file` (max 10 MB)

### Get Files
`GET /upload/files` 🔒

### Serve File
`GET /upload/file/:folder/:filename`

---

## Bulk Upload

### Upload Estates (CSV/Excel)
`POST /bulk-upload/estates` — `multipart/form-data`, field: `file`

### Upload Residents (CSV/Excel)
`POST /bulk-upload/residents` — `multipart/form-data`, field: `file`

### Upload Addresses (CSV/Excel)
`POST /bulk-upload/addresses` — `multipart/form-data`, field: `file`

### Download Template
`GET /bulk-upload/template/:type`

`type`: `estates`, `residents`, `addresses`

---

## Location

### Update Address Coordinates
`PUT /address/location/:addressId` 🔒

**Body**: `{ "latitude": 6.5244, "longitude": 3.3792 }`

### Get Address Location
`GET /address/location/:addressId` 🔒

---

## Mobile

### Register Device
`POST /mobile/device/register` 🔒

**Body**: `{ "token": "<fcm_token>", "platform": "ios" }`

### Unregister Device
`DELETE /mobile/device/register` 🔒

### Test Push Notification
`POST /mobile/push/test` 🔒

---

## Admin

### Register Admin
`POST /admin/register` — requires admin secret key

**Body**: `{ "email": "...", "password": "...", "secret_key": "<admin_secret>" }`

### Create Agent
`POST /admin/agents/create` 🔒 Admin

**Body**: `{ "email": "...", "password": "...", "name": "..." }`

---

## Roles

### Get All Roles
`GET /role/all` 🔒

### Get Role by ID
`GET /role/:roleId` 🔒

### Create Role
`POST /role/create` 🔒 Admin — CSRF token required

**Body**: `{ "name": "security", "description": "..." }`

### Update Role
`PUT /role/update/:roleId` 🔒 Admin — CSRF token required

### Delete Role
`DELETE /role/delete/:roleId` 🔒 Admin — CSRF token required

### Assign Permissions to Role
`POST /role/assign-permissions/:roleId` 🔒 Admin — CSRF token required

**Body**: `{ "permission_ids": ["<uuid>", "<uuid>"] }`

---

## Permissions

### Create Permission
`POST /permission/create`

**Body**: `{ "name": "access_codes:approve", "description": "..." }`

### Get All Permissions
`GET /permission/all`

### Get Permission by ID
`GET /permission/:id`

### Update Permission
`PUT /permission/:id`

### Delete Permission
`DELETE /permission/:id`

---

## User Role

### Update User Role
`PUT /admin/users/:userId/role` 🔒 — requires `ROLES:UPDATE`

**Body**: `{ "role": "manager" }`

---

## API Keys

### Generate API Key
`POST /api-key/generate` 🔒 Admin

**Body**: `{ "name": "Mobile App Key" }`

### List API Keys
`GET /api-key/list` 🔒 Admin

### Revoke API Key
`DELETE /api-key/:keyId` 🔒 Admin

---

## Config

### Get Map Config
`GET /config/map` 🔒

---

## Legal

### Terms and Conditions
`GET /legal/terms`

### Privacy Policy
`GET /legal/privacy`

---

## Error Responses

```json
{
  "status": "fail",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Tier | Limit |
|------|-------|
| `auth` | 5 req / 15 min per IP |
| `strict` | 10 req / 15 min per IP |
| `api` | 100 req / 15 min per IP |

---

## Pagination

Endpoints returning lists accept:

| Param | Default | Max |
|-------|---------|-----|
| `page` | 1 | — |
| `limit` | 20 | 100 |

**Response**:
```json
{
  "status": "success",
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 20, "total": 150, "pages": 8 }
  }
}
```

---

## Legend

🔒 = requires `Authorization: Bearer <token>`  
Admin = `super_admin` role  
Manager+ = `manager` or `admin` role  
Resident = `resident` role
