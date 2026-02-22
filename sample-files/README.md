# Lockwise Onboarding Guide

## Quick Start Files

This directory contains sample files to help you get started with Lockwise quickly.

### 📁 Sample Files Included

1. **estate-addresses-sample.csv** - Sample estate data for bulk upload
2. **users-bulk-upload-sample.csv** - Sample user data for bulk registration
3. **access-codes-bulk-sample.csv** - Sample access codes for bulk generation
4. **api-configuration-sample.json** - API endpoints and sample requests
5. **.env.sample** - Environment configuration template
6. **estates-bulk-sample.csv** - **NEW** Comprehensive estate bulk upload with all fields
7. **streets-bulk-sample.csv** - **NEW** Street creation for estates
8. **units-bulk-sample.csv** - **NEW** Unit/property creation with detailed specifications

### 🚀 Getting Started

#### 1. Environment Setup
```bash
# Copy the sample environment file
cp sample-files/.env.sample .env

# Edit .env with your actual credentials
nano .env
```

#### 2. Database Setup
```bash
# Run migrations
npm run migrate

# Seed with sample data (optional)
npm run seed
```

#### 3. Test API Endpoints
Use the `api-configuration-sample.json` file with Postman or your preferred API client.

### 📊 Bulk Upload Instructions

#### Estate Addresses Upload
1. Use `estate-addresses-sample.csv` as template
2. Required columns: estate_name, address, city, state, postal_code, country
3. Optional columns: manager_email, manager_phone, total_units, estate_type

#### Users Bulk Upload
1. Use `users-bulk-upload-sample.csv` as template
2. Required columns: first_name, last_name, email, phone, role
3. Optional columns: estate_name, unit_number, emergency_contact_name

#### Access Codes Bulk Generation
1. Use `access-codes-bulk-sample.csv` as template
2. Required columns: guest_name, valid_from, valid_until
3. Optional columns: guest_phone, guest_email, access_type, notes
4. **New Access Types**: `domestic_staff`, `service`, `maintenance` for unlimited entries
5. **Validity Periods**: Set `valid_from` and `valid_until` for time-based access control

#### Comprehensive Estate Bulk Upload
1. Use `estates-bulk-sample.csv` as template
2. **Required columns**: name, address, type, city, state, country
3. **Enhanced fields**: country_code, timezone, currency_code, postal_code, plus_code, digital_address, landmark
4. **Contact information**: contact_phone, contact_email, contact_address
5. **Management**: estate_code, referrer_id for tracking

#### Street Creation Bulk Upload
1. Use `streets-bulk-sample.csv` as template
2. **Required columns**: estate_id, name
3. **Relationship**: Links streets to existing estates via estate_id UUID
4. **Naming convention**: Descriptive street names for organization

#### Unit/Property Bulk Upload
1. Use `units-bulk-sample.csv` as template
2. **Required columns**: street_id, unit_identifier
3. **Location details**: block, floor, unit_type (flat, duplex, chalet, terrace, plot, house, apartment, other)
4. **Status management**: occupied, vacant, under_construction, reserved
5. **Detailed specifications**: plot_number, house_number, digital_address, landmark, coordinates (lat/lng)

### 🔧 Configuration Tips

1. **Database**: Use PostgreSQL with SSL enabled for production
2. **Redis**: Required for sessions, queues, and caching
3. **Email**: Brevo (Sendinblue) recommended for reliable delivery
4. **SMS**: Twilio for Nigerian phone number support
5. **Payments**: Dual setup with Paystack and Flutterwave
6. **Push Notifications**: Firebase for mobile app integration

### 📱 Mobile App Integration

The system supports:
- Push notifications via Firebase
- Deep linking with custom URL scheme
- Offline sync capabilities
- Real-time updates via WebSocket

### 🔐 Security Features

- JWT authentication with refresh tokens
- Role-based access control
- Rate limiting per endpoint
- API key management
- Audit logging
- Data encryption

### 📈 Analytics & Monitoring

- Usage statistics tracking
- Performance metrics
- User behavior analytics
- Real-time dashboard
- System health monitoring

### 🆘 Support

For technical support or questions:
- Check the API documentation in Postman collection
- Review the database schema in migrations folder
- Test endpoints using the sample JSON configuration

### 🔄 Next Steps

1. Configure your environment variables
2. Run database migrations
3. Test API endpoints with sample data
4. Upload bulk data using CSV templates
5. Configure mobile app integration
6. Set up monitoring and analytics

### 🏢 Estate Management
- **Register Estate**: `POST /api/v1/estate/register` with estate details
  - **Address Format**: Object with `number`, `street`, `city`, `country`
  - **Contact Address**: Separate address object for contact information
  - **State Field**: Optional, defaults to city if not provided
  - **Field Consistency**: Use `total_number_of_floors` (not `number_of_floors`)
  - **Additional Fields**: `country_code`, `timezone`, `currency_code`, `postal_code`, `plus_code`, `digital_address`, `landmark`, `coordinates`, `access_points`, `geo_fencing`
- **List All Estates**: `GET /api/v1/estate/estates`
- **Get Pending Estates**: `GET /api/v1/estate/estates/pending` (Admin only)
- **Approve Estate**: `PATCH /api/v1/estate/estates/{estateId}/approve` (Admin only)
- **Get Estate Details**: `GET /api/v1/estate/one/{estateId}`
- **Update Estate**: `PUT /api/v1/estate/update/{estateId}`

### 📞 SMS Verification
- **Send OTP**: `POST /api/v1/auth/phone/send-otp` with phone number
- **Verify OTP**: `POST /api/v1/auth/phone/verify-otp` with phone and 6-digit code
- OTP expires after 10 minutes
- International phone number format supported (+234XXXXXXXXX)

### 🆕 New API Endpoints (February 2026)

#### Estate Management
- **Search Estate by Code**: `GET /api/v1/estate/search/{estate_code}` - Find estates using their unique estate code
- **Validate Estate Invitation**: `GET /api/v1/estate/invitations/validate/{token}` - Validate estate invitation tokens
- **Approve Estate**: `PATCH /api/v1/estate/estates/{estateId}/approve` - Approve pending estates (Admin only)
- **Generate Invitation Link**: `POST /api/v1/estate/invite/{estateId}` - Generate secure invitation links for residents (Manager only)
- **Send Bulk Invitations**: `POST /api/v1/estate/residents/bulk-invite` - Send invitation emails to multiple residents (Manager only)
- **Resend Invitation**: `POST /api/v1/estate/residents/resend-invite` - Resend invitation to specific resident (Manager only)

#### User Management
- **Link User to Estate**: `POST /api/v1/user/link-estate` - Link authenticated users to estates using estate code

These endpoints enhance the estate onboarding and user management workflows in the Lockwise system.