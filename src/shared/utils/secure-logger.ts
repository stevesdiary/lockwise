import winston from 'winston';
import path from 'path';

/**
 * Secure Logger with automatic sanitization of sensitive data
 * Prevents logging of passwords, tokens, API keys, and PII
 */

// Sensitive field patterns to redact
const SENSITIVE_PATTERNS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'api_key',
  'apikey',
  'api-key',
  'authorization',
  'auth',
  'bearer',
  'jwt',
  'session',
  'cookie',
  'credit_card',
  'creditcard',
  'card_number',
  'cvv',
  'ssn',
  'social_security',
  'private_key',
  'privatekey',
  'access_token',
  'refresh_token',
  'client_secret',
  'paystack_secret',
  'kuda_secret',
  'firebase_key',
];

// PII patterns to redact
const PII_PATTERNS = [
  'email',
  'phone',
  'mobile',
  'address',
  'bvn',
  'nin',
  'passport',
  'license',
  'account_number',
  'bank_account',
];

class SecureLogger {
  private logger: winston.Logger;
  private shouldRedactPII: boolean;

  constructor() {
    this.shouldRedactPII = process.env.NODE_ENV === 'production';

    // Configure Winston logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'lockwise-server' },
      transports: [
        // Error logs
        new winston.transports.File({
          filename: path.join('logs', 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Combined logs
        new winston.transports.File({
          filename: path.join('logs', 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // Console logging for non-production
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      );
    }
  }

  /**
   * Sanitize data by redacting sensitive fields
   */
  private sanitize(data: any, depth = 0): any {
    // Prevent infinite recursion
    if (depth > 10) return '[MAX_DEPTH_EXCEEDED]';

    // Handle null/undefined
    if (data === null || data === undefined) return data;

    // Handle primitives
    if (typeof data !== 'object') return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item, depth + 1));
    }

    // Handle objects
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Check if key matches sensitive pattern
      const isSensitive = SENSITIVE_PATTERNS.some((pattern) =>
        lowerKey.includes(pattern)
      );

      // Check if key matches PII pattern (only in production)
      const isPII =
        this.shouldRedactPII &&
        PII_PATTERNS.some((pattern) => lowerKey.includes(pattern));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (isPII) {
        sanitized[key] = this.maskPII(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Mask PII data (show first/last characters only)
   */
  private maskPII(value: any): string {
    if (typeof value !== 'string') return '[PII_REDACTED]';
    if (value.length <= 4) return '***';

    // Email masking: j***@example.com
    if (value.includes('@')) {
      const [local, domain] = value.split('@');
      return `${local[0]}***@${domain}`;
    }

    // Phone masking: +234***1234
    if (value.startsWith('+') || /^\d+$/.test(value)) {
      return `${value.slice(0, 4)}***${value.slice(-4)}`;
    }

    // Generic masking: show first and last 2 chars
    return `${value.slice(0, 2)}***${value.slice(-2)}`;
  }

  /**
   * Sanitize error objects
   */
  private sanitizeError(error: Error): any {
    return {
      message: error.message,
      name: error.name,
      stack:
        process.env.NODE_ENV === 'production'
          ? '[STACK_TRACE_REDACTED]'
          : error.stack,
    };
  }

  /**
   * Log info level
   */
  info(message: string, meta?: any) {
    this.logger.info(message, this.sanitize(meta));
  }

  /**
   * Log error level
   */
  error(message: string, error?: Error | any, meta?: any) {
    const sanitizedMeta = this.sanitize(meta);
    const sanitizedError =
      error instanceof Error ? this.sanitizeError(error) : this.sanitize(error);

    this.logger.error(message, {
      ...sanitizedMeta,
      error: sanitizedError,
    });
  }

  /**
   * Log warning level
   */
  warn(message: string, meta?: any) {
    this.logger.warn(message, this.sanitize(meta));
  }

  /**
   * Log debug level
   */
  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(message, this.sanitize(meta));
    }
  }

  /**
   * Log HTTP request (with automatic sanitization)
   */
  logRequest(req: any) {
    const sanitizedReq = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      body: this.sanitize(req.body),
      query: this.sanitize(req.query),
      params: this.sanitize(req.params),
      user: req.user ? { id: req.user.id, role: req.user.role } : undefined,
    };

    this.info('HTTP Request', sanitizedReq);
  }

  /**
   * Log HTTP response
   */
  logResponse(req: any, res: any, duration: number) {
    this.info('HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      user: req.user ? { id: req.user.id } : undefined,
    });
  }

  /**
   * Log authentication events
   */
  logAuth(event: string, userId?: string, meta?: any) {
    this.info(`Auth: ${event}`, {
      userId,
      ...this.sanitize(meta),
    });
  }

  /**
   * Log payment events (with extra sanitization)
   */
  logPayment(event: string, meta?: any) {
    const sanitizedMeta = this.sanitize(meta);
    // Extra sanitization for payment data
    if (sanitizedMeta.amount) {
      sanitizedMeta.amount = `${sanitizedMeta.amount} ${sanitizedMeta.currency || 'NGN'}`;
    }
    this.info(`Payment: ${event}`, sanitizedMeta);
  }

  /**
   * Log security events
   */
  logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any) {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    this.logger.log(level, `Security: ${event}`, {
      severity,
      ...this.sanitize(meta),
    });
  }
}

// Export singleton instance
export const secureLogger = new SecureLogger();

// Export for testing
export { SecureLogger };
