import { UserRole } from '../../src/modules/auth/types/user.types';

/**
 * User test fixtures for consistent test data
 */

/**
 * Generates a unique email for testing
 * @param prefix - Email prefix
 * @returns Unique email address
 */
export const generateUniqueEmail = (prefix: string = 'test'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}_${timestamp}_${random}@example.com`;
};

/**
 * Generates a unique phone number for testing
 * @returns Nigerian phone number
 */
export const generateUniquePhone = (): string => {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `+234${random}`;
};

/**
 * Valid user registration data
 */
export const validUserRegistrationData = {
  first_name: 'John',
  last_name: 'Doe',
  email: generateUniqueEmail('john.doe'),
  phone: generateUniquePhone(),
  password: 'SecurePass@123',
  role: UserRole.RESIDENT,
};

/**
 * Valid admin registration data
 */
export const validAdminRegistrationData = {
  first_name: 'Admin',
  last_name: 'User',
  email: generateUniqueEmail('admin'),
  phone: generateUniquePhone(),
  password: 'AdminPass@123',
  secret_key: process.env.ADMIN_SECRET_KEY || 'test_admin_secret_key_12345',
};

/**
 * Valid login credentials
 */
export const validLoginCredentials = {
  email: 'test@example.com',
  password: 'Test@Password123',
};

/**
 * Invalid user data - missing required fields
 */
export const invalidUserDataMissingFields = {
  first_name: 'John',
  // Missing last_name, email, phone, password
};

/**
 * Invalid user data - invalid email format
 */
export const invalidUserDataBadEmail = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'invalid-email-format',
  phone: generateUniquePhone(),
  password: 'SecurePass@123',
};

/**
 * Invalid user data - weak password
 */
export const invalidUserDataWeakPassword = {
  first_name: 'John',
  last_name: 'Doe',
  email: generateUniqueEmail(),
  phone: generateUniquePhone(),
  password: '123', // Too short
};

/**
 * Invalid user data - invalid phone
 */
export const invalidUserDataBadPhone = {
  first_name: 'John',
  last_name: 'Doe',
  email: generateUniqueEmail(),
  phone: 'invalid-phone',
  password: 'SecurePass@123',
};

/**
 * User factory - creates custom user data
 * @param overrides - Fields to override
 * @returns User data object
 */
export const createUserData = (overrides: Partial<any> = {}) => {
  return {
    first_name: 'Test',
    last_name: 'User',
    email: generateUniqueEmail(),
    phone: generateUniquePhone(),
    password: 'Test@Password123',
    role: UserRole.RESIDENT,
    verified: false,
    status: 'active',
    ...overrides,
  };
};

/**
 * Creates user data for a specific role
 * @param role - User role
 * @param overrides - Fields to override
 * @returns User data object
 */
export const createUserDataForRole = (
  role: UserRole,
  overrides: Partial<any> = {}
) => {
  return createUserData({
    role,
    email: generateUniqueEmail(role.toLowerCase()),
    ...overrides,
  });
};

/**
 * Creates multiple user data objects for all roles
 * @returns Record of user data keyed by role
 */
export const createMultiRoleUserData = (): Record<UserRole, any> => {
  const userData: Partial<Record<UserRole, any>> = {};

  for (const role of Object.values(UserRole)) {
    userData[role] = createUserDataForRole(role);
  }

  return userData as Record<UserRole, any>;
};

/**
 * Verified user data
 */
export const createVerifiedUserData = (overrides: Partial<any> = {}) => {
  return createUserData({
    verified: true,
    ...overrides,
  });
};

/**
 * Suspended user data
 */
export const createSuspendedUserData = (overrides: Partial<any> = {}) => {
  return createUserData({
    status: 'suspended',
    verified: true,
    ...overrides,
  });
};

/**
 * Inactive user data
 */
export const createInactiveUserData = (overrides: Partial<any> = {}) => {
  return createUserData({
    status: 'inactive',
    verified: true,
    ...overrides,
  });
};

/**
 * User profile update data
 */
export const validUserProfileUpdate = {
  first_name: 'Updated',
  last_name: 'Name',
  phone: generateUniquePhone(),
};

/**
 * Password change data
 */
export const validPasswordChangeData = {
  old_password: 'Test@Password123',
  new_password: 'NewSecure@Pass456',
  confirm_password: 'NewSecure@Pass456',
};

/**
 * Password reset request data
 */
export const validPasswordResetRequest = {
  email: generateUniqueEmail(),
};

/**
 * Password reset data
 */
export const validPasswordResetData = {
  token: 'mock_reset_token_12345',
  password: 'NewPassword@123',
  confirm_password: 'NewPassword@123',
};

/**
 * Email verification data
 */
export const validEmailVerificationData = {
  code: '123456',
};

/**
 * Test user credentials by role
 */
export const testUserCredentialsByRole: Record<UserRole, { email: string; password: string }> = {
  [UserRole.SUPER_ADMIN]: {
    email: 'test_super_admin@example.com',
    password: 'Test@Password123',
  },
  [UserRole.ADMIN]: {
    email: 'test_admin@example.com',
    password: 'Test@Password123',
  },
  [UserRole.MANAGER]: {
    email: 'test_manager@example.com',
    password: 'Test@Password123',
  },
  [UserRole.SECURITY]: {
    email: 'test_security@example.com',
    password: 'Test@Password123',
  },
  [UserRole.RESIDENT]: {
    email: 'test_resident@example.com',
    password: 'Test@Password123',
  },
  [UserRole.DOMESTIC_STAFF]: {
    email: 'test_domestic_staff@example.com',
    password: 'Test@Password123',
  },
  [UserRole.CUSTOMER_SERVICE]: {
    email: 'test_customer_service@example.com',
    password: 'Test@Password123',
  },
};
