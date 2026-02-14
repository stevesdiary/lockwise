import { Request, Response } from 'express';
import { loginUser, logoutUser } from '../../auth/services/login.service';
import { loginSchema } from '../../../shared/utils/validator';
import { AuthRequest } from '../../auth/middleware/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = await loginSchema.validate(req.body, {abortEarly: false});
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await loginUser(email, password);
    return res.status(result.statusCode).json(result);
  } catch (error: any) {
    const sanitizedError = error?.message?.replace(/[\r\n]/g, '') || 'Unknown error';
    console.error('Login controller error:', sanitizedError);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    
    // Handle database errors
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({ message: 'Database connection error' });
    }
    
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const result = await logoutUser(req.user?.sessionId, res);
    return res.status(result.statusCode).json(result);
  } catch (error: any) {
    const sanitizedError = error?.message?.replace(/[\r\n]/g, '') || 'Unknown error';
    console.error('Logout controller error:', sanitizedError);
    return res.status(500).json({ message: 'Logout failed' });
  }
};