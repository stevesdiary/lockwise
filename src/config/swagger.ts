import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lockwise API',
      version: '1.0.0',
      description: 'Lockwise Access Management System API Documentation',
      contact: {
        name: 'Stephen Oyeyemi',
        email: 'support@lockwise.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  type: { type: 'string' }
                }
              }
            }
          }
        },
        PaymentInitiation: {
          type: 'object',
          required: ['amount', 'email'],
          properties: {
            amount: { type: 'number', example: 5000 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            currency: { type: 'string', default: 'NGN', example: 'NGN' },
            paymentProvider: { type: 'string', default: 'paystack', example: 'paystack' },
            paymentMethod: { type: 'string', example: 'card' }
          }
        },
        PaymentResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            statusCode: { type: 'number', example: 200 },
            data: {
              type: 'object',
              properties: {
                reference: { type: 'string' },
                authorization_url: { type: 'string' },
                access_code: { type: 'string' }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/docs/*.ts']
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };