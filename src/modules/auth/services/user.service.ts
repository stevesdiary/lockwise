import sequelize from '../../../shared/core/database';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import emailVerificationService from './email-verification.service';
import sessionService from './session.service';
import { Estate } from '../../estate/models/estate.model';
import { Resident } from '../../estate/models/resident.model';

const userRepository = new UserRepository();
const getBcrypt = async () => (await import('bcryptjs')).default;

// Cache for role mappings (loaded once at startup)
let roleCache: Record<string, string> | null = null;

const getRoleMapping = async (): Promise<Record<string, string>> => {
  if (roleCache) return roleCache;
  
  const roles = await Role.findAll();
  roleCache = roles.reduce((acc, role) => {
    acc[role.role] = role.id;
    return acc;
  }, {} as Record<string, string>);
  
  return roleCache;
};

export const registerUser = async (userData: {
  title?: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_type: 'resident' | 'security' | 'manager' | 'admin' | 'master';
  estate_id?: string;
  estate_code?: string;
  role_id?: string;
  consent_given?: boolean;
}) => {
  try {
    if (!userData.consent_given) {
      return { statusCode: 400, message: 'You must agree to the Privacy Policy and Terms of Service to register' };
    }

    const bcrypt = await getBcrypt();
    const existingUser = await userRepository.findUserByEmail(userData.email);
    if (existingUser) {
      return { statusCode: 400, message: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Auto-assign role based on user_type if not provided
    const roleMapping = await getRoleMapping();
    const roleId = userData.role_id || roleMapping[userData.user_type];
    
    // If estate_code is provided, find the estate
    let estateId = userData.estate_id;
    if (userData.estate_code && !estateId) {
      const { Estate } = await import('../../estate/models/estate.model');
      const estate = await Estate.findOne({ where: { estate_code: userData.estate_code } as any });
      if (estate) {
        estateId = estate.estate_id;
      }
    }
    
    // Atomically create user + resident profile — if resident creation fails, user is also rolled back
    const user = await sequelize.transaction(async (t) => {
      const newUser = await User.create({
        title: userData.title,
        email: userData.email,
        password: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        user_type: userData.user_type || 'resident',
        status: 'pending' as const,
        verified: false,
        oauth_enabled: false,
        estate_id: estateId,
        role_id: roleId,
        consent_given: true,
        consent_timestamp: new Date(),
      } as any, { transaction: t });

      if (userData.user_type === 'resident') {
        await Resident.create({
          user_id: newUser.id,
          estate_id: estateId || null,
          unit_id: null,
          subscribed: false,
        } as any, { transaction: t });
      }

      return newUser;
    });

    // Send verification code outside the transaction (external call)
    await emailVerificationService.sendVerificationCode(userData.email);

    // If registered with an estate code, notify estate managers of the pending join request
    if (estateId) {
      try {
        const managers = await User.findAll({
          where: { estate_id: estateId, status: 'active' } as any,
          include: [{ model: Role, as: 'role', where: { role: 'manager' }, required: true }],
        });
        const { pushNotificationService } = await import('../../communication/services/push-notification.service');
        for (const manager of managers) {
          pushNotificationService.sendToUser(
            manager.id,
            'New Join Request',
            `${user.first_name} ${user.last_name} wants to join your estate`,
            { type: 'join_request', residentUserId: user.id }
          ).catch(() => {});
        }
      } catch {
        // Non-fatal — proceed even if notification fails
      }
    }

    return {
      statusCode: 201,
      success: true,
      message: 'User registered successfully. Verification code sent to email.',
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        status: user.status
      }
    };
  } catch (error: any) {
    console.error('User registration error:', error);
    return { statusCode: 500, message: 'Registration failed', error: error.message };
  }
};

export const getAllUsers = async (estateId?: string) => {
  const users = estateId 
    ? await userRepository.findAllByEstate(estateId)
    : await User.findAll();
  
  return { statusCode: 200, users };
};

export const getUserById = async (id: string) => {
  const user = await userRepository.findById(id);
  if (!user) {
    return { statusCode: 404, message: 'User not found' };
  }
  return { statusCode: 200, user };
};

export const updateUser = async (id: string, data: Partial<User>) => {
  const user = await userRepository.update(id, data);
  if (!user) {
    return { statusCode: 404, message: 'User not found' };
  }
  return { statusCode: 200, message: 'User updated', user };
};

export const deleteUser = async (estateId: string, id: string) => {
  const deleted = await userRepository.delete(estateId, id);
  if (!deleted) {
    return { statusCode: 404, message: 'User not found' };
  }
  return { statusCode: 200, message: 'User deleted' };
};

export const linkUserToEstate = async (userId: string, estateCode: string, unitId?: string) => {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    // Use statically-imported Estate — dynamic import caused model resolution failures
    const estate = await Estate.findOne({ where: { estate_code: estateCode } as any });
    if (!estate) {
      return { statusCode: 404, message: 'Invalid estate code' };
    }

    await sequelize.transaction(async (t) => {
      await User.update(
        { estate_id: estate.estate_id, status: 'pending' } as any,
        { where: { id: userId } as any, transaction: t }
      );

      const [resident] = await Resident.findOrCreate({
        where: { user_id: userId },
        defaults: { user_id: userId, estate_id: estate.estate_id, unit_id: unitId || null } as any,
        transaction: t,
      });
      if (resident.estate_id !== estate.estate_id || (unitId && resident.unit_id !== unitId)) {
        await resident.update({ estate_id: estate.estate_id, unit_id: unitId || resident.unit_id }, { transaction: t });
      }
    });

    // Build address string for manager notification
    let fullAddress = '';
    if (unitId) {
      const { Unit } = await import('../../estate/models/unit.model');
      const { Street } = await import('../../estate/models/street.model');
      const unit = await Unit.findByPk(unitId, { include: [{ model: Street, as: 'street' }] });
      if (unit) {
        const parts = [
          unit.unit_type ? unit.unit_type.charAt(0).toUpperCase() + unit.unit_type.slice(1) : null,
          unit.unit_identifier,
          (unit as any).street?.name,
          estate.name,
        ].filter(Boolean);
        fullAddress = parts.join(', ');
      }
    }

    // Patch Redis sessions so estate_id is available immediately
    await sessionService.updateEstateIdForUser(userId, estate.estate_id).catch(() => {});

    // Notify estate managers
    const managers = await User.findAll({
      where: { estate_id: estate.estate_id, status: 'active' } as any,
      include: [{ model: Role, as: 'role', where: { role: 'manager' }, required: true }],
    });

    const { pushNotificationService } = await import('../../communication/services/push-notification.service');
    for (const manager of managers) {
      pushNotificationService.sendToUser(
        manager.id,
        'New Join Request',
        `${user.first_name} ${user.last_name} wants to join ${estate.name}${fullAddress ? ` — ${fullAddress}` : ''}`,
        { type: 'join_request', residentUserId: userId, fullAddress }
      ).catch(() => {});
    }

    return {
      statusCode: 200,
      message: 'Join request sent to estate manager. You will be notified once approved.',
      data: { estate: { id: estate.estate_id, name: estate.name } }
    };
  } catch (error: any) {
    console.error('Link user to estate error:', error);
    return { statusCode: 500, message: 'Failed to send join request', error: error.message };
  }
};

