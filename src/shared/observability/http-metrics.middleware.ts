import type { Request, Response, NextFunction } from 'express';
import { getMetrics } from './metrics';

export function httpMetricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    // Use route pattern (e.g. '/api/v1/users/:id') not raw path to avoid
    // high-cardinality label explosion from UUIDs in paths.
    const route = (req.route?.path as string | undefined) ?? req.path ?? 'unknown';
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    const metrics = getMetrics();
    metrics.httpRequestDuration.observe(labels, (Date.now() - start) / 1000);
    metrics.httpRequestTotal.inc(labels);
  });

  next();
}
