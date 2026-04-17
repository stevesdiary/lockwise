# Lockwise API Postman Collection

## Import
Import `Lockwise-API-Complete.postman_collection.json` into Postman

## Variables
- `baseUrl`: http://localhost:3000/api/v1
- `accessToken`: Auto-set after login
- `estateId`: Set manually or from response
- `userId`: Set manually or from response
- `estateCode`: Estate code for linking and searching
- `invitationToken`: Invitation token for validation

## New Features (Updated February 2026)

### Enhanced Access Management
- **Time-based Unlimited Entries**: Domestic staff, service providers, and maintenance workers can enter multiple times within validity period
- **New Access Types**: `domestic_staff`, `service`, `maintenance` now support unlimited entries
- **Entry Statistics API**: Monitor entry counts and remaining allowances
- **Smart Code Scanning**: Automatic entry limit validation with clear error messages
- **Expiration-based Access Control**: All access codes respect validity periods regardless of entry type
- **Access Direction**: Access codes now support `access_direction` (`entry`, `exit`, `both`) to control gate direction

### Access Type Behaviors
- **Regular Types** (`guest`, `delivery`, `visitor`): Traditional entry counting with limits
- **Unlimited Types** (`domestic_staff`, `service`, `maintenance`): Unlimited entries within validity period
- **All Types**: Respect expiration dates and automatic cleanup after expiry

### 🆕 New Estate Invitation APIs (February 2026)

#### Estate Management Endpoints
- **Generate Invitation Link**: `POST /api/v1/estate/invite/{estateId}` - Create secure invitation links for residents
- **Send Bulk Invitations**: `POST /api/v1/estate/residents/bulk-invite` - Send invitation emails to multiple residents
- **Resend Invitation**: `POST /api/v1/estate/residents/resend-invite` - Resend invitation to specific resident

> ⚠️ **Authentication Required**: All invitation endpoints require manager role and estate association

### 🆕 Notification Preferences & Mobile Push (Latest)

#### Notification Preferences
- **Get Preferences**: `GET /api/v1/notifications/preferences` - Retrieve user notification preference flags
- **Update Preferences**: `PUT /api/v1/notifications/preferences` - Toggle individual notification channels
- Preference flags: `push_notifications`, `email_notifications`, `sms_notifications`, `guest_entrance`, `emergency_alerts`, `system_updates`, `payment_reminders`

#### Updated Mobile Device Registration
- **Register Device**: `POST /api/v1/mobile/device/register` - Now accepts `fcmToken`, `deviceId`, `platform`, `appVersion`
- **Test Push**: `POST /api/v1/mobile/push/test` - Now sends real FCM push with optional `title`, `body`, `data`

### 1. Authentication
- Login (auto-saves token)
- Refresh Token
- Logout
- Google OAuth
- **Send OTP** (NEW - Send 6-digit code to phone)
- **Verify OTP** (NEW - Verify phone number with OTP)

### 2. Users
- Register (Manager/Resident/Security)
- Get All Users
- Get/Update/Delete User
- **Link User to Estate** (NEW - Link authenticated user to estate using estate_code)

### 3. Estates
- Create/Get/Update/Delete Estate
- **Get Pending Estates** (NEW - Admin only)
- **Approve Estate** (NEW - Admin only)
- **Search Estate by Code** (NEW - Find estate using estate_code)
- **Validate Estate Invitation** (NEW - Validate invitation tokens)

### 4. Access Management
- Create Access Request (with new access types and validity periods)
- Get All Access
- Get Active Access
- Approve Access
- Record Entry/Exit
- **Process Code Scan** (NEW - with entry limit validation)
- **Get Entry Statistics** (NEW - entry count and remaining entries)

### 5. Access Logs
- Create/Get Access Logs

### 6. Payments
- Initiate/Verify Payment

### 7. Roles & Permissions
- Manage Roles/Permissions

### 8. Dashboard & Analytics
- Manager/Admin Dashboards

### 9. Community Board
- Posts/Comments

### 10. Emergency
- Alerts/Contacts

### 11. Support
- Tickets Management

### 12. Notifications
- Get/Mark as Read
- **Get Notification Preferences** (NEW)
- **Update Notification Preferences** (NEW)

### 13. FAQs
- Get/Create FAQs

### 14. Upload
- File Upload

### 15. Legal
- Terms/Privacy

### 16. Monitoring
- Health/Metrics

## Usage
1. Run Login request
2. Token auto-saved
3. All authenticated requests use token automatically
4. **For unlimited entry access**: Use `domestic_staff`, `service`, or `maintenance` access types with validity periods
5. **Monitor entries**: Use "Get Entry Statistics" to check usage
6. **Process scans**: Use "Process Code Scan" for entry/exit with automatic limit validation
