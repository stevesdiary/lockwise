import { Response } from 'express';
import { adminDashboardService } from '../services/admin-dashboard.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const adminDashboardController = {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const [stats, recentActivity] = await Promise.all([
        adminDashboardService.getDashboardStats(),
        adminDashboardService.getRecentActivity()
      ]);

      res.json({
        stats,
        recent_activity: recentActivity
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  },

  async getEstates(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await adminDashboardService.getEstateList(Number(page), Number(limit));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch estates' });
    }
  },

  async getResidentStats(req: AuthRequest, res: Response) {
    try {
      const stats = await adminDashboardService.getResidentStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch resident statistics' });
    }
  },

  async getAccessCodeStats(req: AuthRequest, res: Response) {
    try {
      const stats = await adminDashboardService.getAccessCodeStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch access code statistics' });
    }
  },

  async getReferrerStats(req: AuthRequest, res: Response) {
    try {
      const stats = await adminDashboardService.getReferrerStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch referrer statistics' });
    }
  }
};