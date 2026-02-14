import Router, { Request as ExpressRequest, Response } from 'express';
const paymentRouter = Router();

// CSRF Protection: POST routes use JWT tokens in Authorization header (not cookies)
// which inherently protects against CSRF attacks as browsers don't auto-send custom headers

import paymentController from '../controllers/payment.controller';

paymentRouter.post("/initiate", async (req: ExpressRequest, res: Response) => {
  await paymentController.initiatePayment(req, res);
});

paymentRouter.get("/verify/:reference", async (req: ExpressRequest, res: Response) => {
  await paymentController.verifyPayment(req, res);
});

paymentRouter.get("/all", 
  async (req: ExpressRequest, res: Response) => {
  await paymentController.getAllPayments(req, res);
});

paymentRouter.get("/id/:paymentId",
  async (req: ExpressRequest, res: Response) => {
  await paymentController.getPaymentById(req, res);
});

paymentRouter.get("/ref/:reference",
  async (req: ExpressRequest, res: Response) => {
  await paymentController.getPaymentByReference(req, res);
});

export default paymentRouter;
