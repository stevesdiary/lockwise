import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import { authenticateToken, requireRole } from '../../../shared/middleware/auth.middleware';
import { rateLimiters } from '../../../shared/middleware/rate-limit.middleware';
import { UserRole } from '../../auth/types/user.types';

const router = Router();

// Note: CSRF protection provided by JWT authentication in Authorization header
// (not vulnerable to CSRF attacks like cookie-based auth)

// Resident routes
router.post(
  '/',
  rateLimiters.api,
  authenticateToken,
  reservationController.createReservation
);

router.get(
  '/my',
  rateLimiters.api,
  authenticateToken,
  reservationController.getMyReservations
);

router.patch(
  '/:reservationId/cancel',
  rateLimiters.api,
  authenticateToken,
  reservationController.cancelReservation
);

router.get(
  '/amenities/:amenityId/available',
  rateLimiters.api,
  authenticateToken,
  reservationController.getAvailableSlots
);

// Admin/Manager routes
router.get(
  '/estate/:estateId',
  rateLimiters.api,
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  reservationController.getEstateReservations
);

export default router;
