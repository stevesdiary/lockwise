import { Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { asString } from '../../../shared/utils/param.util';

export const analyticsController = {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { days = 30 } = req.query;
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000).toISOString();

      const [usageStats, performanceMetrics, systemHealth] = await Promise.all([
        analyticsService.getUsageStats(startDate, endDate),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getSystemHealth()
      ]);

      res.json({
        period: { startDate, endDate, days: Number(days) },
        usage: usageStats,
        performance: performanceMetrics,
        system: systemHealth
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics dashboard' });
    }
  },

  async getUserAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = asString(req.params.userId);
      const { days = 30 } = req.query;

      const behavior = await analyticsService.getUserBehavior(userId, Number(days));

      res.json({ userId, period: Number(days), behavior });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
  },

  async trackCustomEvent(req: AuthRequest, res: Response) {
    try {
      const { event, properties } = req.body;

      await analyticsService.trackEvent(req.user!.id, event, properties);

      res.json({ message: 'Event tracked successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to track event' });
    }
  },

  async getPerformanceReport(req: AuthRequest, res: Response) {
    try {
      const metrics = await analyticsService.getPerformanceMetrics();

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch performance report' });
    }
  },

  async getSystemStatus(req: AuthRequest, res: Response) {
    try {
      const health = await analyticsService.getSystemHealth();

      res.json(health);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch system status' });
    }
  }
};