import { Request, Response } from 'express';
import { loginService, logoutService, validateSessionService, refreshTokenService } from '../../auth/services/auth.service';

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe = true } = req.body;
    const deviceInfo = req.get('User-Agent') || 'Unknown';
    
    const result = await loginService(email, password, deviceInfo);
    
    if (result.statusCode === 200) {
      // Set refresh token as httpOnly cookie (30 days)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined // 30 days or session
      });
      
      // Don't send refresh token in response body
      const { refreshToken, ...responseData } = result;
      res.status(result.statusCode).json(responseData);
    } else {
      res.status(result.statusCode).json(result);
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    
    const result = await refreshTokenService(refreshToken);
    
    if (result.statusCode === 200) {
      // Update refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      // Don't send refresh token in response
      const { refreshToken: newRefreshToken, ...responseData } = result;
      res.status(result.statusCode).json(responseData);
    } else {
      res.clearCookie('refreshToken');
      res.status(result.statusCode).json(result);
    }
  } catch (error) {
    res.status(500).json({ message: 'Token refresh failed', error });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies.sessionId || req.body.sessionId;
    
    if (sessionId) {
      await logoutService(sessionId);
      res.clearCookie('sessionId');
    }
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error });
  }
};

export const validateSessionController = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies.sessionId || req.headers.authorization?.split(' ')[1];
    
    if (!sessionId) {
      return res.status(401).json({ message: 'No session found' });
    }
    
    const result = await validateSessionService(sessionId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Session validation failed', error });
  }
};