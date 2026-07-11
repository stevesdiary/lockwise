import '../observability/tracing';

import express from 'express';
import cors from 'cors';
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
import { startSafetyNotificationJob } from '../jobs/safety-notification.job';
import { startCollectionsCronJobs } from '../jobs/collections.job';
import { resolveShortUrl } from '../utils/url-shortener.util';
import { httpMetricsMiddleware, getMetrics } from '../observability/index';

const server = express();
const httpServer = createServer(server);
const webSocketService = new WebSocketService(httpServer);

// Initialize WebSocket service in notification service
realTimeNotificationService.setWebSocketService(webSocketService);

const port = process.env.LOCAL_PORT || 3002;

// Trust the first hop proxy (Render, Heroku, nginx) so req.ip reflects the real client IP
server.set('trust proxy', 1);

// Enhanced security headers
import { securityHeaders, detectSuspiciousActivity, validateRequestSize } from '../middleware/security.middleware';
server.use(securityHeaders);
server.use(detectSuspiciousActivity);
server.use(validateRequestSize);

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
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400 // 24 hours - cache preflight requests
}));

// Body parsing with size limits; capture raw body for webhook signature verification
server.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  },
}));
server.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
server.use(compression());

server.use(monitoringService.middleware());
server.use(httpMetricsMiddleware);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, try again after 10 minutes',
  // Paystack webhook is exempt — Paystack retries on non-200 and could exhaust the limit
  // In development, skip rate limiting entirely so load tests against localhost aren't throttled
  skip: (req) => req.path.includes('/webhooks/paystack') || req.path.includes('/kuda/webhook') || process.env.NODE_ENV === 'development',
});

// Strict limiter for auth endpoints — brute-force protection for login/registration/OTP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, try again after 15 minutes',
  skip: () => process.env.NODE_ENV === 'development',
});

// Prometheus scrape endpoint — gated by METRICS_SECRET bearer token
server.get('/metrics', async (req, res) => {
  const auth = (req.headers['authorization'] as string) ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!process.env.METRICS_SECRET || token !== process.env.METRICS_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const { registry } = getMetrics();
  res.set('Content-Type', registry.contentType);
  res.send(await registry.metrics());
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

// Public URL redirect — exempt from rate limiting (simple Redis lookup + 302)
server.get('/s/:slug', async (req, res) => {
  try {
    const original = await resolveShortUrl(req.params.slug);
    if (!original) return res.status(404).json({ message: 'Link not found or expired' });
    return res.redirect(302, original);
  } catch {
    return res.status(500).json({ message: 'Redirect failed' });
  }
});

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
    startSafetyNotificationJob();
    startCollectionsCronJobs();

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

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

export default startServer;
export { webSocketService, server, httpServer };
