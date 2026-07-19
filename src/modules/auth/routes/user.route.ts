import { Router, Request as ExpressRequest, Response } from "express";
import multer from "multer";
import * as userController from "../controllers/user.controller";
import {
  authenticateToken,
  requireAdmin,
  requireManager,
  AuthRequest,
} from "../../../shared/middleware/auth.middleware";
import { rateLimiters } from "../../../shared/middleware/rate-limit.middleware";
import { auditLogger } from "../../../shared/middleware/audit.middleware";
import { analyticsMiddleware } from "../../../shared/middleware/analytics.middleware";

const userRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for avatars
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

userRouter.post(
  "/register",
  rateLimiters.auth,
  auditLogger as any,
  analyticsMiddleware("user_register") as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.registerUser(req, res);
  }
);

userRouter.post(
  "/verify",
  rateLimiters.strict,
  auditLogger as any,
  async (req: ExpressRequest, res: Response) => {
    res.status(501).json({ message: 'Not implemented' });
  }
);

userRouter.get(
  "/all",
  rateLimiters.api,
  authenticateToken as any,
  requireManager as any,
  auditLogger as any,
  analyticsMiddleware("users_list_viewed") as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.getAllUsers(req, res);
  }
);

userRouter.get(
  "/one/:id",
  authenticateToken as any,
  requireManager as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.getUser(req, res);
  }
);

userRouter.delete(
  "/delete/:id",
  rateLimiters.strict,
  authenticateToken as any,
  requireAdmin as any,
  auditLogger as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.deleteUser(req, res);
  }
);

userRouter.post(
  "/link-estate",
  rateLimiters.api,
  authenticateToken as any,
  auditLogger as any,
  analyticsMiddleware("user_estate_linked") as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.linkUserToEstate(req, res);
  }
);

userRouter.get(
  "/estate",
  rateLimiters.api,
  authenticateToken as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.getCurrentUserEstate(req, res);
  }
);

userRouter.get(
  "/pending-residents",
  rateLimiters.api,
  authenticateToken as any,
  requireManager as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.getPendingResidents(req, res);
  }
);

userRouter.post(
  "/:userId/approve-join",
  rateLimiters.api,
  authenticateToken as any,
  requireManager as any,
  auditLogger as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.approveJoinRequest(req, res);
  }
);

userRouter.post(
  "/:userId/reject-join",
  rateLimiters.api,
  authenticateToken as any,
  requireManager as any,
  auditLogger as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.rejectJoinRequest(req, res);
  }
);

userRouter.post(
  "/avatar",
  authenticateToken as any,
  upload.single('avatar'),
  async (req: ExpressRequest, res: Response) => {
    await userController.uploadAvatar(req, res);
  }
);

userRouter.put(
  "/profile",
  authenticateToken as any,
  async (req: ExpressRequest, res: Response) => {
    await userController.updateProfile(req, res);
  }
);

export default userRouter;
