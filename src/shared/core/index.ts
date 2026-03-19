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
import realTimeNotificationService from '../../modules/communication/services/realtime-notification.service';
import { startAccessCodeExpiryJob } from '../jobs/access-code-expiry.job';
import { startSubscriptionExpiryJob } from '../jobs/subscription-expiry.job';

const server = express();
const httpServer = createServer(server);
const webSocketService = new WebSocketService(httpServer);

// Keep reference — no setWebSocketService on the simplified service
void realTimeNotificationService;

const port = process.env.LOCAL_PORT || 3000;

// CORS: whitelist from ALLOWED_ORIGINS env var
// Requests with no Origin header (server-to-server) are always allowed
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

server.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

server.use(helmet());
server.use(compression());
server.use(express.json({ limit: '10mb' }));
server.use(express.urlencoded({ extended: true, limit: '10mb' }));
server.use(monitoringService.middleware());

// /health is exempt from rate limiting — register before the limiter
server.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, try again after 10 minutes',
});

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
server.use(limiter);
server.use('/api/v1', router);

server.use(notFound);
server.use(errorHandler);

const startServer = async () => {
  try {
    console.log(`Connecting to database ${databaseTarget}`);
    await sequelize.authenticate();
    console.log('Database connected.');
    await runMigrations();
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`WebSocket server initialized`);
    });
    startAccessCodeExpiryJob();
    startSubscriptionExpiryJob();
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

export default startServer;
export { webSocketService, server, httpServer };
