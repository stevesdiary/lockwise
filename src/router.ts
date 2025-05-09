import express, { Router } from "express";

import userRouter from "./modules/user/user.route";
import loginRouter from "./modules/user/login.route";
import paymentRouter from "./modules/payment/payment.route";
import estateRouter from "./modules/estate/estate.route";
import roleRouter from "./modules/role/role.route";

const router = Router();

router.use("/user", userRouter);
router.use("/log", loginRouter);
router.use('/payment', paymentRouter);
router.use('/estate', estateRouter);
router.use('/role', roleRouter);



export default router;