import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Enhanced security headers with strict CSP
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true,
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Only count failed attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  skip: () => process.env.NODE_ENV === 'development',
});

// Moderate rate limiter for sensitive operations
export const sensitiveOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests. Please try again later.',
  skip: () => process.env.NODE_ENV === 'development',
});

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please try again after 10 minutes.',
  skip: (req) => {
    // Skip webhooks and health checks
    return (
      req.path.includes('/webhooks/') ||
      req.path.includes('/health') ||
      process.env.NODE_ENV === 'development'
    );
  },
});

// Webhook-specific rate limiter (more permissive)
export const webhookRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Allow burst of webhook events
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Webhook rate limit exceeded',
  skip: () => process.env.NODE_ENV === 'development',
});

// Request size validation middleware
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.headers['content-length'];
  
  if (contentLength) {
    const sizeInMB = parseInt(contentLength) / (1024 * 1024);
    const maxSize = 10; // 10MB default
    
    if (sizeInMB > maxSize) {
      return res.status(413).json({
        error: 'Request entity too large',
        maxSize: `${maxSize}MB`,
      });
    }
  }
  
  next();
};

// Suspicious activity detection
export const detectSuspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  // Path traversal patterns
  const pathTraversalPattern = /(\.\.\/|\.\.\\\/etc\/|proc\/|sys\/)/i;
  
  // SQL injection patterns (more precise - look for SQL keywords with context)
  const sqlInjectionPattern = /('\s*(or|and)\s*'|'\s*=\s*'|;\s*(drop|delete|insert|update|union|select)\s+|--\s*$)/i;
  
  // XSS patterns
  const xssPattern = /(<script[^>]*>|javascript:|onerror\s*=|onload\s*=|<iframe|<object|<embed)/i;
  
  // Check URL path for path traversal
  if (pathTraversalPattern.test(req.path)) {
    console.warn('Path traversal attempt detected:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  // Check query params for SQL injection and XSS
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      if (sqlInjectionPattern.test(value) || xssPattern.test(value)) {
        console.warn('Suspicious query parameter detected:', {
          ip: req.ip,
          path: req.path,
          param: key,
        });
        return res.status(400).json({ error: 'Invalid request' });
      }
    }
  }
  
  // Check request body for XSS (not SQL - body should use parameterized queries)
  if (req.body && typeof req.body === 'object') {
    const bodyStr = JSON.stringify(req.body);
    if (xssPattern.test(bodyStr)) {
      console.warn('XSS attempt in request body detected:', {
        ip: req.ip,
        path: req.path,
      });
      return res.status(400).json({ error: 'Invalid request' });
    }
  }
  
  next();
};