export const getPendingResidents = async (estateId: string) => {
  try {
    const { Unit } = await import('../../estate/models/unit.model');
    const { Street } = await import('../../estate/models/street.model');

    const pendingUsers = await User.findAll({
      where: { estate_id: estateId, status: 'pending' } as any,
      include: [{
        model: Resident,
        as: 'residentProfile',
        required: false,
        include: [{
          model: Unit,
          as: 'unit',
          include: [{ model: Street, as: 'street', attributes: ['name'] }],
        }],
      }],
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'status', 'created_at'],
    });

    const data = pendingUsers.map((u) => {
      const plain = u.toJSON() as any;
      const resident = plain.residentProfile;
      const unit = resident?.unit;
      const addressParts = [
        unit?.unit_type ? unit.unit_type.charAt(0).toUpperCase() + unit.unit_type.slice(1) : null,
        unit?.unit_identifier,
        unit?.street?.name,
      ].filter(Boolean);
      return { ...plain, fullAddress: addressParts.join(', ') || null, unit_id: resident?.unit_id || null };
    });

    return { statusCode: 200, success: true, data };
  } catch (error: any) {
    console.error('Get pending residents error:', error);
    return { statusCode: 500, success: false, message: 'Failed to fetch pending residents' };
  }
};

export const approveJoinRequest = async (targetUserId: string, approverId: string) => {
  try {
    const target = await userRepository.findById(targetUserId);
    if (!target || target.status !== 'pending') {
      return { statusCode: 404, message: 'Pending join request not found' };
    }

    await User.update({ status: 'active' } as any, { where: { id: targetUserId } as any });

    // Patch all active Redis sessions so req.user.estate_id is immediately valid
    if (target.estate_id) {
      await sessionService.updateEstateIdForUser(targetUserId, target.estate_id).catch(() => {});
    }

    const { pushNotificationService } = await import('../../communication/services/push-notification.service');
    pushNotificationService.sendToUser(
      targetUserId,
      'Join Request Approved',
      `Welcome to the estate! You can now generate access codes.`,
      { type: 'join_approved' }
    ).catch(() => {});

    return { statusCode: 200, message: 'Resident approved successfully' };
  } catch (error: any) {
    console.error('Approve join request error:', error);
    return { statusCode: 500, message: 'Failed to approve join request' };
  }
};

