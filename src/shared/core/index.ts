import express from 'express';
import cors from 'cors';
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

const port = process.env.LOCAL_PORT || 3000;

// CORS configuration
server.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

server.use(express.json());
server.use(monitoringService.middleware());

const limiter = rateLimit ({
  windowMs: 10 * 60 * 1000,
  max: 1000, // Increased from 100
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many request from this IP, try again after 10 minutes'
})

server.get("/home", (req, res) => {
  res.json({ message: "Hello, World of intelligent property management system." });
});

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
server.use(limiter);
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

export default startServer;
export { webSocketService, server, httpServer };
