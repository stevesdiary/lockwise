import { Request, Response } from 'express';
import { managerDashboardService } from '../services/manager.dashboard.service';
import { asString } from '../../../shared/utils/param.util';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';

/** Returns false (and sends 403) if a manager tries to access a different estate. */
function assertEstateAccess(req: Request, res: Response, estateId: string): boolean {
  const caller = (req as any).user;
  const role = (caller?.role as string)?.toLowerCase() || '';
  const isAdmin = ['master', 'super_admin', 'admin'].includes(role);
  if (!isAdmin && caller?.estate_id !== estateId) {
    res.status(403).json({ status: 'error', message: 'Access denied: estate mismatch' });
    return false;
  }
  return true;
}

const managerDashboardController = {
  getEstateOverview: async (req: Request, res: Response) => {
    try {
      const estate_id = asString(req.params.estate_id);
      if (!assertEstateAccess(req, res, estate_id)) return;
      const overview = await managerDashboardService.getEstateOverview(estate_id);
      
      res.json({
        status: 'success',
        data: overview
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch estate overview',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getEstateResidents: async (req: Request, res: Response) => {
    try {
      const estate_id = asString(req.params.estate_id);
      if (!assertEstateAccess(req, res, estate_id)) return;
      const { page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const residents = await managerDashboardService.getEstateResidents(estate_id, {
        limit: Number(limit),
        offset
      });

      res.json({
        status: 'success',
        data: residents
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch residents',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getPendingEstateResidents: async (req: Request, res: Response) => {
    try {
      const estate_id = asString(req.params.estate_id);
      if (!assertEstateAccess(req, res, estate_id)) return;
      const { page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const residents = await managerDashboardService.getPendingEstateResidents(estate_id, {
        limit: Number(limit),
        offset
      });

      res.json({
        status: 'success',
        data: residents
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch pending residents',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getEstateAccessLogs: async (req: Request, res: Response) => {
    try {
      const estate_id = asString(req.params.estate_id);
      if (!assertEstateAccess(req, res, estate_id)) return;
      const { page = 1, limit = 100 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const logs = await managerDashboardService.getEstateAccessLogs(estate_id, {
        limit: Number(limit),
        offset
      });

      res.json({
        status: 'success',
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch access logs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getEstatePayments: async (req: Request, res: Response) => {
    try {
      const estate_id = asString(req.params.estate_id);
      if (!assertEstateAccess(req, res, estate_id)) return;
      const { page = 1, limit = 50, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const payments = await managerDashboardService.getEstatePayments(estate_id, {
        limit: Number(limit),
        offset,
        status: status as string
      });

      res.json({
        status: 'success',
        data: payments
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch payments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getPendingAccessRequests: async (req: Request, res: Response) => {
    try {
      const estate_id = asString(req.params.estate_id);
      if (!assertEstateAccess(req, res, estate_id)) return;
      const requests = await managerDashboardService.getPendingAccessRequests(estate_id);
      res.json({ status: 'success', data: requests });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  approveAccessRequest: async (req: Request, res: Response) => {
    try {
      const access_id = asString(req.params.access_id);
      await managerDashboardService.approveAccessRequest(access_id, req.user!.id);
      res.json({ status: 'success', message: 'Access approved' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  revokeAccessRequest: async (req: Request, res: Response) => {
    try {
      const access_id = asString(req.params.access_id);
      await managerDashboardService.revokeAccessRequest(access_id, req.user!.id);
      res.json({ status: 'success', message: 'Access revoked' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  updateUserRole: async (req: Request, res: Response) => {
    try {
      const user_id = asString(req.params.user_id);
      const { role_id, user_type } = req.body;
      await managerDashboardService.updateUserRole(user_id, role_id, user_type);
      res.json({ status: 'success', message: 'Role updated' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  approveResident: async (req: Request, res: Response) => {
    try {
      const user_id = asString(req.params.user_id);
      await managerDashboardService.updateResidentStatus(user_id, 'active');
      res.json({ status: 'success', message: 'Resident approved' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  setResidentInactive: async (req: Request, res: Response) => {
    try {
      const user_id = asString(req.params.user_id);
      await managerDashboardService.updateResidentStatus(user_id, 'inactive');
      res.json({ status: 'success', message: 'Resident set to inactive' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  rejectResident: async (req: Request, res: Response) => {
    try {
      const user_id = asString(req.params.user_id);
      await managerDashboardService.rejectResidentJoinRequest(user_id);
      res.json({ status: 'success', message: 'Resident request rejected' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  getEstateSecurityPersonnel: async (req: Request, res: Response) => {
    try {
      const estate_id = asString(req.params.estate_id);
      if (!assertEstateAccess(req, res, estate_id)) return;
      const personnel = await managerDashboardService.getEstateSecurityPersonnel(estate_id);
      res.json({ status: 'success', data: personnel });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  setSecurityStatus: async (req: Request, res: Response) => {
    try {
      const user_id = asString(req.params.user_id);
      const { status } = req.body as { status?: string };
      if (status !== 'active' && status !== 'inactive') {
        return res.status(400).json({ status: 'error', message: 'status must be active or inactive' });
      }
      await managerDashboardService.setSecurityStatus(user_id, status);
      res.json({ status: 'success', message: `Security personnel set to ${status}` });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  deleteSecurityUser: async (req: Request, res: Response) => {
    try {
      const user_id = asString(req.params.user_id);
      const caller = (req as any).user;
      const estate_id: string = caller?.estate_id || '';
      if (!estate_id) {
        return res.status(403).json({ status: 'error', message: 'Manager is not linked to an estate' });
      }
      const deleted = await managerDashboardService.deleteSecurityUser(user_id, estate_id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Security user not found or not linked to this estate' });
      }
      res.json({ status: 'success', message: 'Security profile removed' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },
};

export default managerDashboardController;
