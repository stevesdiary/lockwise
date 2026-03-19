import { Router } from 'express';

// Auth
import userRouter from './modules/auth/routes/user.route';
import loginRouter from './modules/auth/routes/login.route';
import googleAuthRouter from './modules/auth/routes/google-auth.route';
import passwordResetRouter from './modules/auth/routes/password-reset.route';
import phoneVerificationRouter from './modules/auth/routes/phone-verification.route';
import emailVerificationRouter from './modules/auth/routes/email-verification.route';

// Feature modules — imported from barrel index files
import { estateRouter } from './modules/estate';
import { accessRouter, accessCodeRouter, nfcRouter } from './modules/access';
import { paymentRouter, planRouter, referralRouter, webhookRouter } from './modules/payment';
import { amenityRouter, reservationRouter } from './modules/amenities';
import { parkingRouter, evChargingRouter } from './modules/parking';
import { supportRouter, adminSupportRouter } from './modules/support';
import { notificationRouter, chatRouter, emergencyRouter } from './modules/communication';
import { communitySubRouter } from './modules/community';
import { analyticsRouter, dashboardRouter, adminDashboardRouter, monitoringRouter } from './modules/analytics';
import { uploadRouter, bulkUploadRouter } from './modules/upload';
import { addressRouter } from './modules/location';
import { mobileRouter } from './modules/mobile';
import { legalRouter } from './modules/legal';
import {
  adminRouter,
  roleRouter,
  permissionRouter,
  apiKeyRouter,
  configRouter,
  userRoleRouter,
} from './modules/admin';

const router = Router();

// Auth routes
router.use('/user', userRouter);
router.use('/auth', loginRouter);
router.use('/auth/google', googleAuthRouter);
router.use('/auth/password', passwordResetRouter);
router.use('/auth/phone', phoneVerificationRouter);
router.use('/auth/email', emailVerificationRouter);

// Estate
router.use('/estate', estateRouter);

// Access
router.use('/access', accessRouter);
router.use('/access-codes', accessCodeRouter);
router.use('/nfc', nfcRouter);

// Payment
router.use('/payment', paymentRouter);
router.use('/plan', planRouter);
router.use('/referral', referralRouter);
router.use('/webhooks', webhookRouter);

// Amenities
router.use('/amenities', amenityRouter);
router.use('/reservations', reservationRouter);

// Parking
router.use('/parking', parkingRouter);
router.use('/ev-charging', evChargingRouter);

// Support
router.use('/support', supportRouter);
router.use('/admin/support', adminSupportRouter);

// Communication
router.use('/notifications', notificationRouter);
router.use('/chat', chatRouter);
router.use('/emergency', emergencyRouter);

// Community — single mount; sub-router aggregates board, messages, FAQs
router.use('/community', communitySubRouter);

// Analytics
router.use('/analytics', analyticsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/monitoring', monitoringRouter);

// Admin (sub-paths handled by their respective routers)
router.use('/admin/dashboard', adminDashboardRouter);
router.use('/admin/roles', roleRouter);
router.use('/admin/permissions', permissionRouter);
router.use('/admin/api-keys', apiKeyRouter);
router.use('/admin/config', configRouter);
router.use('/admin/user-roles', userRoleRouter);
router.use('/admin', adminRouter);

// Other
router.use('/upload', uploadRouter);
router.use('/bulk-upload', bulkUploadRouter);
router.use('/address', addressRouter);
router.use('/mobile', mobileRouter);
router.use('/legal', legalRouter);

// Legacy route for backward compatibility
router.use('/log', loginRouter);

export default router;
