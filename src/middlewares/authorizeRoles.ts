import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';

export const authorizeRoles = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const user = await User.findByPk(userId, {
        include: [{ model: Role, attributes: ['role'] }]
      });

      if (!user || !user.role) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied - no role assigned'
        });
      }

      const userRole = user.role.role;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied - insufficient permissions'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Authorization check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};