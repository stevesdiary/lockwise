import express from 'express';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';

import sequelize from './database.optimized';
import router from '../router';
import monitoringService from '../middlewares/monitoring';
import { swaggerUi, specs } from '../config/swagger';
import WebSocketService from '../services/websocket.service';
import { errorHandler, notFound } from '../middlewares/error-handler.middleware';

const server = express();
const httpServer = createServer(server);
const webSocketService = new WebSocketService(httpServer);

const port = process.env.LOCAL_PORT || 3000;

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
    await sequelize.authenticate();
    console.log('Database connected.');

    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`WebSocket server initialized`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default startServer;
export { webSocketService };
