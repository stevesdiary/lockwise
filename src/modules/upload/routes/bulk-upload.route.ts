import { Router } from 'express';
import bulkUploadController from '../controllers/bulk-upload.controller';
import fileUploadService from '../services/file-upload.service';

const bulkUploadRouter = Router();

bulkUploadRouter.post('/estates', 
  fileUploadService.uploader.single('file'), 
  bulkUploadController.uploadEstates
);

bulkUploadRouter.post('/residents', 
  fileUploadService.uploader.single('file'), 
  bulkUploadController.uploadResidents
);

bulkUploadRouter.post('/addresses', 
  fileUploadService.uploader.single('file'), 
  bulkUploadController.uploadAddresses
);

bulkUploadRouter.get('/template/:type', bulkUploadController.getUploadTemplate);

export default bulkUploadRouter;