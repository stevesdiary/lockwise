import { Router } from 'express';
import { googleAuthController } from '../controllers/google-auth.controller';
import authentication from '../middlewares/authentication';

const googleAuthRouter = Router();

// Get Google OAuth URL
googleAuthRouter.get('/google/url', googleAuthController.initiateGoogleAuth);

// Handle Google OAuth callback
googleAuthRouter.get('/google/callback', googleAuthController.handleGoogleCallback);

// Link Google account (requires authentication)
googleAuthRouter.post('/google/link', authentication, googleAuthController.linkGoogle);

// Unlink Google account (requires authentication)
googleAuthRouter.delete('/google/unlink', authentication, googleAuthController.unlinkGoogle);

export default googleAuthRouter;