import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

export interface MetricsBundle {
  registry: Registry;
  httpRequestDuration: Histogram<string>;
  httpRequestTotal: Counter<string>;
  dbQueryDuration: Histogram<string>;
  dbQueryErrors: Counter<string>;
  activeConnections: Gauge<string>;
}

let instance: MetricsBundle | null = null;

export function getMetrics(serviceName?: string): MetricsBundle {
  if (instance) return instance;

  const name = serviceName ?? process.env.SERVICE_NAME ?? 'lockwise-api';
  const registry = new Registry();
  registry.setDefaultLabels({ service: name });
  collectDefaultMetrics({ register: registry });

  instance = {
    registry,
    httpRequestDuration: new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [registry],
    }),
    httpRequestTotal: new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [registry],
    }),
    dbQueryDuration: new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation', 'table', 'success'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 3, 10],
      registers: [registry],
    }),
    dbQueryErrors: new Counter({
      name: 'db_query_errors_total',
      help: 'Total database query errors',
      labelNames: ['operation', 'table', 'error_type'],
      registers: [registry],
    }),
    activeConnections: new Gauge({
      name: 'active_connections_total',
      help: 'Number of active connections',
      labelNames: ['type'],
      registers: [registry],
    }),
  };

  return instance;
}

/** Reset singleton — only for use in tests. */
export function resetMetricsForTest(): void {
  instance = null;
}
