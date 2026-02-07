import { Amenity } from '../../amenities/models/amenity.model';

export const amenityRepository = {
  async create(data: any) {
    return await Amenity.create(data);
  },

  async findById(id: string) {
    return await Amenity.findByPk(id);
  },

  async findByEstate(estateId: string) {
    return await Amenity.findAll({
      where: { estate_id: estateId },
      order: [['name', 'ASC']]
    });
  },

  async update(id: string, data: any) {
    const amenity = await Amenity.findByPk(id);
    if (!amenity) return null;
    return await amenity.update(data);
  },

  async delete(id: string) {
    const amenity = await Amenity.findByPk(id);
    if (!amenity) return false;
    await amenity.destroy();
    return true;
  }
};
