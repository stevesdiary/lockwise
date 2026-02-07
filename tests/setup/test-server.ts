import express, { Application } from 'express';
import router from '../../src/router';

/**
 * Creates a test Express server instance with all routes configured
 * @returns Express Application
 */
export const createTestServer = (): Application => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/v1', router);

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Test server error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'test' && { stack: err.stack })
    });
  });

  return app;
};
