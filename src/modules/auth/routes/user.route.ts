import { Router, Request as ExpressRequest, Response } from "express";
import * as userController from "../controllers/user.controller";
import {
  authenticateToken,
  requireAdmin,
  requireManager,
} from "../middleware/auth.middleware";
import { rateLimiters } from "../middleware/rate-limit.middleware";
import { auditLogger } from "../middleware/audit.middleware";
import { analyticsMiddleware } from "../middleware/analytics.middleware";

const userRouter = Router();

userRouter.post(
  "/register",
  rateLimiters.auth,
  auditLogger,
  analyticsMiddleware("user_register"),
  async (req: ExpressRequest, res: Response) => {
    res.status(501).json({ message: 'Not implemented' });
  }
);

userRouter.post(
  "/verify",
  rateLimiters.strict,
  auditLogger,
  async (req: ExpressRequest, res: Response) => {
    res.status(501).json({ message: 'Not implemented' });
  }
);

// userRouter.post("/resendcode",
//   async (req: ExpressRequest, res: Response) => {
//   await userController.resendCode(req, res);
// });

userRouter.get(
  "/all",
  rateLimiters.api,
  authenticateToken,
  requireManager,
  auditLogger,
  analyticsMiddleware("users_list_viewed"),
  async (req: ExpressRequest, res: Response) => {
    res.status(501).json({ message: 'Not implemented' });
  }
);

// userRouter.post('/refresh', refreshAccessToken);

userRouter.get(
  "/one/:id",
  authenticateToken,
  requireManager,
  async (req: ExpressRequest, res: Response) => {
    await userController.getUser(req, res);
  }
);

userRouter.delete(
  "/delete/:id",
  rateLimiters.strict,
  authenticateToken,
  requireAdmin,
  auditLogger,
  async (req: ExpressRequest, res: Response) => {
    res.status(501).json({ message: 'Not implemented' });
  }
);

export default userRouter;
