import { Request, Response } from 'express';
import { passwordResetService } from '../services/password-reset.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';

const getBcrypt = async () => (await import('bcryptjs')).default;

export const passwordResetController = {
  async requestReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await passwordResetService.requestReset(email);
      res.json({ message: result.message });
    } catch (error) {
      res.status(500).json({ error: 'Reset request failed' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      const result = await passwordResetService.resetPassword(token, password);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json({ message: result.message });
    } catch (error) {
      res.status(500).json({ error: 'Password reset failed' });
    }
  },

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        return res.status(400).json({ success: false, error: 'current_password and new_password are required' });
      }
      if (new_password.length < 8) {
        return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const bcrypt = await getBcrypt();
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      const hashed = await bcrypt.hash(new_password, 10);
      await user.update({ password: hashed });

      return res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to change password' });
    }
  },
};