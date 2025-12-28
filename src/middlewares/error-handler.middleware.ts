import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

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

  console.error('Error:', error);

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
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
};