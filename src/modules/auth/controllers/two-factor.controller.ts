import { Request, Response } from 'express';
import twoFactorService from '../services/two-factor.service';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';

export const twoFactorController = {

  async setup(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const role = (req as any).user?.role;

      if (!twoFactorService.isEligibleRole(role)) {
        return res.status(403).json({ status: 'error', message: '2FA is not available for your role' });
      }

      const { secret, qrCodeUri, backupCodes } = await twoFactorService.generateSetup(userId);

      return res.json({
        status: 'success',
        message: '2FA setup initiated. Scan the QR code and verify with a token.',
        data: { secret, qrCodeUri, backupCodes },
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  async verifySetup(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { token, backupCodes } = req.body;

      if (!token || !backupCodes?.length) {
        return res.status(400).json({ status: 'error', message: 'Token and backup codes are required' });
      }

      const success = await twoFactorService.verifyAndEnable(userId, token, backupCodes);
      if (!success) {
        return res.status(400).json({ status: 'error', message: 'Invalid verification code' });
      }

      return res.json({ status: 'success', message: '2FA enabled successfully' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  async validate(req: Request, res: Response) {
    try {
      const { userId, token, backupCode, two_factor_token } = req.body;

      if (!userId || !two_factor_token) {
        return res.status(400).json({ status: 'error', message: 'User ID and 2FA token are required' });
      }

      if (!token && !backupCode) {
        return res.status(400).json({ status: 'error', message: 'TOTP code or backup code is required' });
      }

      // Verify the short-lived 2FA token
      const jwt = (await import('jsonwebtoken')).default;
      try {
        const decoded = jwt.verify(two_factor_token, process.env.JWT_SECRET || 'secret') as any;
        if (decoded.userId !== userId || decoded.purpose !== '2fa') {
          return res.status(401).json({ status: 'error', message: 'Invalid 2FA session' });
        }
      } catch {
        return res.status(401).json({ status: 'error', message: '2FA session expired. Please login again.' });
      }

      let isValid = false;
      if (token) {
        isValid = await twoFactorService.verifyToken(userId, token);
      } else if (backupCode) {
        isValid = await twoFactorService.verifyBackupCode(userId, backupCode);
      }

      if (!isValid) {
        return res.status(401).json({ status: 'error', message: 'Invalid 2FA code' });
      }

      // Issue full tokens
      const { User } = await import('../models/user.model');
      const { Role } = await import('../models/role.model');
      const { Estate } = await import('../../estate/models/estate.model');
      const { createAccessToken, createRefreshToken } = await import('../../../shared/utils/jwt-utils');
      const sessionService = (await import('../services/session.service')).default;

      const user = await User.findByPk(userId, {
        include: [
          { model: Role, as: 'role' },
          { model: Estate, as: 'estate', attributes: ['estate_id', 'name'] },
        ],
      });

      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

      const sessionData = await sessionService.createSession(user.id, {
        userId: user.id,
        estateId: user.estate_id || '',
        role: user.role?.role || 'resident',
      });

      if (!sessionData) {
        return res.status(429).json({ status: 'error', message: 'Maximum concurrent sessions reached' });
      }

      const accessToken = createAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role?.role || 'resident',
        estate_id: user.estate_id,
        sessionId: sessionData.sessionId,
      });

      const { token: refreshToken } = createRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role?.role || 'resident',
        estate_id: user.estate_id,
        sessionId: sessionData.sessionId,
      });

      return res.json({
        status: 'success',
        message: 'Login successful',
        data: {
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            title: user.title ?? null,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            profile_picture: user.profile_picture,
            role: user.role?.role,
            user_type: user.user_type,
            estate_id: user.estate_id,
            estate_name: user.estate?.name ?? null,
          },
          token: accessToken,
        },
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  async disable(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { password, token } = req.body;

      if (!password || !token) {
        return res.status(400).json({ status: 'error', message: 'Password and 2FA token are required' });
      }

      // Verify password
      const { User } = await import('../models/user.model');
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

      const bcrypt = (await import('bcryptjs')).default;
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ status: 'error', message: 'Invalid password' });
      }

      // Verify 2FA token before disabling
      const tokenValid = await twoFactorService.verifyToken(userId, token);
      if (!tokenValid) {
        return res.status(401).json({ status: 'error', message: 'Invalid 2FA code' });
      }

      await twoFactorService.disable(userId);
      return res.json({ status: 'success', message: '2FA disabled' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },

  async regenerateBackupCodes(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ status: 'error', message: '2FA token is required' });
      }

      const tokenValid = await twoFactorService.verifyToken(userId, token);
      if (!tokenValid) {
        return res.status(401).json({ status: 'error', message: 'Invalid 2FA code' });
      }

      const backupCodes = await twoFactorService.regenerateBackupCodes(userId);
      return res.json({
        status: 'success',
        message: 'New backup codes generated. Store them safely.',
        data: { backupCodes },
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  },
};
