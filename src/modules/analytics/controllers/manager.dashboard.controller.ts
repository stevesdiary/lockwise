import { Request, Response } from 'express';
import { managerDashboardService } from '../services/manager.dashboard.service';
import { asString } from '../../../shared/utils/param.util';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';

const managerDashboardController = {
  getEstateOverview: async (req: Request, res: Response) => {
    try {
      const estate_id = asString(req.params.estate_id);
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
      const requests = await managerDashboardService.getPendingAccessRequests(estate_id);
      res.json({ status: 'success', data: requests });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  approveAccessRequest: async (req: Request, res: Response) => {
    try {
      const access_id = asString(req.params.access_id);
      await managerDashboardService.approveAccessRequest(access_id, req.user?.id);
      res.json({ status: 'success', message: 'Access approved' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  revokeAccessRequest: async (req: Request, res: Response) => {
    try {
      const access_id = asString(req.params.access_id);
      await managerDashboardService.revokeAccessRequest(access_id, req.user?.id);
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
  }
};

export default managerDashboardController;
