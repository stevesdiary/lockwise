import { Router } from 'express';
import adminDashboardController from './admin.dashboard.controller';
import managerDashboardController from './manager.dashboard.controller';
import { authentication } from '../../middlewares/authentication';
import { authorizeRoles } from '../../middlewares/authorizeRoles';

const dashboardRouter = Router();

// Admin routes - require admin role
dashboardRouter.get('/admin/overview', 
  authentication, 
  authorizeRoles(['admin']), 
  adminDashboardController.getOverview
);

dashboardRouter.get('/admin/payments', 
  authentication, 
  authorizeRoles(['admin']), 
  adminDashboardController.getAllPayments
);

dashboardRouter.get('/admin/users', 
  authentication, 
  authorizeRoles(['admin']), 
  adminDashboardController.getAllUsers
);

dashboardRouter.get('/admin/access-logs', 
  authentication, 
  authorizeRoles(['admin']), 
  adminDashboardController.getAccessLogs
);

dashboardRouter.get('/admin/analytics', 
  authentication, 
  authorizeRoles(['admin']), 
  adminDashboardController.getAnalytics
);

// Manager routes - require manager or admin role
dashboardRouter.get('/manager/:estate_id/overview', 
  authentication, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.getEstateOverview
);

dashboardRouter.get('/manager/:estate_id/residents', 
  authentication, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.getEstateResidents
);

dashboardRouter.get('/manager/:estate_id/access-logs', 
  authentication, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.getEstateAccessLogs
);

dashboardRouter.get('/manager/:estate_id/payments', 
  authentication, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.getEstatePayments
);

export default dashboardRouter;