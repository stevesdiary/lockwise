import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../auth/models/user.model';
import { Role } from '../../auth/models/role.model';
import SessionService from './session.service';

export const loginService = async (email: string, password: string, deviceInfo?: string) => {
  const user = await User.findOne({ 
    where: { email },
    include: [{ model: Role, as: 'role' }]
  });
  
  if (!user || !await bcrypt.compare(password, user.password)) {
    return { statusCode: 401, message: 'Invalid credentials' };
  }

  // Create session with concurrent limit enforcement
  const { sessionId, refreshToken } = await SessionService.createSession(user.id, {
    userId: user.id,
    estateId: user.estate_id || '',
    role: user.role?.role || 'resident',
    deviceInfo
  });

  // Short-lived access token (15 minutes)
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      sessionId,
      role: user.role?.role
    }, 
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '15m' }
  );

  return { 
    statusCode: 200, 
    message: 'Login successful', 
    accessToken,
    refreshToken,
    sessionId,
    user: { 
      id: user.id, 
      email: user.email,
      role: user.role?.role,
      estate_id: user.estate_id
    }
  };
};

export const refreshTokenService = async (refreshToken: string) => {
  const result = await SessionService.refreshSession(refreshToken);
  
  if (!result) {
    return { statusCode: 401, message: 'Invalid refresh token' };
  }

  const session = await SessionService.validateSession(result.sessionId);
  if (!session) {
    return { statusCode: 401, message: 'Invalid session' };
  }

  // Generate new access token
  const accessToken = jwt.sign(
    { 
      id: session.userId, 
      sessionId: result.sessionId,
      role: session.role
    }, 
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '15m' }
  );

  return {
    statusCode: 200,
    accessToken,
    refreshToken: result.newRefreshToken,
    sessionId: result.sessionId
  };
};

export const logoutService = async (sessionId: string) => {
  await SessionService.destroySession(sessionId);
  return { statusCode: 200, message: 'Logout successful' };
};

export const validateSessionService = async (sessionId: string) => {
  const session = await SessionService.validateSession(sessionId);
  if (!session) {
    return { statusCode: 401, message: 'Invalid session' };
  }
  return { statusCode: 200, session };
};