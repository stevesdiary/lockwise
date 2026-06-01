import type { Sequelize } from 'sequelize-typescript';
import type { QueryOptions } from 'sequelize';
import logger from '../utils/logger';
import { getMetrics } from './metrics';

const SLOW_QUERY_THRESHOLD_MS = Number(process.env.SLOW_QUERY_THRESHOLD_MS ?? 300);

export function attachSequelizeObservability(sequelize: Sequelize): void {
  const metrics = getMetrics();

  sequelize.addHook('beforeQuery', (_options: QueryOptions, query: any) => {
    query._obsStartTime = Date.now();
  });

  sequelize.addHook('afterQuery', (options: QueryOptions, query: any) => {
    if (!query._obsStartTime) return;
    const durationMs = Date.now() - query._obsStartTime;
    const operation = String(options.type ?? 'UNKNOWN');
    const table = (options as any).model?.tableName ?? 'unknown';

    metrics.dbQueryDuration.observe(
      { operation, table, success: 'true' },
      durationMs / 1000,
    );

    if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
      logger.warn('Slow query detected', { duration_ms: durationMs, operation, table });
    }
  });

  // Sequelize v6 has no native queryError hook; pool-level errors are tracked below
  (sequelize as any).pool?.on('error', (error: Error) => {
    metrics.dbQueryErrors.inc({
      operation: 'connection',
      table: 'unknown',
      error_type: error.name ?? 'UnknownError',
    });
  });
}
