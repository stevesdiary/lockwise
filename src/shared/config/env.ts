import crypto from 'crypto';

const required = [
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'NODE_ENV',
] as const;

const requiredInProduction = [
  'ALLOWED_ORIGINS',
  'PAYSTACK_SECRET_KEY',
] as const;

/**
 * Validates JWT secret strength
 * Requirements:
 * - Minimum 32 characters
 * - Contains uppercase letters
 * - Contains lowercase letters
 * - Contains numbers
 * - Contains special characters
 */
function validateJWTSecret(secret: string, name: string): void {
  if (secret.length < 32) {
    throw new Error(
      `${name} must be at least 32 characters long. Current length: ${secret.length}`
    );
  }

  const hasUpperCase = /[A-Z]/.test(secret);
  const hasLowerCase = /[a-z]/.test(secret);
  const hasNumbers = /[0-9]/.test(secret);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret);

  const missing: string[] = [];
  if (!hasUpperCase) missing.push('uppercase letters');
  if (!hasLowerCase) missing.push('lowercase letters');
  if (!hasNumbers) missing.push('numbers');
  if (!hasSpecialChars) missing.push('special characters');

  if (missing.length > 0) {
    throw new Error(
      `${name} must contain: ${missing.join(', ')}. ` +
      `Use a strong random secret generator.`
    );
  }
}

/**
 * Validates that JWT_SECRET and REFRESH_TOKEN_SECRET are different
 */
function validateSecretsAreDifferent(): void {
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

  if (jwtSecret === refreshSecret) {
    throw new Error(
      'JWT_SECRET and REFRESH_TOKEN_SECRET must be different. ' +
      'Using the same secret for both tokens is a security risk.'
    );
  }
}

/**
 * Validates encryption key format
 * Accepts:
 * - 64 hex characters (32 bytes)
 * - 44 base64 characters (32 bytes)
 */
function validateEncryptionKey(): void {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  
  if (!encryptionKey) {
    console.warn('⚠️  ENCRYPTION_KEY not set. Encrypted data features will be disabled.');
    return;
  }

  const isValidHex = encryptionKey.length === 64 && /^[0-9a-fA-F]{64}$/.test(encryptionKey);
  const isValidBase64 = encryptionKey.length === 44 && /^[A-Za-z0-9+/]{43}=$/.test(encryptionKey);

  if (!isValidHex && !isValidBase64) {
    throw new Error(
      `ENCRYPTION_KEY must be 32 bytes encoded as:\n` +
      `  - 64 hex characters (current: ${encryptionKey.length} chars)\n` +
      `  - OR 44 base64 characters\n\n` +
      `Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }
}

/**
 * Validates ALLOWED_ORIGINS in production
 */
function validateAllowedOrigins(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) return;

  const originList = origins.split(',').map(o => o.trim());
  
  // Check for wildcards
  if (originList.some(origin => origin === '*' || origin.includes('*'))) {
    throw new Error(
      'ALLOWED_ORIGINS cannot contain wildcards (*) in production. ' +
      'Specify exact origins for security.'
    );
  }

  // Warn about localhost in production
  if (originList.some(origin => origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    console.warn(
      '⚠️  WARNING: ALLOWED_ORIGINS contains localhost in production. ' +
      'This should only be used for testing.'
    );
  }
}

/**
 * Generates a secure random secret
 */
export function generateSecureSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

/**
 * Main validation function
 */
function validateEnv(): void {
  const missing: string[] = [];

  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check production-only variables
  if (process.env.NODE_ENV === 'production') {
    for (const key of requiredInProduction) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Check your .env file against .env.example\n\n` +
      `To generate secure secrets, run:\n` +
      `node -e "console.log(require('crypto').randomBytes(64).toString('base64').slice(0, 64))"`
    );
  }

  // Validate secret strength (only in production or if explicitly enabled)
  if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_SECRETS === 'true') {
    try {
      validateJWTSecret(process.env.JWT_SECRET!, 'JWT_SECRET');
      validateJWTSecret(process.env.REFRESH_TOKEN_SECRET!, 'REFRESH_TOKEN_SECRET');
      validateSecretsAreDifferent();
      validateEncryptionKey();
      validateAllowedOrigins();
      
      console.log('✅ Environment validation passed');
    } catch (error) {
      if (error instanceof Error) {
        console.error('\n❌ Environment Validation Failed:\n');
        console.error(error.message);
        console.error('\n💡 To generate secure secrets, run:');
        console.error('JWT secrets: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\').slice(0, 64))"');
        console.error('Encryption key: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
        console.error('');
      }
      throw error;
    }
  } else {
    console.warn(
      '⚠️  Running in development mode. Secret validation is relaxed.\n' +
      '   Set VALIDATE_SECRETS=true to enable strict validation in development.'
    );
  }
}

validateEnv();

export { validateEnv };
