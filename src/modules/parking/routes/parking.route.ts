import { Router } from 'express';
import { parkingController } from '../controllers/parking.controller';
import { authenticateToken, requireRole } from '../../auth/middleware/auth.middleware';
import { rateLimiters } from '../../admin/middleware/rate-limit.middleware';
import { UserRole } from '../../auth/types/user.types';

const router = Router();

// Resident routes
router.get(
  '/my-slot',
  rateLimiters.api,
  authenticateToken,
  parkingController.getMySlot
);

router.post(
  '/guest-release',
  rateLimiters.api,
  authenticateToken,
  parkingController.releaseToGuest
);

router.get(
  '/guest-parkings',
  rateLimiters.api,
  authenticateToken,
  parkingController.getMyGuestParkings
);

router.patch(
  '/guest-parkings/:id/cancel',
  rateLimiters.api,
  authenticateToken,
  parkingController.cancelGuestParking
);

// Admin/Manager routes
router.get(
  '/estate/:estateId/slots',
  rateLimiters.api,
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  parkingController.getEstateSlots
);

export default router;
