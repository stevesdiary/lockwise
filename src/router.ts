import express, { Router } from "express";

// Auth Module
import userRouter from "./modules/auth/routes/user.route";
import loginRouter from "./modules/auth/routes/login.route";
import twoFactorRouter from "./modules/auth/routes/two-factor.route";
import googleAuthRouter from "./modules/auth/routes/google-auth.route";
import passwordResetRouter from "./modules/auth/routes/password-reset.route";
import phoneVerificationRouter from "./modules/auth/routes/phone-verification.route";
import emailVerificationRouter from "./modules/auth/routes/email-verification.route";

// Estate Module
import estateRouter from "./modules/estate/routes/estate.route";

// Access Module
import accessRouter from "./modules/access/routes/access.route";
import accessCodeRouter from "./modules/access/routes/access-code.route";
import nfcRouter from "./modules/access/routes/nfc.route";

// Payment Module
import paymentRouter from "./modules/payment/routes/payment.route";
import planRouter from "./modules/payment/routes/plan.route";
import referralRouter from "./modules/payment/routes/referral.route";
import webhookRouter from "./modules/payment/routes/webhook.route";
import subscriptionRouter from "./modules/payment/routes/subscription.route";

// Amenities Module
import amenityRouter from "./modules/amenities/routes/amenity.route";
import reservationRouter from "./modules/amenities/routes/reservation.route";

// Parking Module
import parkingRouter from "./modules/parking/routes/parking.route";
import evChargingRouter from "./modules/parking/routes/ev-charging.route";

// Support Module
import supportRouter from "./modules/support/routes/support.route";
import adminSupportRouter from "./modules/support/routes/admin.support.route";

// Communication Module
import notificationRouter from "./modules/communication/routes/notification.route";
import chatRouter from "./modules/communication/routes/chat.route";
import webPushRouter from "./modules/communication/routes/web-push.route";
import emergencyRouter from "./modules/communication/routes/emergency.route";
import communityRouter from "./modules/communication/routes/community.route";

// Community Module
import communityBoardRouter from "./modules/community/routes/community.board.route";
import faqRouter from "./modules/community/routes/faq.route";

// Analytics Module
import analyticsRouter from "./modules/analytics/routes/analytics.route";
import dashboardRouter from "./modules/analytics/routes/dashboard.routes";
import adminDashboardRouter from "./modules/analytics/routes/admin-dashboard.route";
import monitoringRouter from "./modules/analytics/routes/monitoring.route";

// Upload Module
import uploadRouter from "./modules/upload/routes/upload.route";
import bulkUploadRouter from "./modules/upload/routes/bulk-upload.route";

// Electricity Module
import electricityRouter from "./modules/electricity/routes/electricity.route";

// Collections Module
import collectionsRouter from "./modules/collections/routes/collections.route";

// Location Module
import addressRouter from "./modules/location/routes/address.route";
import estateAddressRouter from "./modules/estate/routes/address.route";

// Mobile Module
import mobileRouter from "./modules/mobile/routes/mobile.route";

// Admin Module
import adminRouter from "./modules/admin/routes/admin.route";
import roleRouter from "./modules/admin/routes/role.router";
import permissionRouter from "./modules/admin/routes/permission.route";
import apiKeyRouter from "./modules/admin/routes/api-key.route";
import configRouter from "./modules/admin/routes/config.route";
import userRoleRouter from "./modules/admin/routes/user-role.route";

// Legal Module
import legalRouter from "./modules/legal/routes/legal.route";
import workerRouter from "./modules/communication/routes/worker.route";

// Bills Module
import billsRouter from "./modules/bills/routes/bills.route";

// Wallet Module
import walletRouter from "./modules/wallet/routes/wallet.route";

// Kuda Module
import kudaRouter from "./modules/kuda/routes/kuda.route";

const router = Router();

// Auth Routes
router.use("/user", userRouter);
router.use("/auth", loginRouter);
router.use('/auth/google', googleAuthRouter);
router.use('/auth/password', passwordResetRouter);
router.use('/auth/phone', phoneVerificationRouter);
router.use('/auth/email', emailVerificationRouter);
router.use('/auth/2fa', twoFactorRouter);

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
router.use('/community', communityRouter);

// Community Routes
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

// Electricity Routes
router.use('/electricity', electricityRouter);

// Collections Routes
router.use('/collections', collectionsRouter);

// Location Routes
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

// Legacy route for backward compatibility
router.use("/log", loginRouter);

export default router;