import { Router } from 'express';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { requirePermission } from '../../auth/middleware/permission.middleware';
import { Resource, Permission } from '../../../shared/constants/permissions';
import { updateUserRole } from '../controllers/user-role.controller';

const userRoleRouter = Router();

userRoleRouter.put(
  '/users/:userId/role',
  authenticateToken,
  requirePermission(Resource.ROLES, Permission.UPDATE),
  updateUserRole
);

export default userRoleRouter;
