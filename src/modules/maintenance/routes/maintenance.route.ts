import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller';
import { authenticateToken, requireManager } from '../../../shared/middleware/auth.middleware';
import { rateLimiters } from '../../../shared/middleware/rate-limit.middleware';
import fileUploadService from '../../upload/services/file-upload.service';

const router = Router();

// Submit a new maintenance request
router.post(
  '/',
  rateLimiters.api,
  authenticateToken,
  maintenanceController.submitRequest
);

// List maintenance requests (scoped by role)
router.get(
  '/',
  rateLimiters.api,
  authenticateToken,
  maintenanceController.listRequests
);

// Upload photos for a maintenance request
router.post(
  '/photos',
  rateLimiters.api,
  authenticateToken,
  fileUploadService.uploader.array('photos', 3),
  maintenanceController.uploadPhotos
);

// Get a single request with comments
router.get(
  '/:id',
  rateLimiters.api,
  authenticateToken,
  maintenanceController.getRequest
);

// Update status (manager only)
router.patch(
  '/:id/status',
  rateLimiters.api,
  authenticateToken,
  requireManager,
  maintenanceController.updateStatus
);

// Add a comment
router.post(
  '/:id/comments',
  rateLimiters.api,
  authenticateToken,
  maintenanceController.addComment
);

// Delete a request (manager only)
router.delete(
  '/:id',
  rateLimiters.api,
  authenticateToken,
  requireManager,
  maintenanceController.deleteRequest
);

export default router;
