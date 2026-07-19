import { Response } from 'express';
import { User } from '../../auth/models/user.model';
import { Role } from '../../auth/models/role.model';
import { asString } from '../../../shared/utils/param.util';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const userId = asString(req.params.userId);
    const { role } = req.body;
    const managerId = req.user?.id;
    const managerEstateId = req.user?.estate_id;

    // Validate role
    const allowedRoles = ['resident', 'security', 'domestic_staff'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: 'Managers can only assign resident, security, or domestic_staff roles'
      });
    }

    // Get target user
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify user is in same estate
    if (targetUser.estate_id !== managerEstateId) {
      return res.status(403).json({
        error: 'You can only update roles for users in your estate'
      });
    }

    // Get role ID
    const roleRecord = await Role.findOne({ where: { role } });
    if (!roleRecord) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Update user role
    await targetUser.update({ role_id: roleRecord.id });

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: targetUser.id,
        newRole: role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
};
