import { Router, Request, Response } from "express";
import { login, logout } from "../controllers/login.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { rateLimiters } from "../../../shared/middleware/rate-limit.middleware";
import { auditLogger } from "../../../shared/middleware/audit.middleware";
import { analyticsMiddleware } from "../../../shared/middleware/analytics.middleware";
import passwordResetRouter from "./password-reset.route";
const loginRouter = Router();

loginRouter.post("/login", 
  rateLimiters.auth,
  auditLogger as any,
  analyticsMiddleware('user_login') as any,
  (req: Request, res: Response) => { login(req, res);
});

loginRouter.post("/logout", 
  rateLimiters.api,
  authenticateToken as any, 
  auditLogger as any,
  analyticsMiddleware('user_logout') as any,
  (req: Request, res: Response) => { logout(req as any, res);
});

// Password reset routes
loginRouter.use("/password", passwordResetRouter);

export default loginRouter;