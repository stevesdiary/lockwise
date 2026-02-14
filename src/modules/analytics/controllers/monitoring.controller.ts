import { Request, Response } from 'express';
import monitoringService from '../../../shared/middleware/monitoring';

export const monitoringController = {
  getMetrics(req: Request, res: Response) {
    const metrics = monitoringService.getMetrics();
    res.status(200).json({
      status: 'success',
      data: metrics
    });
  },

  getHealth(req: Request, res: Response) {
    const metrics = monitoringService.getMetrics();
    const isHealthy = metrics.successRate > 95 && metrics.avgResponseTime < 1000;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      metrics: {
        avgResponseTime: metrics.avgResponseTime,
        successRate: metrics.successRate,
        totalRequests: metrics.totalRequests,
        slowRequests: metrics.slowRequests
      }
    });
  },

  resetMetrics(req: Request, res: Response) {
    monitoringService.resetMetrics();
    res.status(200).json({
      status: 'success',
      message: 'Metrics reset successfully'
    });
  }
};