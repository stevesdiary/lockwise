import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { Response } from "express";
import { User } from "../models/user.model";
import { Role } from "../models/role.model";
import { saveToRedis } from "../../../shared/core/redis";
import sessionService from "./session.service";

// Define environment variables with proper types
const jwtExpiry: string | number = process.env.JWT_EXPIRY || "1h";
const jwtSecret: string = process.env.JWT_SECRET || "secret";
const refreshTokenExpiry: string | number = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const refreshSecret: string = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export const loginUser = async (email: string, password: string) => {
  try {
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });
    
    if (!user) {
      return {
        statusCode: 401,
        message: 'Invalid email or password'
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        message: 'Invalid email or password'
      };
    }

    // Create session
    const sessionData = await sessionService.createSession(user.id, {
      userId: user.id,
      estateId: user.estate_id || '',
      role: user.role?.role || 'resident'
    });
    if (!sessionData) {
      return {
        statusCode: 429,
        message: 'Maximum concurrent sessions reached'
      };
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role?.role,
        estate_id: user.estate_id,
        sessionId: sessionData.sessionId
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '15m' }
    );

    return {
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          estate_id: user.estate_id,
          role: user.role?.role
        },
        token
      }
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