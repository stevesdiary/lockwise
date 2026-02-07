import express, { Router } from "express";

// Auth Module
import userRouter from "./modules/auth/routes/user.route";
import loginRouter from "./modules/auth/routes/login.route";
import googleAuthRouter from "./modules/auth/routes/google-auth.route";
import passwordResetRouter from "./modules/auth/routes/password-reset.route";

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
import emergencyRouter from "./modules/communication/routes/emergency.route";

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

// Location Module
import addressRouter from "./modules/location/routes/address.route";

// Mobile Module
import mobileRouter from "./modules/mobile/routes/mobile.route";

// Admin Module
import adminRouter from "./modules/admin/routes/admin.route";
import roleRouter from "./modules/admin/routes/role.router";
import permissionRouter from "./modules/admin/routes/permission.route";
import apiKeyRouter from "./modules/admin/routes/api-key.route";
import configRouter from "./modules/admin/routes/config.route";

// Legal Module
import legalRouter from "./modules/legal/routes/legal.route";

const router = Router();

// Auth Routes
router.use("/user", userRouter);
router.use("/auth", loginRouter);
router.use('/auth/google', googleAuthRouter);
router.use('/auth/password', passwordResetRouter);

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
router.use('/chat', chatRouter);
router.use('/emergency', emergencyRouter);

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

// Location Routes
router.use('/address', addressRouter);

// Mobile Routes
router.use('/mobile', mobileRouter);

// Admin Routes
router.use('/admin', adminRouter);
router.use('/role', roleRouter);
router.use('/permission', permissionRouter);
router.use('/api-key', apiKeyRouter);
router.use('/config', configRouter);

// Legal Routes
router.use('/legal', legalRouter);

// Legacy route for backward compatibility
router.use("/log", loginRouter);

export default router;