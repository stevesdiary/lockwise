import { Router } from "express";

// Auth Module — individual route imports (no barrel for auth routes)
import userRouter from "./modules/auth/routes/user.route";
import loginRouter from "./modules/auth/routes/login.route";
import googleAuthRouter from "./modules/auth/routes/google-auth.route";
import passwordResetRouter from "./modules/auth/routes/password-reset.route";
import phoneVerificationRouter from "./modules/auth/routes/phone-verification.route";
import emailVerificationRouter from "./modules/auth/routes/email-verification.route";

// Feature Modules — barrel imports
import { estateRouter, estateAddressRouter } from "./modules/estate";
import { accessRouter, accessCodeRouter, nfcRouter } from "./modules/access";
import { paymentRouter, planRouter, referralRouter, webhookRouter, subscriptionRouter } from "./modules/payment";
import { amenityRouter, reservationRouter } from "./modules/amenities";
import { parkingRouter, evChargingRouter } from "./modules/parking";
import { supportRouter, adminSupportRouter } from "./modules/support";
import { notificationRouter, chatRouter, emergencyRouter, webPushRouter } from "./modules/communication";
import { communityRouter, communityBoardRouter, faqRouter } from "./modules/community";
import { analyticsRouter, dashboardRouter, adminDashboardRouter, monitoringRouter } from "./modules/analytics";
import { uploadRouter, bulkUploadRouter } from "./modules/upload";
import { addressRouter } from "./modules/location";
import { mobileRouter } from "./modules/mobile";
import { adminRouter, roleRouter, permissionRouter, apiKeyRouter, configRouter, userRoleRouter } from "./modules/admin";
import { legalRouter } from "./modules/legal";
import { billsRouter } from "./modules/bills";
import { collectionsRouter } from "./modules/collections";
import { electricityRouter } from "./modules/electricity";
import { kudaRouter } from "./modules/kuda";
import { walletRouter } from "./modules/wallet";

// Worker routes (direct import — no barrel needed for internal-only route)
import workerRouter from "./modules/communication/routes/worker.route";

const router = Router();

// Auth Routes
router.use("/user", userRouter);
router.use("/auth", loginRouter);
router.use('/auth/google', googleAuthRouter);
router.use('/auth/password', passwordResetRouter);
router.use('/auth/phone', phoneVerificationRouter);
router.use('/auth/email', emailVerificationRouter);

// Estate Routes
router.use('/estate', estateRouter);

// Access Routes
router.use('/access', accessRouter);
router.use('/access-codes', accessCodeRouter);
router.use('/nfc', nfcRouter);

// Payment Routes
router.use('/payment', paymentRouter);
router.use('/plan', planRouter);
router.use('/referral', referralRouter);
router.use('/webhooks', webhookRouter);
router.use('/subscription', subscriptionRouter);

// Amenities Routes
router.use('/amenities', amenityRouter);
router.use('/reservations', reservationRouter);

// Parking Routes
router.use('/parking', parkingRouter);
router.use('/ev-charging', evChargingRouter);

// Support Routes
router.use('/support', supportRouter);
router.use('/admin/support', adminSupportRouter);

// Communication Routes
router.use('/notifications', notificationRouter);
router.use('/push', webPushRouter);
router.use('/chat', chatRouter);
router.use('/emergency', emergencyRouter);

// Community Routes — single mount for all community sub-routes
router.use('/community', communityRouter);
router.use('/community', communityBoardRouter);
router.use('/faqs', faqRouter);

// Analytics Routes
router.use('/analytics', analyticsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/admin/dashboard', adminDashboardRouter);
router.use('/monitoring', monitoringRouter);

// Upload Routes
router.use('/upload', uploadRouter);
router.use('/bulk-upload', bulkUploadRouter);

// Electricity & Collections
router.use('/electricity', electricityRouter);
router.use('/collections', collectionsRouter);

// Location + Estate Address Routes
router.use('/address', addressRouter);
router.use('/address', estateAddressRouter);

// Mobile Routes
router.use('/mobile', mobileRouter);

// Admin Routes
router.use('/admin', adminRouter);
router.use('/role', roleRouter);
router.use('/permission', permissionRouter);
router.use('/api-key', apiKeyRouter);
router.use('/config', configRouter);
router.use('/admin', userRoleRouter);

// Legal Routes
router.use('/legal', legalRouter);

// Bills Routes
router.use('/bills', billsRouter);

// Wallet Routes
router.use('/wallet', walletRouter);

// Kuda Routes
router.use('/kuda', kudaRouter);

// Worker Routes (QStash delivery endpoints)
router.use('/workers', workerRouter);

export default router;
