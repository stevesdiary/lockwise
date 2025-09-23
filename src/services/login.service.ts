import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { Response } from "express";
import { User } from "../models/user.model";
import { saveToRedis } from "../core/redis";

// Define environment variables with proper types
const jwtExpiry: string | number = process.env.JWT_EXPIRY || "1h";
const jwtSecret: string = process.env.JWT_SECRET || "secret";
const refreshTokenExpiry: string | number = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const refreshSecret: string = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ 
    where: { email }
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

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '1h' }
  );

  return {
    statusCode: 200,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.first_name
    }
  };
};

export const logoutUser = async (res: Response) => {
  try {
    res.clearCookie("sessionId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
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