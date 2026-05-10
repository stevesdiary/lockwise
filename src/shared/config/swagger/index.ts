import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { schemas } from './schemas';
import { 
  authPaths, 
  estatePaths, 
  paymentPaths, 
  electricityPaths, 
  billsPaths, 
  walletPaths 
} from './paths';

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
        url: process.env.API_BASE_URL || 'http://localhost:3002/api/v1',
        description: 'Local development server'
      },
      {
        url: 'https://lockwise.onrender.com/api/v1',
        description: 'Production server (Render)'
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
      schemas
    },
    paths: {
      ...authPaths,
      ...estatePaths,
      ...paymentPaths,
      ...electricityPaths,
      ...billsPaths,
      ...walletPaths
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
      { name: 'Electricity', description: 'Electricity vending, smart meter management, and token delivery' },
      { name: 'Wallet', description: 'Resident wallet funding, balance, and transaction history' },
      { name: 'Bills', description: 'Airtime, data, TV subscription, and electricity bill payments via VTPass' },
      { name: 'Collections', description: 'Estate fee management, invoice generation, resident payment tracking, and withdrawals' },
      { name: 'Kuda', description: 'Kuda-powered estate virtual wallet — virtual sub-accounts, balances, and transactions' },
      { name: 'Emergency', description: 'Emergency alerts, estate contacts, and location-based emergency contact directory' },
      { name: 'Legal', description: 'Legal documents and policies' },
      { name: 'Webhooks', description: 'Webhook endpoints' }
    ],
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/modules/**/routes/*.ts', './src/modules/**/controllers/*.ts', './src/docs/*.ts']
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
