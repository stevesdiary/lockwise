import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, isTokenRevoked, areUserTokensRevoked } from '../utils/jwt-utils';
import sessionService from '../../modules/auth/services/session.service';
import { UserRole } from '../../modules/auth/types/user.types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    sessionId: string;
    estate_id?: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Verify and decode token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Validate decoded token structure
    if (!decoded.userId || !decoded.email || !decoded.role || !decoded.sessionId) {
      console.log('Token validation failed. Missing required fields');
      return res.status(401).json({ error: 'Invalid token structure' });
    }
    
    // Check if token is revoked
    if (decoded.jti && await isTokenRevoked(token)) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    
    // Check if all user tokens are revoked (logout from all devices)
    if (await areUserTokensRevoked(decoded.userId)) {
      return res.status(401).json({ error: 'All sessions have been terminated. Please login again.' });
    }
    
    // Verify session exists and is valid
    const session = await sessionService.getSession(decoded.sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    // Verify session belongs to the user
    if (session.userId !== decoded.userId) {
      console.error('🚨 SECURITY ALERT: Session mismatch detected', {
        tokenUserId: decoded.userId,
        sessionUserId: session.userId,
        ip: req.ip
      });
      return res.status(401).json({ error: 'Session mismatch' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as UserRole,
      sessionId: decoded.sessionId,
      estate_id: session.estateId || decoded.estate_id
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      if (error.message === 'INVALID_TOKEN') {
        return res.status(403).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
      }
    }
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.MASTER, UserRole.SUPER_ADMIN, UserRole.ADMIN);
export const requireSecurity = requireRole(UserRole.SECURITY, UserRole.MANAGER);
export const requireManager = requireRole(UserRole.MASTER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER);
export const requireResident = requireRole(UserRole.MASTER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.RESIDENT);

export { AuthRequest };