import jwt from "jsonwebtoken";
import { Response } from "express";
import { User } from "../models/user.model";
import { Role } from "../models/role.model";
import { Resident } from "../../estate/models/resident.model";
import { Unit } from "../../estate/models/unit.model";
import { Street } from "../../estate/models/street.model";
import { Estate } from "../../estate/models/estate.model";
import sessionService from "./session.service";

const getBcrypt = async () => (await import('bcryptjs')).default;

// Define environment variables with proper types
const jwtExpiry: string | number = process.env.JWT_EXPIRY || "1h";
const jwtSecret: string = process.env.JWT_SECRET || "secret";
const refreshTokenExpiry: string | number = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const refreshSecret: string = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

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

    const sessionData = await sessionService.createSession(user.id, {
      userId: user.id,
      estateId: user.estate_id || '',
      role: user.role?.role || 'resident'
    });
    if (!sessionData) {
      return { statusCode: 429, message: 'Maximum concurrent sessions reached' };
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role?.role,
        estate_id: user.estate_id,
        sessionId: sessionData.sessionId
      },
      process.env.JWT_SECRET || jwtSecret,
      { expiresIn: jwtExpiry }
    );

    const resident = user.residentProfile;
    const unit = resident?.unit;

    return {
      statusCode: 200,
      message: 'Login successful',
      data: {
        refreshToken: sessionData.refreshToken,
        user: {
          id: user.id,
          email: user.email,
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
        },
        token
      }
    };
  } catch (error) {
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const result = await sessionService.refreshSession(refreshToken);
    if (!result) {
      return { statusCode: 401, message: 'Invalid or expired refresh token' };
    }

    const session = await sessionService.getSession(result.sessionId);
    if (!session) {
      return { statusCode: 401, message: 'Session not found' };
    }

    const user = await User.findByPk(session.userId, { attributes: ['id', 'email'] });
    if (!user) {
      return { statusCode: 401, message: 'User not found' };
    }

    const token = jwt.sign(
      {
        userId: session.userId,
        email: user.email,
        role: session.role,
        estate_id: session.estateId,
        sessionId: result.sessionId,
      },
      process.env.JWT_SECRET || jwtSecret,
      { expiresIn: jwtExpiry }
    );

    return {
      statusCode: 200,
      message: 'Token refreshed',
      data: { token, refreshToken: result.newRefreshToken },
    };
  } catch (error) {
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
