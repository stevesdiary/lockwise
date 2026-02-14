import { Router } from 'express';
import chatController from '../controllers/chat.controller';

const chatRouter = Router();

chatRouter.post('/create', chatController.createSupportChat);

chatRouter.post('/send', chatController.sendMessage);

chatRouter.get('/history/:chatId', chatController.getChatHistory);

export default chatRouter;