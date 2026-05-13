import { Request, Response, NextFunction } from 'express';
import { secureLogger } from '../utils/secure-logger';

/**
 * Custom error class with safe public messages
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Known error types with safe public messages
 */
const ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  // Authentication errors
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  TOKEN_EXPIRED: { status: 401, message: 'Session expired. Please login again' },
  INVALID_TOKEN: { status: 401, message: 'Invalid authentication token' },
  UNAUTHORIZED: { status: 401, message: 'Authentication required' },
  
  // Authorization errors
  FORBIDDEN: { status: 403, message: 'You do not have permission to perform this action' },
  INSUFFICIENT_PERMISSIONS: { status: 403, message: 'Insufficient permissions' },
  
  // Resource errors
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  ALREADY_EXISTS: { status: 409, message: 'Resource already exists' },
  
  // Validation errors
  VALIDATION_ERROR: { status: 400, message: 'Invalid input data' },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Required field is missing' },
  INVALID_FORMAT: { status: 400, message: 'Invalid data format' },
  
  // Business logic errors
  SUBSCRIPTION_EXPIRED: { status: 403, message: 'Subscription has expired' },
  FEATURE_NOT_AVAILABLE: { status: 403, message: 'This feature is not available on your plan' },
  RESIDENT_CAP_EXCEEDED: { status: 400, message: 'Resident limit reached. Please upgrade your plan' },
  
  // Payment errors
  PAYMENT_FAILED: { status: 402, message: 'Payment processing failed' },
  INSUFFICIENT_FUNDS: { status: 402, message: 'Insufficient funds' },
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Too many requests. Please try again later' },
  
  // Server errors
  INTERNAL_ERROR: { status: 500, message: 'An unexpected error occurred' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service temporarily unavailable' },
};

/**
 * Get safe error message for client
 */
function getSafeErrorMessage(error: any): { status: number; message: string; code?: string } {
  // AppError with known code
  if (error instanceof AppError && error.code && ERROR_MESSAGES[error.code]) {
    return {
      ...ERROR_MESSAGES[error.code],
      code: error.code,
    };
  }

  // AppError with custom message (operational)
  if (error instanceof AppError && error.isOperational) {
    return {
      status: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    return {
      status: 400,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
    };
  }

  // Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    return {
      status: 409,
      message: 'Resource already exists',
      code: 'ALREADY_EXISTS',
    };
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ERROR_MESSAGES.INVALID_TOKEN;
  }

  if (error.name === 'TokenExpiredError') {
    return ERROR_MESSAGES.TOKEN_EXPIRED;
  }

  // Default to generic error
  return ERROR_MESSAGES.INTERNAL_ERROR;
}

/**
 * Extract validation errors from Sequelize
 */
function extractValidationErrors(error: any): string[] | undefined {
  if (error.name === 'SequelizeValidationError' && error.errors) {
    return error.errors.map((err: any) => err.message);
  }
  return undefined;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log full error details server-side
  secureLogger.error('Error occurred', err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Get safe error message for client
  const { status, message, code } = getSafeErrorMessage(err);

  // Build response
  const response: any = {
    statusCode: status,
    status: 'error',
    message,
  };

  // Add error code if available
  if (code) {
    response.code = code;
  }

  // Add validation errors in development
  if (process.env.NODE_ENV !== 'production') {
    const validationErrors = extractValidationErrors(err);
    if (validationErrors) {
      response.validationErrors = validationErrors;
    }
    
    // Include stack trace in development
    if (err.stack) {
      response.stack = err.stack;
    }
  }

  // Send response
  res.status(status).json(response);
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response) {
  secureLogger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  res.status(404).json({
    statusCode: 404,
    status: 'error',
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
}

/**
 * Async error wrapper to catch promise rejections
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error helper
 */
export function validationError(message: string, field?: string) {
  const error = new AppError(message, 400, 'VALIDATION_ERROR');
  if (field) {
    (error as any).field = field;
  }
  return error;
}

/**
 * Authorization error helper
 */
export function authorizationError(message: string = 'Insufficient permissions') {
  return new AppError(message, 403, 'FORBIDDEN');
}

/**
 * Authentication error helper
 */
export function authenticationError(message: string = 'Authentication required') {
  return new AppError(message, 401, 'UNAUTHORIZED');
}

/**
 * Not found error helper
 */
export function notFoundError(resource: string = 'Resource') {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
}
