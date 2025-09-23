import { Request, Response } from 'express';
import { managerDashboardService } from './manager.dashboard.service';

const managerDashboardController = {
  getEstateOverview: async (req: Request, res: Response) => {
    try {
      const { estate_id } = req.params;
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
      const { estate_id } = req.params;
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

  getEstateAccessLogs: async (req: Request, res: Response) => {
    try {
      const { estate_id } = req.params;
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
      const { estate_id } = req.params;
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
  }
};

export default managerDashboardController;