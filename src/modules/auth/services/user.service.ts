import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';

const userRepository = new UserRepository();

export const registerUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_type: 'resident' | 'security' | 'manager' | 'admin';
  estate_id?: string;
  role_id?: string;
}) => {
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    return { statusCode: 400, message: 'User already exists' };
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const user = await userRepository.create({
    email: userData.email,
    password: hashedPassword,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: userData.phone,
    user_type: userData.user_type,
    status: 'pending' as const,
    verified: false,
    oauth_enabled: false,
    estate_id: userData.estate_id,
    role_id: userData.role_id
  } as any);

  return {
    statusCode: 201,
    message: 'User registered successfully',
    user: {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      status: user.status
    }
  };
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
