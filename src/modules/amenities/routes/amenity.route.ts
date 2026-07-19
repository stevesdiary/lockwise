import { Router } from 'express';
import { amenityController } from '../controllers/amenity.controller';
import { authenticateToken, requireRole } from '../../../shared/middleware/auth.middleware';
import { rateLimiters } from '../../../shared/middleware/rate-limit.middleware';
import { UserRole } from '../../auth/types/user.types';

const router = Router();

// Public routes (authenticated users can view)
router.get(
  '/estate/:estateId',
  rateLimiters.api,
  authenticateToken,
  amenityController.getEstateAmenities
);

// Admin/Manager only routes
router.post(
  '/estate/:estateId',
  rateLimiters.api,
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  amenityController.createAmenity
);

router.patch(
  '/:amenityId',
  rateLimiters.api,
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  amenityController.updateAmenity
);

router.delete(
  '/:amenityId',
  rateLimiters.api,
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  amenityController.deleteAmenity
);

export default router;
