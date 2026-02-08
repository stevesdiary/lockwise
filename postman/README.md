# Lockwise API Postman Collection

## Import
Import `Lockwise-API-Complete.postman_collection.json` into Postman

## Variables
- `baseUrl`: http://localhost:3000/api/v1
- `accessToken`: Auto-set after login
- `estateId`: Set manually or from response
- `userId`: Set manually or from response

## Collections (15 modules, 50+ endpoints)

### 1. Authentication
- Login (auto-saves token)
- Refresh Token
- Logout
- Google OAuth

### 2. Users
- Register (Manager/Resident/Security)
- Get All Users
- Get/Update/Delete User

### 3. Estates
- Create/Get/Update/Delete Estate

### 4. Access Codes
- Generate/Custom/Refresh

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
