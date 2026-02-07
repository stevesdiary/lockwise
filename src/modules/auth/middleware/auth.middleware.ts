import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sessionService from '../../auth/services/session.service';
import { UserRole } from '../../auth/types/user.types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    sessionId: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify session exists and is valid
    const session = await sessionService.getSession(decoded.sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
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

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireManager = requireRole(UserRole.ADMIN, UserRole.MANAGER);
export const requireResident = requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.RESIDENT);

export { AuthRequest };