import { Request, Response } from 'express';
import { passwordResetService } from '../services/password-reset.service';

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
  }
};