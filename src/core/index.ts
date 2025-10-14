import express from 'express';
import rateLimit from 'express-rate-limit';

import sequelize from './database.optimized';
import router from '../router';
import monitoringService from '../middlewares/monitoring';
const server = express();

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

server.use(limiter);
server.use('/api/v1', router);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default startServer;
