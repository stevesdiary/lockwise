import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

export const analyticsController = {
  async getRevenue(req: Request, res: Response) {
    try {
      const period = req.query.period as 'week' | 'month' | 'year' || 'month';
      const analytics = await analyticsService.getRevenueAnalytics(period);
      
      res.json({
        status: 'success',
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch revenue analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getSystemStats(req: Request, res: Response) {
    try {
      const stats = await analyticsService.getSystemStats();
      
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch system statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};