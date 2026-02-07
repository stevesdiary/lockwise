import { Router, Request, Response } from "express";
import { login, logout } from "../controllers/login.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { rateLimiters } from "../middleware/rate-limit.middleware";
import { auditLogger } from "../middleware/audit.middleware";
import { analyticsMiddleware } from "../middleware/analytics.middleware";
import passwordResetRouter from "./password-reset.route";
const loginRouter = Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
loginRouter.post("/login", 
  rateLimiters.auth,
  auditLogger,
  analyticsMiddleware('user_login'),
  (req: Request, res: Response) => { login(req, res);
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
loginRouter.post("/logout", 
  rateLimiters.api,
  authenticateToken, 
  auditLogger,
  analyticsMiddleware('user_logout'),
  (req: Request, res: Response) => { logout(req, res);
});

// Password reset routes
loginRouter.use("/password", passwordResetRouter);

export default loginRouter;