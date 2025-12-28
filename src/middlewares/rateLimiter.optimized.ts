import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { getFromRedis, saveToRedis } from '../core/redis';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Authentication endpoints - More lenient
  auth: { windowMs: 15 * 60 * 1000, max: 20, message: 'Too many login attempts' },
  
  // User role based limits - Increased
  admin: { windowMs: 15 * 60 * 1000, max: 5000, message: 'Admin rate limit exceeded' },
  manager: { windowMs: 15 * 60 * 1000, max: 2000, message: 'Manager rate limit exceeded' },
  resident: { windowMs: 15 * 60 * 1000, max: 1000, message: 'Resident rate limit exceeded' },
  security: { windowMs: 15 * 60 * 1000, max: 1500, message: 'Security rate limit exceeded' },
  
  // Endpoint specific limits - Optimized
  'access-codes': { windowMs: 5 * 60 * 1000, max: 50, message: 'Too many access code requests' },
  upload: { windowMs: 60 * 60 * 1000, max: 20, message: 'Upload limit exceeded' },
  analytics: { windowMs: 15 * 60 * 1000, max: 200, message: 'Analytics rate limit exceeded' },
  
  // Global fallback - Much higher
  global: { windowMs: 15 * 60 * 1000, max: 2000, message: 'Global rate limit exceeded' }
};

// Redis-based rate limiter for distributed systems
export const createRedisRateLimit = (type: keyof typeof rateLimitConfigs) => {
  const config = rateLimitConfigs[type];
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: { status: 'fail', message: config.message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const userId = req.user?.id;
      const ip = req.ip;
      return userId ? `user:${userId}:${type}` : `ip:${ip}:${type}`;
    },
    // Use Redis for distributed rate limiting
    store: {
      incr: async (key: string) => {
        const current = await getFromRedis(key);
        const count = current ? parseInt(current) + 1 : 1;
        await saveToRedis(key, count.toString(), Math.ceil(config.windowMs / 1000));
        return { totalHits: count, resetTime: new Date(Date.now() + config.windowMs) };
      },
      decrement: async (key: string) => {
        const current = await getFromRedis(key);
        if (current) {
          const count = Math.max(0, parseInt(current) - 1);
          await saveToRedis(key, count.toString(), Math.ceil(config.windowMs / 1000));
        }
      },
      resetKey: async (key: string) => {
        await saveToRedis(key, '0', Math.ceil(config.windowMs / 1000));
      }
    }
  });
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
      return req.user?.id || req.ip;
    },
    // Skip rate limiting for certain conditions
    skip: (req: Request) => {
      // Skip for health checks
      if (req.path === '/health' || req.path === '/home') return true;
      
      // Skip for super admin in development
      if (process.env.NODE_ENV === 'development' && req.user?.role === 'super_admin') {
        return true;
      }
      
      return false;
    }
  });
};

export const dynamicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => {
    const role = req.user?.role;
    const config = rateLimitConfigs[role as string];
    return config?.max || rateLimitConfigs.global.max;
  },
  message: (req: Request) => {
    const role = req.user?.role;
    const config = rateLimitConfigs[role as string];
    return { status: 'fail', message: config?.message || rateLimitConfigs.global.message };
  },
  keyGenerator: (req: Request) => req.user?.id || req.ip,
  skip: (req: Request) => {
    return req.path === '/health' || req.path === '/home';
  }
});