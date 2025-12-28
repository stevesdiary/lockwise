import Router, { Request as ExpressRequest, Response } from 'express';
const paymentRouter = Router();

import paymentController from '../controllers/payment.controller';

/**
 * @swagger
 * /api/v1/payment/initiate:
 *   post:
 *     summary: Initiate a payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInitiation'
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
paymentRouter.post("/initiate", async (req: ExpressRequest, res: Response) => {
  await paymentController.initiatePayment(req, res);
});

/**
 * @swagger
 * /api/v1/payment/verify/{reference}:
 *   get:
 *     summary: Verify a payment by reference
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference
 *     responses:
 *       200:
 *         description: Payment verification result
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
paymentRouter.get("/verify/:reference", async (req: ExpressRequest, res: Response) => {
  await paymentController.verifyPayment(req, res);
});

/**
 * @swagger
 * /api/v1/payment/all:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Payment status filter
 *     responses:
 *       200:
 *         description: List of payments
 *       500:
 *         description: Internal server error
 */
paymentRouter.get("/all", 
  async (req: ExpressRequest, res: Response) => {
  await paymentController.getAllPayments(req, res);
});

/**
 * @swagger
 * /api/v1/payment/id/{paymentId}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *       500:
 *         description: Internal server error
 */
paymentRouter.get("/id/:paymentId",
  async (req: ExpressRequest, res: Response) => {
  await paymentController.getPaymentById(req, res);
});

/**
 * @swagger
 * /api/v1/payment/ref/{reference}:
 *   get:
 *     summary: Get payment by reference
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference
 *     responses:
 *       200:
 *         description: Payment details
 *       500:
 *         description: Internal server error
 */
paymentRouter.get("/ref/:reference",
  async (req: ExpressRequest, res: Response) => {
  await paymentController.getPaymentByReference(req, res);
});

export default paymentRouter;
