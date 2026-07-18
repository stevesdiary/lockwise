# Lockwise Developer Guide

## Project Overview
Lockwise is an Access Management System for residential estates, providing secure entry/exit control with themed access codes, location mapping, and multi-tenant support.

## Architecture

### Core Technologies
- **Backend**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis for session management and code generation
- **Authentication**: JWT tokens
- **File Storage**: AWS S3
- **Maps**: Google Maps API

### Project Structure
```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Database models
├── repositories/    # Data access layer
├── routes/          # API endpoints
├── middlewares/     # Authentication, validation
├── types/           # TypeScript interfaces
├── utils/           # Helper functions
└── core/            # Database, Redis connections
```

## Key Features

### 1. Access Code Generation
**Location**: `src/services/access.code.service.ts`

**Themed Codes**: Weekly rotating categories (Animals, Countries, Colors, etc.)
- Format: `Dog47`, `Ghana23`, `Red89`
- Redis storage: 7-day expiration
- Fallback: Random 4-digit numbers

**Custom Event Codes**: User-defined for events
- Format: `ClarasBirthdayParty76`
- Multiple entry support

**API Endpoints**:
```
POST /api/access-codes/generate        # Get themed code
POST /api/access-codes/custom          # Create event code
POST /api/access-codes/refresh-category # Force new category
```

### 2. Multi-Entry Access System
**Location**: `src/models/access.model.ts`

**Features**:
- `is_multi_entry`: Enable multiple uses
- `max_entries`: Set usage limit
- `AccessEntry`: Track each individual entry/exit
- Real-time remaining entries calculation

**Usage**:
```typescript
// Single entry (default)
{ is_multi_entry: false, max_entries: 1 }

// Multiple entry for events
{ is_multi_entry: true, max_entries: 20 }
```

### 3. Location & Mapping
**Location**: `src/services/map.service.ts`, `src/services/geocoding.service.ts`

**Features**:
- Address geocoding (Google Maps API)
- Estate location mapping
- Navigation directions
- Static map generation

**API Endpoints**:
```
GET /api/addresses/map/:estateId       # Get estate map data
PUT /api/addresses/:id/location        # Update coordinates
GET /api/addresses/directions          # Get directions URL
```

### 4. Multi-Tenant Architecture
**Estates**: Primary tenant isolation
- Each estate has separate access codes
- Category rotation per estate
- Independent user management

## Database Schema

### Core Models
```typescript
// Estate (Tenant)
estate_id, name, address, city, state, country, status

// User (Residents, Managers, Security)
user_id, estate_id, role, email, phone

// Access (Entry Permissions)
id, access_code, estate_id, is_multi_entry, max_entries, date_in, date_out

// AccessEntry (Usage Tracking)
id, access_id, entry_time, exit_time, gate_id

// Address (Unit Locations)
address_id, estate_id, apartment_number, latitude, longitude
```

### Key Relationships
- Estate → Users (1:N)
- Estate → Access (1:N)
- Access → AccessEntry (1:N)
- Estate → Address (1:N)

## Environment Setup

### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis
REDIS_URL=redis://host:port

# Google Maps
GOOGLE_MAPS_API_KEY=your_api_key

# JWT
JWT_SECRET=your_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket
```

### Installation
```bash
npm install
npm run migrate
npm start
```

## API Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

User context includes:
- `req.user.id`: User ID
- `req.user.estateId`: Estate ID (tenant isolation)
- `req.user.role`: User role

## Development Guidelines

### Adding New Features
1. **Models**: Define in `src/models/`
2. **Types**: Add interfaces in `src/types/`
3. **Services**: Business logic in `src/services/`
4. **Controllers**: Request handling in `src/controllers/`
5. **Routes**: API endpoints in `src/routes/`
6. **Migration**: Database changes in `migrations/`

### Code Patterns
```typescript
// Service Pattern
class MyService {
  static async doSomething(param: string): Promise<Result> {
    // Business logic here
  }
}

// Controller Pattern
class MyController {
  async handleRequest(req: Request, res: Response) {
    try {
      const result = await MyService.doSomething(req.params.id);
      return res.json({ status: 'success', data: result });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
```

### Error Handling
Use `handleControllerError()` for consistent error responses:
```typescript
return handleControllerError(error, res);
```

### Redis Usage
Use existing Redis utilities:
```typescript
import { getFromRedis, saveToRedis } from '../core/redis';

await saveToRedis(key, value, expirationSeconds);
const data = await getFromRedis(key);
```

## Testing

### API Testing Examples
```bash
# Generate themed access code
curl -X POST http://localhost:3000/api/access-codes/generate \
  -H "Authorization: Bearer <token>"

# Create custom event code
curl -X POST http://localhost:3000/api/access-codes/custom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"eventName": "Pool Party"}'

# Get estate map
curl -X GET http://localhost:3000/api/addresses/map \
  -H "Authorization: Bearer <token>"
```

## Deployment

### Database Migrations
```bash
# Run pending migrations
npm run migrate

# Create new migration
npx sequelize-cli migration:generate --name add-new-feature
```

### Production Considerations
- Set up Redis clustering for high availability
- Configure database connection pooling
- Enable API rate limiting
- Set up monitoring and logging
- Use environment-specific configurations

## Troubleshooting

### Common Issues
1. **Redis Connection**: Check REDIS_URL and network connectivity
2. **Database Errors**: Verify DATABASE_URL and run migrations
3. **Google Maps**: Ensure API key has Geocoding API enabled
4. **JWT Errors**: Check JWT_SECRET and token expiration

### Debugging
- Enable debug logs: `DEBUG=lockwise:* npm start`
- Check Redis keys: `redis-cli keys "*"`
- Monitor database queries with Sequelize logging

## Contributing
1. Follow TypeScript strict mode
2. Use existing error handling patterns
3. Add proper type definitions
4. Write minimal, focused code
5. Update this documentation for new features