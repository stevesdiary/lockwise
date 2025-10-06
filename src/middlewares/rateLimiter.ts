import rateLimit from 'express-rate-limit';
import { Request } from 'express';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  auth: { windowMs: 15 * 60 * 1000, max: 5, message: 'Too many login attempts' },
  
  // User role based limits
  admin: { windowMs: 15 * 60 * 1000, max: 1000, message: 'Admin rate limit exceeded' },
  manager: { windowMs: 15 * 60 * 1000, max: 500, message: 'Manager rate limit exceeded' },
  resident: { windowMs: 15 * 60 * 1000, max: 200, message: 'Resident rate limit exceeded' },
  security: { windowMs: 15 * 60 * 1000, max: 300, message: 'Security rate limit exceeded' },
  
  // Endpoint specific limits
  'access-codes': { windowMs: 5 * 60 * 1000, max: 10, message: 'Too many access code requests' },
  upload: { windowMs: 60 * 60 * 1000, max: 5, message: 'Upload limit exceeded' },
  analytics: { windowMs: 15 * 60 * 1000, max: 50, message: 'Analytics rate limit exceeded' }
};

export const createRateLimit = (type: keyof typeof rateLimitConfigs) => {
  const config = rateLimitConfigs[type];
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: { status: 'fail', message: config.message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip;
    }
  });
};

export const dynamicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => {
    // Dynamic limits based on user role
    const role = req.user?.role;
    const config = rateLimitConfigs[role as string];
    return config?.max || 100; // Default limit
  },
  message: (req: Request) => {
    const role = req.user?.role;
    const config = rateLimitConfigs[role as string];
    return { status: 'fail', message: config?.message || 'Rate limit exceeded' };
  },
  keyGenerator: (req: Request) => req.user?.id || req.ip
});