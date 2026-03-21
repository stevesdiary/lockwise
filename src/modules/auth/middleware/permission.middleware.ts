import { Response, NextFunction } from 'express';
import { UserRole, Permission, Resource, hasPermission } from '../../../shared/constants/permissions';
import { AuthRequest } from './auth.middleware';

export const requirePermission = (resource: Resource, permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role as UserRole;
    
    if (!hasPermission(userRole, resource, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: { resource, permission },
        role: userRole
      });
    }

    next();
  };
};

export const requireAnyPermission = (resource: Resource, permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role as UserRole;
    const hasAnyPermission = permissions.some(permission => 
      hasPermission(userRole, resource, permission)
    );
    
    if (!hasAnyPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: { resource, permissions },
        role: userRole
      });
    }

    next();
  };
};

export const requireAllPermissions = (resource: Resource, permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role as UserRole;
    const hasAllPermissions = permissions.every(permission => 
      hasPermission(userRole, resource, permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: { resource, permissions },
        role: userRole
      });
    }

    next();
  };
};

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        role: req.user.role
      });
    }

    next();
  };
};
