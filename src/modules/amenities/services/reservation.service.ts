import { reservationRepository } from '../../amenities/repositories/reservation.repository';
import { amenityRepository } from '../../amenities/repositories/amenity.repository';
import { pushNotificationService } from '../../communication/services/push-notification.service';

export const reservationService = {
  async createReservation(userId: string, data: { amenity_id: string; start_time: Date; end_time: Date; guests_count?: number; notes?: string }) {
    const amenity = await amenityRepository.findById(data.amenity_id);
    if (!amenity) throw new Error('Amenity not found');
    if (amenity.status !== 'active') throw new Error('Amenity not available');

    // Check for conflicts
    const conflict = await reservationRepository.findConflict(data.amenity_id, data.start_time, data.end_time);
    if (conflict) throw new Error('Time slot already booked');

    // Calculate amount
    const hours = (new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / (1000 * 60 * 60);
    const total_amount = hours * parseFloat(amenity.hourly_rate.toString());

    const reservation = await reservationRepository.create({
      user_id: userId,
      amenity_id: data.amenity_id,
      start_time: data.start_time,
      end_time: data.end_time,
      guests_count: data.guests_count || 1,
      total_amount,
      notes: data.notes,
      status: 'confirmed'
    });

    await pushNotificationService.sendToUser(userId, 'Reservation Confirmed', `Your ${amenity.name} reservation is confirmed`, { type: 'reservation', reservation_id: reservation.id });

    return reservation;
  },

  async getUserReservations(userId: string) {
    return await reservationRepository.findByUser(userId);
  },

  async getEstateReservations(estateId: string, startDate?: Date, endDate?: Date) {
    return await reservationRepository.findByEstate(estateId, startDate, endDate);
  },

  async cancelReservation(reservationId: string, userId: string, reason?: string) {
    const reservation = await reservationRepository.findByIdAndUser(reservationId, userId);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status === 'cancelled') throw new Error('Already cancelled');

    await reservationRepository.update(reservationId, { status: 'cancelled', cancelled_reason: reason });
    await pushNotificationService.sendToUser(userId, 'Reservation Cancelled', 'Your reservation has been cancelled', { type: 'reservation', reservation_id: reservationId });

    return reservation;
  },

  async getAvailableSlots(amenityId: string, date: Date) {
    const amenity = await amenityRepository.findById(amenityId);
    if (!amenity) throw new Error('Amenity not found');

    const reservations = await reservationRepository.findByAmenityAndDate(amenityId, date);

    return { amenity, reservations };
  }
};
