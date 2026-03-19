import rateLimit from 'express-rate-limit';

const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const rateLimiters = {
  auth: createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts'),
  api: createRateLimiter(15 * 60 * 1000, 100, 'Too many requests'),
  payment: createRateLimiter(60 * 1000, 10, 'Too many payment requests'),
  upload: createRateLimiter(60 * 1000, 5, 'Too many upload requests'),
  strict: createRateLimiter(60 * 1000, 3, 'Rate limit exceeded')
};