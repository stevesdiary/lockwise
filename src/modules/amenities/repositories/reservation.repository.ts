import { Reservation } from '../../amenities/models/reservation.model';
import { Amenity } from '../../amenities/models/amenity.model';
import { User } from '../../auth';
import { Op } from 'sequelize';

export const reservationRepository = {
  async create(data: any) {
    return await Reservation.create(data);
  },

  async findById(id: string) {
    return await Reservation.findByPk(id, {
      include: [Amenity, User]
    });
  },

  async findByUser(userId: string) {
    return await Reservation.findAll({
      where: { user_id: userId },
      include: [{ model: Amenity }],
      order: [['start_time', 'DESC']]
    });
  },

  async findByEstate(estateId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.start_time = { [Op.between]: [startDate, endDate] };
    }

    return await Reservation.findAll({
      where: whereClause,
      include: [
        { model: Amenity, where: { estate_id: estateId } },
        { model: User, attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['start_time', 'ASC']]
    });
  },

  async findConflict(amenityId: string, startTime: Date, endTime: Date) {
    return await Reservation.findOne({
      where: {
        amenity_id: amenityId,
        status: { [Op.in]: ['pending', 'confirmed'] },
        [Op.or]: [
          { start_time: { [Op.between]: [startTime, endTime] } },
          { end_time: { [Op.between]: [startTime, endTime] } },
          { [Op.and]: [{ start_time: { [Op.lte]: startTime } }, { end_time: { [Op.gte]: endTime } }] }
        ]
      }
    });
  },

  async findByAmenityAndDate(amenityId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Reservation.findAll({
      where: {
        amenity_id: amenityId,
        status: { [Op.in]: ['pending', 'confirmed'] },
        start_time: { [Op.between]: [startOfDay, endOfDay] }
      },
      order: [['start_time', 'ASC']]
    });
  },

  async findByIdAndUser(id: string, userId: string) {
    return await Reservation.findOne({
      where: { id, user_id: userId }
    });
  },

  async update(id: string, data: any) {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) return null;
    return await reservation.update(data);
  }
};
