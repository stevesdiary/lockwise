import { Router } from 'express';
import chatController from '../controllers/chat.controller';

const chatRouter = Router();

/**
 * @swagger
 * /api/v1/chat/create:
 *   post:
 *     summary: Create a new support chat
 *     tags: [Chat Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - subject
 *             properties:
 *               userId:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat created successfully
 *       500:
 *         description: Internal server error
 */
chatRouter.post('/create', chatController.createSupportChat);

/**
 * @swagger
 * /api/v1/chat/send:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - message
 *               - senderId
 *             properties:
 *               chatId:
 *                 type: string
 *               message:
 *                 type: string
 *               senderId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [user, support]
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       500:
 *         description: Internal server error
 */
chatRouter.post('/send', chatController.sendMessage);

/**
 * @swagger
 * /api/v1/chat/history/{chatId}:
 *   get:
 *     summary: Get chat history
 *     tags: [Chat Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history retrieved
 *       500:
 *         description: Internal server error
 */
chatRouter.get('/history/:chatId', chatController.getChatHistory);

export default chatRouter;