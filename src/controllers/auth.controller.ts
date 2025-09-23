import { Request, Response } from 'express';
import { loginService } from '../services/auth.service';

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginService(email, password);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};