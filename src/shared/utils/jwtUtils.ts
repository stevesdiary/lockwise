import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { saveToRedis, getFromRedis, deleteFromRedis } from '../core/redis';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  estate_id?: string;
  jti?: string; // JWT ID for revocation
  tokenFamily?: string; // For refresh token rotation
}

interface TokenOptions {
  expiresIn?: string | number;
  includeJti?: boolean;
  tokenFamily?: string;
}

const jwtSecret = process.env.JWT_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

if (!jwtSecret || !refreshSecret) {
  throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET must be configured');
}

/**
 * Generate a unique JWT ID for token revocation
 */
function generateJti(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate a token family ID for refresh token rotation
 */
function generateTokenFamily(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create an access token
 */
export function createAccessToken(
  payload: Omit<TokenPayload, 'jti'>,
  options: TokenOptions = {}
): string {
  const jti = options.includeJti !== false ? generateJti() : undefined;
  
  const tokenPayload: TokenPayload = {
    ...payload,
    ...(jti && { jti })
  };

  return jwt.sign(
    tokenPayload,
    jwtSecret!,
    {
      expiresIn: options.expiresIn || process.env.JWT_EXPIRY || '15m',
      issuer: 'lockwise-api',
      audience: 'lockwise-client'
    }
  );
}

/**
 * Create a refresh token with token family for rotation detection
 */
export function createRefreshToken(
  payload: Omit<TokenPayload, 'jti' | 'tokenFamily'>,
  options: TokenOptions = {}
): { token: string; tokenFamily: string } {
  const jti = generateJti();
  const tokenFamily = options.tokenFamily || generateTokenFamily();
  
  const tokenPayload: TokenPayload = {
    ...payload,
    jti,
    tokenFamily
  };

  const token = jwt.sign(
    tokenPayload,
    refreshSecret!,
    {
      expiresIn: '30d',
      issuer: 'lockwise-api',
      audience: 'lockwise-client'
    }
  );

  return { token, tokenFamily };
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, jwtSecret!, {
      issuer: 'lockwise-api',
      audience: 'lockwise-client'
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_TOKEN');
    }
    return null;
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, refreshSecret!, {
      issuer: 'lockwise-api',
      audience: 'lockwise-client'
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
    return null;
  }
}

/**
 * Decode token without verification (for inspection only)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Revoke a token by adding its JTI to blacklist
 */
export async function revokeToken(token: string): Promise<void> {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.jti) {
    throw new Error('Token does not have a JTI');
  }

  const exp = decoded.exp as number;
  const ttl = exp - Math.floor(Date.now() / 1000);

  if (ttl > 0) {
    await saveToRedis(`revoked:${decoded.jti}`, '1', ttl);
  }
}

/**
 * Check if a token is revoked
 */
export async function isTokenRevoked(token: string): Promise<boolean> {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.jti) {
    return false;
  }

  const revoked = await getFromRedis<string>(`revoked:${decoded.jti}`);
  return revoked === '1';
}

/**
 * Revoke all tokens in a token family (for refresh token rotation)
 */
export async function revokeTokenFamily(tokenFamily: string): Promise<void> {
  await saveToRedis(`revoked_family:${tokenFamily}`, '1', 30 * 24 * 60 * 60); // 30 days
}

/**
 * Check if a token family is revoked
 */
export async function isTokenFamilyRevoked(tokenFamily: string): Promise<boolean> {
  const revoked = await getFromRedis<string>(`revoked_family:${tokenFamily}`);
  return revoked === '1';
}

/**
 * Rotate refresh token (detect reuse attacks)
 */
export async function rotateRefreshToken(
  oldToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const decoded = verifyRefreshToken(oldToken);
    if (!decoded) {
      return null;
    }

    // Check if token is revoked
    if (decoded.jti && await isTokenRevoked(oldToken)) {
      throw new Error('TOKEN_REVOKED');
    }

    // Check if token family is revoked (reuse detected)
    if (decoded.tokenFamily && await isTokenFamilyRevoked(decoded.tokenFamily)) {
      throw new Error('TOKEN_REUSE_DETECTED');
    }

    // Check if this specific refresh token was already used
    const used = await getFromRedis<string>(`used_refresh:${decoded.jti}`);
    if (used) {
      // Token reuse detected! Revoke entire family
      if (decoded.tokenFamily) {
        await revokeTokenFamily(decoded.tokenFamily);
      }
      throw new Error('TOKEN_REUSE_DETECTED');
    }

    // Mark this refresh token as used
    const exp = decoded.exp as number;
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await saveToRedis(`used_refresh:${decoded.jti}`, '1', ttl);
    }

    // Create new tokens with same family
    const accessToken = createAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId,
      estate_id: decoded.estate_id
    });

    const { token: refreshToken } = createRefreshToken(
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        sessionId: decoded.sessionId,
        estate_id: decoded.estate_id
      },
      { tokenFamily: decoded.tokenFamily }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TOKEN_REUSE_DETECTED') {
        // Log security event
        console.error('🚨 SECURITY ALERT: Refresh token reuse detected');
      }
    }
    throw error;
  }
}

/**
 * Revoke all tokens for a user (logout from all devices)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await saveToRedis(`revoked_user:${userId}`, '1', 30 * 24 * 60 * 60); // 30 days
}

/**
 * Check if all user tokens are revoked
 */
export async function areUserTokensRevoked(userId: string): Promise<boolean> {
  const revoked = await getFromRedis<string>(`revoked_user:${userId}`);
  return revoked === '1';
}

/**
 * Clear user token revocation (allow new logins)
 */
export async function clearUserTokenRevocation(userId: string): Promise<void> {
  await deleteFromRedis(`revoked_user:${userId}`);
}

// Legacy support - keep existing function
export { decodeToken as default };
