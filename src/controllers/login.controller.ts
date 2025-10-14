import { Request, Response } from 'express';
import { loginUser, logoutUser } from '../services/login.service';
import { loginSchema } from '../utils/validator';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = await loginSchema.validate(req.body, {abortEarly: false});
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await loginUser(email, password);
    return res.status(result.statusCode).json(result);
  } catch (error: any) {
    console.error('Login controller error:', error);
    
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

export const logout = async (req: Request, res: Response) => {
  try {
    const result = await logoutUser(res);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Logout controller error:', error);
    return res.status(500).json({ message: 'Logout failed' });
  }
};