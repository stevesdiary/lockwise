import { Request, Response } from 'express';
import { loginUser, logoutUser } from '../services/login.service';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await loginUser(email, password);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const result = await logoutUser(res);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed' });
  }
};