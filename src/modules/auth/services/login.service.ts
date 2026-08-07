import { Response } from "express";
import { User } from "../models/user.model";
import { Role } from "../models/role.model";
import { Resident } from "../../estate/models/resident.model";
import { Unit } from "../../estate/models/unit.model";
import { Street } from "../../estate/models/street.model";
import { Estate } from "../../estate/models/estate.model";
import sessionService from "./session.service";
import { createAccessToken, createRefreshToken } from "../../../shared/utils/jwt-utils";
import jwt from 'jsonwebtoken';

const TWO_FA_ROLES = ['admin', 'support', 'super_admin', 'manager'];
const getBcrypt = async () => (await import('bcryptjs')).default;

export const loginUser = async (email: string, password: string) => {
  try {
    const bcrypt = await getBcrypt();
    const user = await User.findOne({ 
      where: { email },
      include: [
        { model: Role, as: 'role' },
        { model: Estate, as: 'estate', attributes: ['estate_id', 'name'] },
        {
          model: Resident,
          as: 'residentProfile',
          required: false,
          include: [{
            model: Unit,
            as: 'unit',
            attributes: ['id', 'unit_identifier', 'block'],
            required: false,
            include: [{
              model: Street,
              as: 'street',
              attributes: ['street_id', 'name'],
              required: false
            }]
          }]
        }
      ]
    });
    
    if (!user) {
      return { statusCode: 401, message: 'Invalid email or password' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { statusCode: 401, message: 'Invalid email or password' };
    }

    const userRole = user.role?.role || 'resident';

    // 2FA check — if enabled, return a short-lived 2FA token instead of full access
    if (user.two_factor_enabled) {
      const twoFactorToken = jwt.sign(
        { userId: user.id, purpose: '2fa' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '5m' }
      );

      return {
        statusCode: 200,
        message: 'Two-factor authentication required',
        data: {
          requires_2fa: true,
          two_factor_token: twoFactorToken,
          userId: user.id,
        }
      };
    }

    // Prompt flag — eligible roles without 2FA set up
    const should_prompt_2fa = TWO_FA_ROLES.includes(userRole.toLowerCase()) && !user.two_factor_enabled;

    const sessionData = await sessionService.createSession(user.id, {
      userId: user.id,
      estateId: user.estate_id || '',
      role: user.role?.role || 'resident'
    });
    if (!sessionData) {
      return { statusCode: 429, message: 'Maximum concurrent sessions reached' };
    }

    // Create access token with JTI for revocation support
    const token = createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role?.role || 'resident',
      estate_id: user.estate_id,
      sessionId: sessionData.sessionId
    });

    // Create refresh token with token family for rotation detection
    const { token: refreshToken } = createRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role?.role || 'resident',
      estate_id: user.estate_id,
      sessionId: sessionData.sessionId
    });

    const resident = user.residentProfile;
    const unit = resident?.unit;

    return {
      statusCode: 200,
      message: 'Login successful',
      data: {
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          title: user.title ?? null,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          profile_picture: user.profile_picture,
          role: user.role?.role,
          user_type: user.user_type,
          estate_id: user.estate_id,
          estate_name: user.estate?.name ?? null,
          unit_id: unit?.id ?? null,
          unit_number: unit?.unit_identifier ?? null,
          block: unit?.block ?? null,
          street_name: unit?.street?.name ?? null,
          two_factor_enabled: user.two_factor_enabled,
        },
        token
      },
      ...(should_prompt_2fa && { prompt_2fa_setup: true })
    };
  } catch (error) {
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const { rotateRefreshToken } = await import('../../../shared/utils/jwt-utils');
    
    const result = await rotateRefreshToken(refreshToken);
    
    if (!result) {
      return { statusCode: 401, message: 'Invalid or expired refresh token' };
    }

    return {
      statusCode: 200,
      message: 'Token refreshed',
      data: { 
        token: result.accessToken, 
        refreshToken: result.refreshToken 
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TOKEN_REUSE_DETECTED') {
        // Log security event
        console.error('🚨 SECURITY ALERT: Refresh token reuse detected');
        return { 
          statusCode: 401, 
          message: 'Security violation detected. All sessions have been terminated.',
          code: 'TOKEN_REUSE_DETECTED'
        };
      }
      if (error.message === 'REFRESH_TOKEN_EXPIRED') {
        return { statusCode: 401, message: 'Refresh token expired' };
      }
    }
    throw error;
  }
};

export const logoutUser = async (sessionId?: string, res?: Response) => {
  try {
    if (sessionId) {
      await sessionService.deleteSession(sessionId);
    }
    
    if (res) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }
    
    return {
      statusCode: 200,
      status: "success",
      message: "User logged out",
      data: [],
    };
  } catch (error) {
    throw error;
  }
};
