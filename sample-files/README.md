# Lockwise Onboarding Guide

## Quick Start Files

This directory contains sample files to help you get started with Lockwise quickly.

### 📁 Sample Files Included

1. **estate-addresses-sample.csv** - Sample estate data for bulk upload
2. **users-bulk-upload-sample.csv** - Sample user data for bulk registration
3. **access-codes-bulk-sample.csv** - Sample access codes for bulk generation
4. **api-configuration-sample.json** - API endpoints and sample requests
5. **.env.sample** - Environment configuration template

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