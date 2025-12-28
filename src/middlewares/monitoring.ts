import { Request, Response, NextFunction } from 'express';

interface Metrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalResponseTime: number;
  slowRequests: number;
  endpoints: Map<string, { count: number; avgTime: number }>;
}

class MonitoringService {
  private metrics: Metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    slowRequests: 0,
    endpoints: new Map()
  };

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.recordMetric(req, res, duration);
      });

      next();
    };
  }

  private recordMetric(req: Request, res: Response, duration: number) {
    this.metrics.totalRequests++;
    this.metrics.totalResponseTime += duration;

    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    if (duration > 1000) {
      this.metrics.slowRequests++;
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }

    const endpoint = `${req.method} ${req.path}`;
    const endpointStats = this.metrics.endpoints.get(endpoint) || { count: 0, avgTime: 0 };
    endpointStats.count++;
    endpointStats.avgTime = ((endpointStats.avgTime * (endpointStats.count - 1)) + duration) / endpointStats.count;
    this.metrics.endpoints.set(endpoint, endpointStats);
  }

  getMetrics() {
    return {
      ...this.metrics,
      avgResponseTime: this.metrics.totalRequests > 0 
        ? this.metrics.totalResponseTime / this.metrics.totalRequests 
        : 0,
      successRate: this.metrics.totalRequests > 0
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
        : 0,
      endpoints: Array.from(this.metrics.endpoints.entries()).map(([path, stats]) => ({
        path,
        ...stats
      }))
    };
  }

  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      endpoints: new Map()
    };
  }
}

export default new MonitoringService();