import { Request, Response } from 'express';
import { adminDashboardService } from './admin.dashboard.service';

const adminDashboardController = {
  getOverview: async (req: Request, res: Response) => {
    try {
      const overview = await adminDashboardService.getOverview();
      res.json({
        status: 'success',
        data: overview
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch overview',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getAllPayments: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 50, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const payments = await adminDashboardService.getAllPayments({
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

  getAllUsers: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const users = await adminDashboardService.getAllUsers({
        limit: Number(limit),
        offset
      });

      res.json({
        status: 'success',
        data: users
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getAccessLogs: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 100, estate_id } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const logs = await adminDashboardService.getAccessLogs({
        limit: Number(limit),
        offset,
        estate_id: estate_id as string
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

  getAnalytics: async (req: Request, res: Response) => {
    try {
      const { period = 'month' } = req.query;
      const analytics = await adminDashboardService.getAnalytics(period as 'week' | 'month' | 'year');
      
      res.json({
        status: 'success',
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export default adminDashboardController;