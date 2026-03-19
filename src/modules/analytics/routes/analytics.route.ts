import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticateToken, requireAdmin, requireManager } from '../../../shared/middleware/auth.middleware';
import { rateLimiters } from '../../../shared/middleware/rate-limit.middleware';
import { auditLogger } from '../../../shared/middleware/audit.middleware';

const analyticsRouter = Router();

// Dashboard and reporting
analyticsRouter.get('/dashboard',
  rateLimiters.api,
  authenticateToken,
  requireManager,
  analyticsController.getDashboard
);

analyticsRouter.get('/user/:userId',
  rateLimiters.api,
  authenticateToken,
  requireManager,
  analyticsController.getUserAnalytics
);

analyticsRouter.get('/performance',
  rateLimiters.api,
  authenticateToken,
  requireAdmin,
  analyticsController.getPerformanceReport
);

analyticsRouter.get('/system',
  rateLimiters.api,
  authenticateToken,
  requireAdmin,
  analyticsController.getSystemStatus
);

// Event tracking (CSRF-protected via JWT authentication)
analyticsRouter.post('/track',
  rateLimiters.api,
  authenticateToken,
  auditLogger,
  analyticsController.trackCustomEvent
);

// Legacy routes
analyticsRouter.get('/revenue', 
  rateLimiters.api,
  authenticateToken, 
  requireManager,
  analyticsController.getDashboard
);

analyticsRouter.get('/stats', 
  rateLimiters.api,
  authenticateToken, 
  requireAdmin,
  analyticsController.getSystemStatus
);

export default analyticsRouter;