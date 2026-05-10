import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import logger from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export class StandardError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let errors: any[] = [];

  // Yup validation errors
  if (error instanceof yup.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = error.inner.map(err => ({
      field: err.path || 'unknown',
      message: err.message,
      type: err.type
    }));
  }

  // Sequelize errors
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database validation failed';
    errors = (error as any).errors?.map((err: any) => ({
      field: err.path,
      message: err.message
    })) || [];
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (statusCode >= 500) {
    logger.error('Server error', { message: error.message, stack: error.stack, url: req.url });
  } else {
    logger.warn('Client error', { message, statusCode, url: req.url });
  }

  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const handleControllerError = (error: any, res: Response) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  if (statusCode >= 500) {
    logger.error('Controller error', { message: error.message, stack: error.stack });
  }

  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};