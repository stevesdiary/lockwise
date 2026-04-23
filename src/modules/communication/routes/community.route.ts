import { Router } from 'express';
import { communityController } from '../controllers/community.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import fileUploadService from '../../upload/services/file-upload.service';

const router = Router();

router.get('/messages', authenticateToken, communityController.getMessages);
router.post('/messages', authenticateToken, fileUploadService.chatUploader.single('file'), communityController.sendMessage);
router.post('/messages/file', authenticateToken, fileUploadService.chatUploader.single('file'), communityController.sendMessageWithFile);
router.post('/messages/:messageId/reactions', authenticateToken, communityController.addReaction);
router.delete('/messages/:messageId/reactions/:emoji', authenticateToken, communityController.removeReaction);
router.post('/announcements', authenticateToken, communityController.sendAnnouncement);

export default router;
