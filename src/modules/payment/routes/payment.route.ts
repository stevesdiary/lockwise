import Router, { Request as ExpressRequest, Response } from 'express';
const paymentRouter = Router();
import { authenticateToken, requireManager, requireResident, requireAdmin } from '../../auth/middleware/auth.middleware';

// CSRF Protection: POST routes use JWT tokens in Authorization header (not cookies)
// which inherently protects against CSRF attacks as browsers don't auto-send custom headers

import paymentController from '../controllers/payment.controller';

paymentRouter.post(
  "/initiate",
  authenticateToken,
  requireResident,
  async (req: ExpressRequest, res: Response) => {
    await paymentController.initiatePayment(req, res);
  }
);

paymentRouter.post(
  "/subscription",
  authenticateToken,
  requireManager,
  async (req: ExpressRequest, res: Response) => {
    await paymentController.initiateSubscription(req, res);
  }
);

paymentRouter.get(
  "/subscription",
  authenticateToken,
  requireResident,
  async (req: ExpressRequest, res: Response) => {
    await paymentController.getCurrentSubscription(req, res);
  }
);

paymentRouter.get(
  "/subscription/status",
  authenticateToken,
  requireManager,
  async (req: ExpressRequest, res: Response) => {
    await paymentController.getSubscriptionStatus(req, res);
  }
);

paymentRouter.get("/callback", async (req: ExpressRequest, res: Response) => {
  await paymentController.paymentCallback(req, res);
});

paymentRouter.get("/verify/:reference", authenticateToken, requireResident, async (req: ExpressRequest, res: Response) => {
  await paymentController.verifyPayment(req, res);
});

paymentRouter.get("/all", 
  authenticateToken,
  requireResident,
  async (req: ExpressRequest, res: Response) => {
  await paymentController.getAllPayments(req, res);
});

paymentRouter.get("/id/:paymentId",
  authenticateToken,
  requireResident,
  async (req: ExpressRequest, res: Response) => {
  await paymentController.getPaymentById(req, res);
});

paymentRouter.get("/ref/:reference",
  authenticateToken,
  requireResident,
  async (req: ExpressRequest, res: Response) => {
  await paymentController.getPaymentByReference(req, res);
});

paymentRouter.delete(
  "/subscription/:subscriptionId",
  authenticateToken,
  requireAdmin,
  async (req: ExpressRequest, res: Response) => {
    await paymentController.cancelSubscription(req, res);
  }
);

export default paymentRouter;
