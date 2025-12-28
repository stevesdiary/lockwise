import express, { Router } from "express";

import userRouter from "./routes/user.route";
import loginRouter from "./routes/login.route";
import paymentRouter from "./routes/payment.route";
import estateRouter from "./routes/estate.route";
import roleRouter from "./routes/role.router";
import permissionRouter from "./routes/permission.route";
import accessRouter from "./routes/access.route";
import addressRouter from "./routes/address.route";
import uploadRouter from "./routes/upload.route";
import dashboardRouter from "./routes/dashboard.routes";
import analyticsRouter from "./routes/analytics.route";
import googleAuthRouter from "./routes/google-auth.route";
import accessCodeRouter from "./routes/access.code.route";
import faqRouter from "./routes/faq.route";
import configRouter from "./routes/config.route";
import notificationRouter from "./routes/notification.route";
import communityBoardRouter from "./routes/community.board.route";
import emergencyRouter from "./routes/emergency.route";
import supportRouter from "./routes/support.route";
import adminSupportRouter from "./routes/admin.support.route";
import legalRouter from "./routes/legal.route";
import monitoringRouter from "./routes/monitoring.route";
import chatRouter from "./routes/chat.route";
import referralRouter from "./routes/referral.route";
import planRouter from "./routes/plan.route";
import webhookRouter from "./routes/webhook.route";
import bulkUploadRouter from "./routes/bulk-upload.route";

const router = Router();

router.use("/user", userRouter);
router.use("/auth", loginRouter);
router.use('/payment', paymentRouter);
router.use('/estate', estateRouter);
router.use('/role', roleRouter);
router.use('/permission', permissionRouter);
router.use('/access', accessRouter);
router.use('/address', addressRouter);
router.use('/upload', uploadRouter);
router.use('/dashboard', dashboardRouter);
router.use('/analytics', analyticsRouter);
router.use('/auth/google', googleAuthRouter);
router.use('/access-codes', accessCodeRouter);
router.use('/faqs', faqRouter);
router.use('/config', configRouter);
router.use('/notifications', notificationRouter);
router.use('/community', communityBoardRouter);
router.use('/emergency', emergencyRouter);
router.use('/support', supportRouter);
router.use('/admin/support', adminSupportRouter);
router.use('/legal', legalRouter);
router.use('/chat', chatRouter);
router.use('/referral', referralRouter);
router.use('/plan', planRouter);
router.use('/bulk-upload', bulkUploadRouter);
router.use('/monitoring', monitoringRouter);
router.use('/webhooks', webhookRouter);

router.use('/webhook', webhookRouter);

// Legacy route for backward compatibility
router.use("/log", loginRouter);



export default router;