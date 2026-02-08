import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lockwise API',
      version: '1.0.0',
      description: 'Lockwise Access Management System API Documentation - Complete API for property access management, visitor control, payments, community features, and estate operations.',
      contact: {
        name: 'Stephen O.',
        email: 'support@lockwise.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.lockwise.com/api/v1',
        description: 'Production server'
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
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    estate_id: { type: 'string' }
                  }
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
        },
        Estate: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Sunset Gardens' },
            address: { type: 'string', example: '123 Main St, Lagos' },
            city: { type: 'string', example: 'Lagos' },
            state: { type: 'string', example: 'Lagos' },
            country: { type: 'string', example: 'Nigeria' },
            total_number_of_apartments: { type: 'number', example: 200 },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active' }
          }
        },
        AccessRecord: {
          type: 'object',
          required: ['access_code', 'date_in', 'access_type'],
          properties: {
            access_code: { type: 'string', example: 'Dog47' },
            date_in: { type: 'string', format: 'date', example: '2024-01-15' },
            date_out: { type: 'string', format: 'date', example: '2024-01-15' },
            access_type: { type: 'string', enum: ['guest', 'resident', 'service'], example: 'guest' },
            is_multi_entry: { type: 'boolean', example: true },
            max_entries: { type: 'number', example: 5 },
            resident_id: { type: 'string' },
            remarks: { type: 'string', example: 'Birthday party guest' }
          }
        },
        SupportTicket: {
          type: 'object',
          required: ['subject', 'description', 'priority'],
          properties: {
            subject: { type: 'string', example: 'Access code not working' },
            description: { type: 'string', example: 'I cannot use my access code to enter the estate' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'medium' },
            category: { type: 'string', enum: ['access', 'payment', 'technical', 'general'], example: 'access' }
          }
        },
        Amenity: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string', example: 'Swimming Pool' },
            type: { type: 'string', enum: ['pool', 'gym', 'hall', 'court', 'other'], example: 'pool' },
            description: { type: 'string', example: 'Olympic size swimming pool' },
            capacity: { type: 'number', example: 50 },
            operating_hours: { type: 'string', example: '6:00 AM - 10:00 PM' },
            booking_required: { type: 'boolean', example: true },
            fee_per_hour: { type: 'number', example: 1000 }
          }
        },
        CommunityPost: {
          type: 'object',
          required: ['title', 'content', 'type'],
          properties: {
            title: { type: 'string', example: 'Community Meeting' },
            content: { type: 'string', example: 'Monthly community meeting scheduled for next week' },
            type: { type: 'string', enum: ['announcement', 'discussion', 'event'], example: 'announcement' },
            is_pinned: { type: 'boolean', example: false }
          }
        },
        FAQ: {
          type: 'object',
          required: ['question', 'answer', 'category'],
          properties: {
            question: { type: 'string', example: 'How do I reset my password?' },
            answer: { type: 'string', example: 'Click on Forgot Password on the login page' },
            category: { type: 'string', enum: ['general', 'access_codes', 'payments', 'security', 'technical'], example: 'general' },
            order_index: { type: 'number', example: 1 }
          }
        },
        Plan: {
          type: 'object',
          required: ['name', 'price', 'duration'],
          properties: {
            name: { type: 'string', example: 'Basic Plan' },
            description: { type: 'string', example: 'Basic features for small estates' },
            price: { type: 'number', example: 10000 },
            currency: { type: 'string', example: 'NGN' },
            duration: { type: 'string', enum: ['monthly', 'yearly'], example: 'monthly' },
            features: { type: 'array', items: { type: 'string' }, example: ['Access Control', 'Basic Analytics'] }
          }
        },
        Referral: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '+2348012345678' },
            referral_code: { type: 'string', example: 'REF123' },
            commission_rate: { type: 'number', example: 10 }
          }
        },
        Address: {
          type: 'object',
          required: ['apartment_number', 'estate_id'],
          properties: {
            apartment_number: { type: 'string', example: 'A101' },
            block: { type: 'string', example: 'Block A' },
            street: { type: 'string', example: 'Main Street' },
            estate_id: { type: 'string' },
            latitude: { type: 'number', example: 6.5244 },
            longitude: { type: 'number', example: 3.3792 }
          }
        },
        Notification: {
          type: 'object',
          required: ['title', 'message', 'type'],
          properties: {
            title: { type: 'string', example: 'Access Granted' },
            message: { type: 'string', example: 'Your visitor has been granted access' },
            type: { type: 'string', enum: ['info', 'warning', 'success', 'error'], example: 'success' },
            recipient_type: { type: 'string', enum: ['user', 'estate', 'all'], example: 'user' }
          }
        },
        ParkingSlot: {
          type: 'object',
          required: ['slot_number', 'type'],
          properties: {
            slot_number: { type: 'string', example: 'P001' },
            type: { type: 'string', enum: ['resident', 'guest', 'ev_charging'], example: 'resident' },
            is_occupied: { type: 'boolean', example: false },
            hourly_rate: { type: 'number', example: 200 }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Estates', description: 'Estate management operations' },
      { name: 'Access Control', description: 'Access management and visitor control' },
      { name: 'Payments', description: 'Payment processing and management' },
      { name: 'Plans', description: 'Subscription plan management' },
      { name: 'Referrals', description: 'Referral system management' },
      { name: 'Amenities', description: 'Estate amenities and reservations' },
      { name: 'Community', description: 'Community board and social features' },
      { name: 'Support', description: 'Customer support and ticketing' },
      { name: 'Analytics', description: 'Analytics and reporting' },
      { name: 'Notifications', description: 'Notification management' },
      { name: 'Location', description: 'Address and location management' },
      { name: 'Mobile', description: 'Mobile device management' },
      { name: 'Admin', description: 'Administrative operations' },
      { name: 'Upload', description: 'File upload and bulk operations' },
      { name: 'Parking', description: 'Parking and EV charging management' },
      { name: 'Legal', description: 'Legal documents and policies' },
      { name: 'Webhooks', description: 'Webhook endpoints' }
    ],
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/modules/**/routes/*.ts', './src/modules/**/controllers/*.ts', './src/docs/*.ts']
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };