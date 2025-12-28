import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import { asyncHandler } from '../middlewares/error-handler.middleware';

const planRouter = Router();

/**
 * @swagger
 * /api/v1/plan:
 *   get:
 *     summary: Get all plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: List of plans
 *       500:
 *         description: Internal server error
 */
planRouter.get('/', asyncHandler(PlanController.getAll));

/**
 * @swagger
 * /api/v1/plan/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan details
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Internal server error
 */
planRouter.get('/:id', asyncHandler(PlanController.getOne));

/**
 * @swagger
 * /api/v1/plan:
 *   post:
 *     summary: Create a new plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Plan created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
planRouter.post('/', asyncHandler(PlanController.create));

/**
 * @swagger
 * /api/v1/plan/{id}:
 *   put:
 *     summary: Update plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Internal server error
 */
planRouter.put('/:id', asyncHandler(PlanController.update));

/**
 * @swagger
 * /api/v1/plan/{id}:
 *   delete:
 *     summary: Delete plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Internal server error
 */
planRouter.delete('/:id', asyncHandler(PlanController.delete));

export default planRouter;