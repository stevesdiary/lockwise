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

const router = Router();

router.use("/user", userRouter);
router.use("/log", loginRouter);
router.use('/payment', paymentRouter);
router.use('/estate', estateRouter);
router.use('/role', roleRouter);
router.use('/permission', permissionRouter);
router.use('/access', accessRouter);
router.use('/address', addressRouter);
router.use('/upload', uploadRouter);
router.use('/dashboard', dashboardRouter);
router.use('/analytics', analyticsRouter);
router.use('/auth', googleAuthRouter);



export default router;