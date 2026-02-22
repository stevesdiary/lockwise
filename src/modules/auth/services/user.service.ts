import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import emailVerificationService from './email-verification.service';
import { title } from 'process';

const userRepository = new UserRepository();

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
}) => {
  try {
    const existingUser = await userRepository.findUserByEmail(userData.email);
    if (existingUser) {
      return { statusCode: 400, message: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
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
    
    const user = await userRepository.create({
      title: userData.title,
      email: userData.email,
      password: hashedPassword,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      user_type: userData.user_type,
      status: 'pending' as const,
      verified: false,
      oauth_enabled: false,
      estate_id: estateId,
      role_id: roleId
    } as any);

    // Send verification code
    await emailVerificationService.sendVerificationCode(userData.email);

    return {
      statusCode: 201,
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

export const linkUserToEstate = async (userId: string, estateCode: string) => {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    const { Estate } = await import('../../estate/models/estate.model');
    const estate = await Estate.findOne({ where: { estate_code: estateCode } as any });
    if (!estate) {
      return { statusCode: 404, message: 'Invalid estate code' };
    }

    await userRepository.update(userId, { estate_id: estate.estate_id } as any);
    
    // Send welcome email
    const emailService = (await import('../../communication/services/email.service')).default;
    await emailService.sendWelcomeEmail(user.email, user.first_name, estate.name);
    
    return { 
      statusCode: 200, 
      message: 'User linked to estate successfully',
      data: { estate: { id: estate.estate_id, name: estate.name } }
    };
  } catch (error: any) {
    console.error('Link user to estate error:', error);
    return { statusCode: 500, message: 'Failed to link user to estate', error: error.message };
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
