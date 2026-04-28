import { Router } from 'express';
import bulkUploadController from '../controllers/bulk-upload.controller';
import fileUploadService from '../services/file-upload.service';
import { authenticateToken, requireAdmin, requireManager } from '../../auth/middleware/auth.middleware';

const bulkUploadRouter = Router();

bulkUploadRouter.post('/estates',
  authenticateToken,
  requireAdmin,
  fileUploadService.uploader.single('file'),
  bulkUploadController.uploadEstates
);

bulkUploadRouter.post('/residents',
  authenticateToken,
  requireAdmin,
  fileUploadService.uploader.single('file'),
  bulkUploadController.uploadResidents
);

bulkUploadRouter.post('/addresses',
  authenticateToken,
  requireManager,
  fileUploadService.uploader.single('file'),
  bulkUploadController.uploadAddresses
);

bulkUploadRouter.post(
  '/streets-units',
  authenticateToken,
  requireManager,
  fileUploadService.uploader.single('file'),
  bulkUploadController.uploadStreetsUnits
);

bulkUploadRouter.get('/template/:type', bulkUploadController.getUploadTemplate);

export default bulkUploadRouter;