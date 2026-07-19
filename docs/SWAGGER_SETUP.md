# Swagger API Documentation Setup

## Overview
Swagger API documentation has been implemented for the Lockwise Access Management System.

## Access Documentation
Once the server is running, access the API documentation at:
- **Swagger UI**: `http://localhost:3000/api-docs`

## Features Implemented
- Complete API documentation with request/response schemas
- Interactive API testing interface
- Authentication support with Bearer tokens
- Comprehensive error response documentation
- Payment API documentation with all endpoints
- Authentication endpoints documentation

## API Endpoints Documented

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Payments
- `POST /api/v1/payment/initiate` - Initiate payment
- `GET /api/v1/payment/verify/{reference}` - Verify payment
- `GET /api/v1/payment/all` - Get all payments (with pagination)
- `GET /api/v1/payment/id/{paymentId}` - Get payment by ID
- `GET /api/v1/payment/ref/{reference}` - Get payment by reference

## Usage
1. Start the server: `npm start`
2. Navigate to `http://localhost:3000/api-docs`
3. Use the "Authorize" button to add your Bearer token for protected endpoints
4. Test API endpoints directly from the documentation interface

## Configuration
The Swagger configuration is located in `src/config/swagger.ts` and includes:
- API metadata and contact information
- Security schemes (Bearer JWT)
- Common response schemas
- Server configuration

## Adding Documentation to New Routes
To document new API endpoints, add JSDoc comments with `@swagger` annotations above your route handlers:

```typescript
/**
 * @swagger
 * /api/v1/your-endpoint:
 *   post:
 *     summary: Description of your endpoint
 *     tags: [YourTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/YourSchema'
 *     responses:
 *       200:
 *         description: Success response
 */
```