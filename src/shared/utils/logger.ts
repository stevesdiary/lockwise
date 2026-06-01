import winston from 'winston';
import path from 'path';
import { trace } from '@opentelemetry/api';
import LokiTransport from 'winston-loki';

const logDir = path.join(__dirname, '../../../logs');

const traceContextFormat = winston.format((info) => {
  const span = trace.getActiveSpan();
  if (span) {
    const ctx = span.spanContext();
    info['trace_id'] = ctx.traceId;
    info['span_id'] = ctx.spanId;
  }
  return info;
});

const transports: winston.transport[] = [
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  );
}

if (process.env.LOKI_URL) {
  transports.push(
    new LokiTransport({
      host: process.env.LOKI_URL,
      batching: true,
      interval: 5,
      labels: {
        service: process.env.SERVICE_NAME ?? 'lockwise-api',
        env: process.env.NODE_ENV ?? 'production',
      },
      json: true,
      replaceTimestamp: true,
      onConnectionError: (err: Error) =>
        console.error('Loki connection error:', err.message),
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    traceContextFormat(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: process.env.SERVICE_NAME ?? 'lockwise-server' },
  transports,
});

export default logger;
