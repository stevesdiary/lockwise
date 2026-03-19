import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    // Validate decoded token structure
    if (!decoded.userId || !decoded.email || !decoded.role || !decoded.sessionId) {
      console.log('Token validation failed. Decoded token:', decoded);
      return res.status(401).json({ error: 'Invalid token structure' });
    }
    
    // Verify session exists and is valid
    const session = await sessionService.getSession(decoded.sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    // Verify session belongs to the user
    if (session.userId !== decoded.userId) {
      return res.status(401).json({ error: 'Session mismatch' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId,
      estate_id: decoded.estate_id
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' });
    }
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