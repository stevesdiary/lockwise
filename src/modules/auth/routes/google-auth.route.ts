import { Router } from 'express';
import { googleAuthController } from '../controllers/google-auth.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const googleAuthRouter = Router();

// Get Google OAuth URL
googleAuthRouter.get('/google/url', googleAuthController.initiateGoogleAuth);

// Handle Google OAuth callback
googleAuthRouter.get('/google/callback', googleAuthController.handleGoogleCallback);

// Link Google account (requires authentication)
googleAuthRouter.post('/google/link', authenticateToken, googleAuthController.linkGoogle);

// Unlink Google account (requires authentication)
googleAuthRouter.delete('/google/unlink', authenticateToken, googleAuthController.unlinkGoogle);

export default googleAuthRouter;