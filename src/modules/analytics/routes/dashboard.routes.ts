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

dashboardRouter.get('/manager/:estate_id/residents/pending',
  authenticateToken,
  authorizeRoles(['manager', 'admin']),
  managerDashboardController.getPendingEstateResidents
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

// Access management
dashboardRouter.get('/manager/:estate_id/access/pending', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.getPendingAccessRequests
);

dashboardRouter.post('/manager/access/:access_id/approve', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.approveAccessRequest
);

dashboardRouter.post('/manager/access/:access_id/revoke', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.revokeAccessRequest
);

// User role management
dashboardRouter.put('/manager/users/:user_id/role', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.updateUserRole
);

// Resident management
dashboardRouter.post('/manager/residents/:user_id/approve', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.approveResident
);

dashboardRouter.post('/manager/residents/:user_id/inactive', 
  authenticateToken, 
  authorizeRoles(['manager', 'admin']), 
  managerDashboardController.setResidentInactive
);

dashboardRouter.post('/manager/residents/:user_id/reject',
  authenticateToken,
  authorizeRoles(['manager', 'admin']),
  managerDashboardController.rejectResident
);

// Security personnel management (legacy — security only)
dashboardRouter.get('/manager/:estate_id/security',
  authenticateToken,
  authorizeRoles(['manager', 'admin']),
  managerDashboardController.getEstateSecurityPersonnel
);

dashboardRouter.patch('/manager/security/:user_id/status',
  authenticateToken,
  authorizeRoles(['manager', 'admin']),
  managerDashboardController.setSecurityStatus
);

dashboardRouter.delete('/manager/security/:user_id',
  authenticateToken,
  authorizeRoles(['manager', 'admin']),
  managerDashboardController.deleteSecurityUser
);

// Staff management (security + domestic_staff)
dashboardRouter.get('/manager/:estate_id/staff',
  authenticateToken,
  authorizeRoles(['manager', 'admin']),
  managerDashboardController.getEstateStaff
);

dashboardRouter.post('/manager/staff',
  authenticateToken,
  authorizeRoles(['manager', 'admin']),
  managerDashboardController.createStaffAccount
);

dashboardRouter.patch('/manager/staff/:user_id/status',
  authenticateToken,
  authorizeRoles(['manager', 'admin']),
  managerDashboardController.setStaffStatus
);

dashboardRouter.delete('/manager/staff/:user_id',
  authenticateToken,
  authorizeRoles(['manager', 'admin']),
  managerDashboardController.removeStaffMember
);

export default dashboardRouter;
