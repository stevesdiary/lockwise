import express, { Router } from "express";

import userRouter from "./routes/user.route";
import loginRouter from "./routes/login.route";
import paymentRouter from "./routes/payment.route";
import estateRouter from "./routes/estate.route";
import roleRouter from "./routes/role.router";
import permissionRouter from "./routes/permission.route";
import accessRouter from "./routes/access.route";

const router = Router();

router.use("/user", userRouter);
router.use("/log", loginRouter);
router.use('/payment', paymentRouter);
router.use('/estate', estateRouter);
router.use('/role', roleRouter);
router.use('/permission', permissionRouter);
router.use('/access', accessRouter);




export default router;