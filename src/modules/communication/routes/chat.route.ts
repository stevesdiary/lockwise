import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';
import { validateChatAccess, validateFileUpload } from '../middleware/chat.middleware';
import fileUploadService from '../../upload/services/file-upload.service';
import chatController from '../controllers/chat.controller';

const chatRouter = Router();

// Apply authentication to all chat routes
chatRouter.use(authenticateToken);

chatRouter.post('/create', chatController.createSupportChat);

chatRouter.post('/send',
  fileUploadService.chatUploader.array('attachments', 3),
  validateFileUpload,
  chatController.sendMessage
);

chatRouter.get('/history/:chatId', validateChatAccess, chatController.getChatHistory);

export default chatRouter;