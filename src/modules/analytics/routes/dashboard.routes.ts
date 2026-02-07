import { Router } from 'express';
import adminDashboardController from '../controllers/admin.dashboard.controller';
import managerDashboardController from '../controllers/manager.dashboard.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { authorizeRoles } from '../../auth/middleware/permission.middleware';

const dashboardRouter = Router();

// Admin routes - require admin role
dashboardRouter.get('/admin/overview', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  adminDashboardController.getOverview
);

dashboardRouter.get('/admin/payments', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  adminDashboardController.getAllPayments
);

dashboardRouter.get('/admin/users', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  adminDashboardController.getAllUsers
);

dashboardRouter.get('/admin/access-logs', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  adminDashboardController.getAccessLogs
);

dashboardRouter.get('/admin/analytics', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  adminDashboardController.getAnalytics
);

// Manager routes - require manager or admin role
dashboardRouter.get('/manager/:estate_id/overview', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.getEstateOverview
);

dashboardRouter.get('/manager/:estate_id/residents', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.getEstateResidents
);

dashboardRouter.get('/manager/:estate_id/access-logs', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.getEstateAccessLogs
);

dashboardRouter.get('/manager/:estate_id/payments', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.getEstatePayments
);

export default dashboardRouter;