import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';

import sequelize, { databaseTarget, runMigrations } from './database';
import router from '../../router';
import monitoringService from '../middleware/monitoring';
import { swaggerUi, specs } from '../config/swagger';
import WebSocketService from '../../modules/communication/services/websocket.service';
import { errorHandler, notFound } from '../middleware/error-handler.middleware';
import realTimeNotificationService from '../../modules/analytics/services/realtime-notification.service';
import { startAccessCodeExpiryJob } from '../jobs/access-code-expiry.job';
import { startSubscriptionExpiryJob } from '../jobs/subscription-expiry.job';

const server = express();
const httpServer = createServer(server);
const webSocketService = new WebSocketService(httpServer);

// Initialize WebSocket service in notification service
realTimeNotificationService.setWebSocketService(webSocketService);

const port = process.env.LOCAL_PORT || 3002;

// Trust the first hop proxy (Render, Heroku, nginx) so req.ip reflects the real client IP
server.set('trust proxy', 1);

// Security headers
server.use(helmet());

// CORS — whitelist specific origins from env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

server.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Body parsing with size limits
server.use(express.json({ limit: '10mb' }));
server.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
server.use(compression());

server.use(monitoringService.middleware());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, try again after 10 minutes',
  // Paystack webhook is exempt — Paystack retries on non-200 and could exhaust the limit
  skip: (req) => req.path.includes('/webhooks/paystack'),
});

// Strict limiter for auth endpoints — brute-force protection for login/registration/OTP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, try again after 15 minutes'
});

// Health check — exempt from rate limiting, used by load balancers
server.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

server.get('/', (_req, res) => {
  res.json({ name: 'Lockwise API', status: 'ok' });
});

server.get("/home", (req, res) => {
  res.json({ message: "Hello, World of intelligent property management system." });
});

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
server.use(limiter);
// Stricter rate limit on auth routes — brute-force protection for login, registration, OTP
server.use('/api/v1/auth', authLimiter);
server.use('/api/v1/log', authLimiter);
server.use('/api/v1', router);

// Error handling middleware
server.use(notFound);
server.use(errorHandler);

const startServer = async () => {
  try {
    // 1 Connect to database
    console.log(`Connecting to database ${databaseTarget}`);
    await sequelize.authenticate();
    console.log('Database connected.');

    // 2 Run pending migrations programmatically
    await runMigrations();

    // 3 Start HTTP + WebSocket server
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`WebSocket server initialized`);
    });

    // 4 Start cron jobs
    startAccessCodeExpiryJob();
    startSubscriptionExpiryJob();

  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

export const shutdown = (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  httpServer.close((err) => {
    if (err) {
      console.error('Error during server close:', err);
      process.exit(1);
    }
    console.log('HTTP server closed. Exiting.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10_000);
};

export default startServer;
export { webSocketService, server, httpServer };
