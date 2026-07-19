import { parkingRepository } from '../../parking/repositories/parking.repository';
import pushNotificationService from '../../communication/services/push.notification.service';
import { nanoid } from 'nanoid';

export const parkingService = {
  async getMyParkingSlot(userId: string) {
    const assignment = await parkingRepository.findUserAssignment(userId);
    if (!assignment) throw new Error('No parking slot assigned');
    return assignment;
  },

  async getEstateSlots(estateId: string) {
    return await parkingRepository.findEstateSlots(estateId);
  },

  async releaseSlotToGuest(userId: string, data: { guest_name: string; guest_phone: string; guest_vehicle_plate?: string; start_time: Date; end_time: Date }) {
    const assignment = await parkingRepository.findUserAssignment(userId);
    if (!assignment) throw new Error('No parking slot assigned to you');

    // Check for conflicts
    const conflict = await parkingRepository.findGuestParkingConflict(assignment.slot_id, data.start_time, data.end_time);
    if (conflict) throw new Error('Slot already released for this time period');

    const accessCode = nanoid(6).toUpperCase();

    const guestParking = await parkingRepository.createGuestParking({
      slot_id: assignment.slot_id,
      owner_id: userId,
      guest_name: data.guest_name,
      guest_phone: data.guest_phone,
      guest_vehicle_plate: data.guest_vehicle_plate,
      start_time: data.start_time,
      end_time: data.end_time,
      access_code: accessCode
    });

    await pushNotificationService.sendToUser(userId, 'Guest Parking Released', `Slot ${assignment.slot.slot_number} released to ${data.guest_name}`, { type: 'guest_parking', id: guestParking.id });

    return guestParking;
  },

  async getMyGuestParkings(userId: string) {
    return await parkingRepository.findUserGuestParkings(userId);
  },

  async cancelGuestParking(id: string, userId: string) {
    const guestParking = await parkingRepository.cancelGuestParking(id, userId);
    if (!guestParking) throw new Error('Guest parking not found');

    await pushNotificationService.sendToUser(userId, 'Guest Parking Cancelled', 'Your guest parking has been cancelled', { type: 'guest_parking', id });

    return guestParking;
  }
};
