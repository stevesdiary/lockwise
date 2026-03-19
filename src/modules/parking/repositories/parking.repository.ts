import { ParkingSlot } from '../../parking/models/parking-slot.model';
import { ParkingAssignment } from '../../parking/models/parking-assignment.model';
import { GuestParking } from '../../parking/models/guest-parking.model';
import { EVChargingSession } from '../../parking/models/ev-charging-session.model';
import { User } from '../../auth';
import { Op } from 'sequelize';

export const parkingRepository = {
  async findSlotById(id: string) {
    return await ParkingSlot.findByPk(id, { include: [ParkingAssignment] });
  },

  async findEstateSlots(estateId: string) {
    return await ParkingSlot.findAll({
      where: { estate_id: estateId },
      include: [ParkingAssignment],
      order: [['slot_number', 'ASC']]
    });
  },

  async findUserAssignment(userId: string) {
    return await ParkingAssignment.findOne({
      where: { user_id: userId, status: 'active' },
      include: [ParkingSlot]
    });
  },

  async createAssignment(data: any) {
    return await ParkingAssignment.create(data);
  },

  async updateSlotStatus(slotId: string, status: string) {
    const slot = await ParkingSlot.findByPk(slotId);
    if (!slot) return null;
    return await slot.update({ status });
  },

  async findGuestParkingConflict(slotId: string, startTime: Date, endTime: Date) {
    return await GuestParking.findOne({
      where: {
        slot_id: slotId,
        status: 'active',
        [Op.or]: [
          { start_time: { [Op.between]: [startTime, endTime] } },
          { end_time: { [Op.between]: [startTime, endTime] } },
          { [Op.and]: [{ start_time: { [Op.lte]: startTime } }, { end_time: { [Op.gte]: endTime } }] }
        ]
      }
    });
  },

  async createGuestParking(data: any) {
    return await GuestParking.create(data);
  },

  async findUserGuestParkings(userId: string) {
    return await GuestParking.findAll({
      where: { owner_id: userId },
      include: [ParkingSlot],
      order: [['start_time', 'DESC']]
    });
  },

  async cancelGuestParking(id: string, userId: string) {
    const guestParking = await GuestParking.findOne({ where: { id, owner_id: userId } });
    if (!guestParking) return null;
    return await guestParking.update({ status: 'cancelled' });
  },

  async findEVSlots(estateId: string) {
    return await ParkingSlot.findAll({
      where: { estate_id: estateId, has_ev_charger: true },
      order: [['slot_number', 'ASC']]
    });
  },

  async createChargingSession(data: any) {
    return await EVChargingSession.create(data);
  },

  async findActiveChargingSession(userId: string) {
    return await EVChargingSession.findOne({
      where: { user_id: userId, status: 'active' },
      include: [ParkingSlot]
    });
  },

  async findChargingSessionById(id: string) {
    return await EVChargingSession.findByPk(id, { include: [ParkingSlot, User] });
  },

  async updateChargingSession(id: string, data: any) {
    const session = await EVChargingSession.findByPk(id);
    if (!session) return null;
    return await session.update(data);
  },

  async findUserChargingSessions(userId: string) {
    return await EVChargingSession.findAll({
      where: { user_id: userId },
      include: [ParkingSlot],
      order: [['start_time', 'DESC']]
    });
  }
};
