import { Request, Response, NextFunction } from 'express';
import { ValidationError, AggregateError } from '../types/validation.type';


export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof Error) {
    switch (error.name) {
      case 'ValidationError':
        return res.status(400).send({
          status: 'error',
          message: 'Validation failed',
          errors: (error as ValidationError).errors
        });
      // Add other error types as needed
      default:
        return res.status(500).send({
          status: 'error',
          message: 'Internal server error'
        });
    }
  }

  next(error);
};

export const handleControllerError = (error: unknown, res: Response): Response => {
  console.error('Controller error:', error);
  
  if (error instanceof Error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({
        status: 'error',
        message: 'Validation failed',
        errors: (error as ValidationError).errors
      });
    }
    if (error.name === 'AggregateError') {
    return res.status(400).send({
      status: 'error',
      message: 'Aggregate error occurred',
      errors: (error as AggregateError).errors
    })
  }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).send({
        status: 'error',
        message: 'Database validation failed',
        errors: error.message
      });
    }
  }
  
  return res.status(500).send({
    status: 'error',
    message: 'Internal server error'
  });
};
