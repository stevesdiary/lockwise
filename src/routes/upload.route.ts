import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', upload.single('file'), uploadController.uploadFile);

export default router;