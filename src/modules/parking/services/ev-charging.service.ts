import { parkingRepository } from '../../parking/repositories/parking.repository';
import { pushNotificationService } from '../../communication/services/push-notification.service';
import { paymentService } from '../../payment/services/payment.service';

export const evChargingService = {
  async getEVChargingSlots(estateId: string) {
    return await parkingRepository.findEVSlots(estateId);
  },

  async startChargingSession(userId: string, slotId: string) {
    const activeSession = await parkingRepository.findActiveChargingSession(userId);
    if (activeSession) throw new Error('You already have an active charging session');

    const slot = await parkingRepository.findSlotById(slotId);
    if (!slot) throw new Error('Parking slot not found');
    if (!slot.has_ev_charger) throw new Error('This slot does not have an EV charger');
    if (slot.status === 'occupied') throw new Error('Charging slot is occupied');

    const session = await parkingRepository.createChargingSession({
      slot_id: slotId,
      user_id: userId,
      start_time: new Date()
    });

    await parkingRepository.updateSlotStatus(slotId, 'occupied');
    await pushNotificationService.sendToUser(userId, 'Charging Started', `Charging session started at slot ${slot.slot_number}`, { type: 'ev_charging', session_id: session.id });

    return session;
  },

  async stopChargingSession(sessionId: string, userId: string, energyConsumed: number) {
    const session = await parkingRepository.findChargingSessionById(sessionId);
    if (!session) throw new Error('Charging session not found');
    if (session.user_id !== userId) throw new Error('Unauthorized');
    if (session.status !== 'active') throw new Error('Session is not active');

    const totalCost = energyConsumed * parseFloat(session.rate_per_kwh.toString());

    await parkingRepository.updateChargingSession(sessionId, {
      end_time: new Date(),
      energy_consumed: energyConsumed,
      total_cost: totalCost,
      status: 'completed'
    });

    await parkingRepository.updateSlotStatus(session.slot_id, 'available');

    // Initiate payment
    const user = session.user;
    const paymentResult = await paymentService.initiatePayment({
      amount: totalCost,
      email: user.email,
      payment_method: 'card',
      user_id: userId,
      estate_id: session.slot.estate_id
    });

    await pushNotificationService.sendToUser(userId, 'Charging Completed', `Session ended. Total: ₦${totalCost.toFixed(2)}`, { type: 'ev_charging', session_id: sessionId });

    return { session, payment: paymentResult };
  },

  async getMyChargingSessions(userId: string) {
    return await parkingRepository.findUserChargingSessions(userId);
  },

  async getActiveSession(userId: string) {
    return await parkingRepository.findActiveChargingSession(userId);
  }
};
