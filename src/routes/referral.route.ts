import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller';
import { asyncHandler } from '../middlewares/error-handler.middleware';

const referralRouter = Router();

/**
 * @swagger
 * /api/v1/referral/register:
 *   post:
 *     summary: Register a new referrer
 *     tags: [Referrals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Referrer registered successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
referralRouter.post('/register', asyncHandler(ReferralController.registerReferrer));

/**
 * @swagger
 * /api/v1/referral/{code}:
 *   get:
 *     summary: Get referrer by code
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Referrer details
 *       404:
 *         description: Referrer not found
 *       500:
 *         description: Internal server error
 */
referralRouter.get('/:code', asyncHandler(ReferralController.getReferrer));

/**
 * @swagger
 * /api/v1/referral:
 *   get:
 *     summary: List all referrers
 *     tags: [Referrals]
 *     responses:
 *       200:
 *         description: List of referrers
 *       500:
 *         description: Internal server error
 */
referralRouter.get('/', asyncHandler(ReferralController.listReferrers));

/**
 * @swagger
 * /api/v1/referral/delete/{id}:
 *   delete:
 *     summary: Delete referrer by ID
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Referrer deleted successfully
 *       404:
 *         description: Referrer not found
 *       500:
 *         description: Internal server error
 */
referralRouter.delete('/delete/:id', asyncHandler(ReferralController.deleteReferrer));

export default referralRouter;