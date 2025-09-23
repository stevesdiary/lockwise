import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';

export const authorizePermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByPk(userId, {
      include: {
        model: Role,
        include: [{
          model: Permission,
          through: { attributes: [] }
        }]
      }
    });

    if (!user || !user.role || !Array.isArray(user.role.permissions)) {
      return res.status(403).json({ message: 'Forbidden: No permissions found' });
    }

    const hasPermission = user.role.permissions.some(p => p.action === requiredPermission);

    if (!hasPermission) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};
