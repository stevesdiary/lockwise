import { Request, Response } from 'express';
import { googleAuthService } from '../services/google-auth.service';

export const googleAuthController = {
  // Initiate Google OAuth
  async initiateGoogleAuth(req: Request, res: Response) {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `access_type=offline`;

    res.json({
      statusCode: 200,
      message: 'Google auth URL generated',
      authUrl: googleAuthUrl
    });
  },

  // Handle Google OAuth callback
  async handleGoogleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Authorization code is required'
        });
      }

      // Exchange code for tokens (Google OAuth endpoint - safe, not user-controlled)
      const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Failed to get access token'
        });
      }

      // Get user profile (Google API endpoint - safe, not user-controlled)
      const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
      const profileResponse = await fetch(
        `${GOOGLE_USERINFO_URL}?access_token=${tokens.access_token}`
      );
      const profile = await profileResponse.json();

      // Login with Google
      const result = await googleAuthService.loginWithGoogle({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture
      });

      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('Google callback error:', error);
      res.status(500).json({
        statusCode: 500,
        message: 'Google authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Link Google account to existing user
  async linkGoogle(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { google_code } = req.body;

      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: 'User not authenticated'
        });
      }

      if (!google_code) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Google authorization code is required'
        });
      }

      // Exchange code for tokens (Google OAuth endpoint - safe, not user-controlled)
      const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code: google_code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        }),
      });

      const tokens = await tokenResponse.json();
      
      const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
      const profileResponse = await fetch(
        `${GOOGLE_USERINFO_URL}?access_token=${tokens.access_token}`
      );
      const profile = await profileResponse.json();

      const result = await googleAuthService.linkGoogleAccount(userId, {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture
      });

      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('Link Google error:', error);
      res.status(500).json({
        statusCode: 500,
        message: 'Failed to link Google account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Unlink Google account
  async unlinkGoogle(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: 'User not authenticated'
        });
      }

      const result = await googleAuthService.unlinkGoogleAccount(userId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('Unlink Google error:', error);
      res.status(500).json({
        statusCode: 500,
        message: 'Failed to unlink Google account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};