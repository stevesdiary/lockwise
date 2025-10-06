import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export const googleAuthService = {
  async loginWithGoogle(profile: GoogleProfile) {
    try {
      // Find user by email (must be registered first)
      const user = await User.findOne({ 
        where: { email: profile.email }
      });

      if (!user) {
        return {
          statusCode: 404,
          message: 'Account not found. Please register first with your email address.',
          requiresRegistration: true
        };
      }

      // Check if Google is already linked
      if (user.google_id && user.google_id !== profile.id) {
        return {
          statusCode: 400,
          message: 'This email is linked to a different Google account.'
        };
      }

      // Link Google account if not already linked
      if (!user.google_id) {
        await user.update({
          google_id: profile.id,
          oauth_enabled: true,
          verified: true // Auto-verify Google users
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          estate_id: user.estate_id 
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      return {
        statusCode: 200,
        message: 'Google login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          estate_id: user.estate_id,
          oauth_enabled: true
        }
      };
    } catch (error) {
      throw error;
    }
  },

  async linkGoogleAccount(userId: string, profile: GoogleProfile) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          statusCode: 404,
          message: 'User not found'
        };
      }

      if (user.google_id) {
        return {
          statusCode: 400,
          message: 'Google account already linked'
        };
      }

      // Check if Google ID is already used by another user
      const existingGoogleUser = await User.findOne({
        where: { google_id: profile.id }
      });

      if (existingGoogleUser) {
        return {
          statusCode: 400,
          message: 'This Google account is already linked to another user'
        };
      }

      await user.update({
        google_id: profile.id,
        oauth_enabled: true
      });

      return {
        statusCode: 200,
        message: 'Google account linked successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  async unlinkGoogleAccount(userId: string) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          statusCode: 404,
          message: 'User not found'
        };
      }

      await user.update({
        google_id: undefined,
        oauth_enabled: false
      });

      return {
        statusCode: 200,
        message: 'Google account unlinked successfully'
      };
    } catch (error) {
      throw error;
    }
  }
};