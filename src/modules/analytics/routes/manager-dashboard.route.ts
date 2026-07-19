import { Router } from 'express';
import managerDashboardController from '../controllers/manager.dashboard.controller';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';
import { authorizeRoles } from '../../../shared/middleware/permission.middleware';

const router = Router();

router.get('/:estate_id/overview', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.getEstateOverview);
router.get('/:estate_id/residents', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.getEstateResidents);
router.get('/:estate_id/residents/pending', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.getPendingEstateResidents);
router.get('/:estate_id/access-logs', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.getEstateAccessLogs);
router.get('/:estate_id/payments', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.getEstatePayments);
router.get('/:estate_id/access/pending', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.getPendingAccessRequests);
router.post('/access/:access_id/approve', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.approveAccessRequest);
router.post('/access/:access_id/revoke', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.revokeAccessRequest);
router.put('/users/:user_id/role', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.updateUserRole);
router.post('/residents/:user_id/approve', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.approveResident);
router.post('/residents/:user_id/inactive', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.setResidentInactive);
router.post('/residents/:user_id/reject', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.rejectResident);
router.get('/:estate_id/security', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.getEstateSecurityPersonnel);
router.patch('/security/:user_id/status', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.setSecurityStatus);
router.delete('/security/:user_id', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.deleteSecurityUser);
router.get('/:estate_id/staff', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.getEstateStaff);
router.post('/staff', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.createStaffAccount);
router.patch('/staff/:user_id/status', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.setStaffStatus);
router.delete('/staff/:user_id', authenticateToken, authorizeRoles(['manager', 'admin']), managerDashboardController.removeStaffMember);

export default router;