export const rejectJoinRequest = async (targetUserId: string, approverId: string, reason?: string) => {
  try {
    const target = await userRepository.findById(targetUserId);
    if (!target || target.status !== 'pending') {
      return { statusCode: 404, message: 'Pending join request not found' };
    }

    await sequelize.transaction(async (t) => {
      await User.update({ estate_id: null, status: 'inactive' } as any, { where: { id: targetUserId } as any, transaction: t });
      await Resident.destroy({ where: { user_id: targetUserId } as any, transaction: t });
    });

    const { pushNotificationService } = await import('../../communication/services/push-notification.service');
    pushNotificationService.sendToUser(
      targetUserId,
      'Join Request Declined',
      reason || 'Your request to join the estate was declined. Contact your estate manager.',
      { type: 'join_rejected' }
    ).catch(() => {});

    return { statusCode: 200, message: 'Join request rejected' };
  } catch (error: any) {
    console.error('Reject join request error:', error);
    return { statusCode: 500, message: 'Failed to reject join request' };
  }
};


export const updateProfile = async (userId: string, data: { first_name: string; last_name: string; phone: string }) => {
  try {
    await userRepository.update(userId, data);
    const updatedUser = await userRepository.findById(userId);
    
    if (!updatedUser) {
      return { statusCode: 404, message: 'User not found' };
    }
    
    const { password, reset_token, reset_expires, ...userWithoutSensitive } = updatedUser.toJSON();
    
    return { 
      statusCode: 200, 
      success: true,
      data: userWithoutSensitive 
    };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { statusCode: 500, message: 'Failed to update profile', error: error.message };
  }
};

export const uploadAvatar = async (userId: string, file: Express.Multer.File) => {
  try {
    const fileUploadService = (await import('../../upload/services/file-upload.service')).default;
    const result = await fileUploadService.uploadFile(file, 'avatars');
    
    if (!result.success) {
      return { statusCode: 400, message: result.error || 'Upload failed' };
    }
    
    await userRepository.update(userId, { profile_picture: result.url } as any);
    
    return { 
      statusCode: 200, 
      success: true,
      message: 'Profile picture uploaded successfully', 
      data: { profile_picture: result.url }
    };
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    return { statusCode: 500, message: 'Failed to upload profile picture', error: error.message };
  }
};

export const getCurrentUserEstate = async (userId: string) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'estate_id'],
      include: [{
        model: Estate,
        as: 'estate',
        attributes: [
          'estate_id',
          'estate_code',
          'name',
          'city',
          'state',
          'country',
          'location_details',
          'contact_info'
        ]
      }]
    });

    if (!user) {
      return { statusCode: 404, success: false, message: 'User not found' };
    }

    if (!user.estate_id || !user.estate) {
      return { statusCode: 404, success: false, message: 'No estate linked to this user' };
    }

    return {
      statusCode: 200,
      success: true,
      data: user.estate
    };
  } catch (error: any) {
    console.error('Get current user estate error:', error);
    return { statusCode: 500, success: false, message: 'Failed to fetch estate details', error: error.message };
  }
};
