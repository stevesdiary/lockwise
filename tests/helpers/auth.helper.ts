import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRole } from '../../src/modules/auth/types/user.types';

/**
 * Test user interface with authentication tokens
 */
export interface TestUser {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  refreshToken?: string;
  sessionId?: string;
  password?: string;
}

/**
 * Creates test user data for registration/login
 * @param role - User role
 * @param overrides - Optional field overrides
 * @returns Test user data
 */
export const createTestUserData = (
  role: UserRole = UserRole.RESIDENT,
  overrides: Partial<any> = {}
) => {
  const timestamp = Date.now();
  return {
    first_name: 'Test',
    last_name: 'User',
    email: `test_${timestamp}_${role}@example.com`,
    phone: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'Test@Password123',
    role,
    verified: true,
    status: 'active',
    ...overrides,
  };
};

/**
 * Generates a JWT token for testing
 * @param payload - Token payload
 * @param expiresIn - Token expiration time
 * @returns JWT token string
 */
export const generateTestToken = (
  payload: {
    userId: string;
    email: string;
    role: UserRole;
    sessionId?: string;
  },
  expiresIn: string | number = '15m'
): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test_secret', { expiresIn: expiresIn as any });
};

/**
 * Generates a refresh token for testing
 * @param payload - Token payload
 * @returns Refresh token string
 */
export const generateTestRefreshToken = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string => {
  const options: SignOptions = { expiresIn: '30d' };
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET!,
    options
  );
};

/**
 * Creates a complete test user with tokens
 * @param role - User role
 * @param overrides - Optional field overrides
 * @returns TestUser object
 */
export const createAuthenticatedTestUser = (
  role: UserRole = UserRole.RESIDENT,
  overrides: Partial<any> = {}
): TestUser => {
  const userData = createTestUserData(role, overrides);
  const userId = `test_user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const token = generateTestToken({
    userId,
    email: userData.email,
    role: userData.role,
    sessionId,
  });

  const refreshToken = generateTestRefreshToken({
    userId,
    email: userData.email,
    role: userData.role,
  });

  return {
    id: userId,
    email: userData.email,
    role: userData.role,
    token,
    refreshToken,
    sessionId,
    password: userData.password,
  };
};

/**
 * Creates test users for all roles
 * @returns Record of TestUser objects keyed by role
 */
export const createMultiRoleTestUsers = (): Record<UserRole, TestUser> => {
  const users: Partial<Record<UserRole, TestUser>> = {};

  for (const role of Object.values(UserRole)) {
    users[role] = createAuthenticatedTestUser(role);
  }

  return users as Record<UserRole, TestUser>;
};

/**
 * Gets Authorization header for authenticated requests
 * @param token - JWT token
 * @returns Object with Authorization header
 */
export const getAuthHeader = (token: string): { Authorization: string } => {
  return { Authorization: `Bearer ${token}` };
};

/**
 * Hashes a password for database seeding
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

/**
 * Verifies a JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 */
export const verifyTestToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

/**
 * Creates an expired token for testing
 * @param payload - Token payload
 * @returns Expired JWT token
 */
export const createExpiredToken = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string => {
  const options: SignOptions = { expiresIn: '-1h' };
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};

/**
 * Creates an invalid token for testing
 * @returns Invalid JWT token
 */
export const createInvalidToken = (): string => {
  const options: SignOptions = { expiresIn: '1h' };
  return jwt.sign({ userId: 'test' }, 'wrong_secret', options);
};
