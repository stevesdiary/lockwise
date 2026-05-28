import { Response } from 'express';
import { adminService } from '../services/admin.service';
import { AuthRequest } from '../../auth/middleware/auth.middleware';

export const adminController = {
  async registerAdmin(req: AuthRequest, res: Response) {
    try {
      const { title, first_name, last_name, email, phone, password, admin_secret } = req.body;

      const result = await adminService.createAdmin({
        title: title,
        first_name,
        last_name,
        email,
        phone,
        password,
        admin_secret
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('Admin registration error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async createAgent(req: AuthRequest, res: Response) {
    try {
      const { first_name, last_name, email, phone, password } = req.body;

      const result = await adminService.createCustomerServiceAgent(req.user!.id, {
        first_name,
        last_name,
        email,
        phone,
        password
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('Agent creation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};