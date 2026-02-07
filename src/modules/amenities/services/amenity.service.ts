import { amenityRepository } from '../../amenities/repositories/amenity.repository';

export const amenityService = {
  async createAmenity(estateId: string, data: { name: string; description?: string; type: string; capacity?: number; hourly_rate?: number; operating_hours?: object; rules?: string }) {
    return await amenityRepository.create({
      estate_id: estateId,
      ...data
    });
  },

  async getEstateAmenities(estateId: string) {
    return await amenityRepository.findByEstate(estateId);
  },

  async updateAmenity(amenityId: string, data: Partial<{ name: string; description: string; capacity: number; hourly_rate: number; status: string; operating_hours: object; rules: string }>) {
    const amenity = await amenityRepository.update(amenityId, data);
    if (!amenity) throw new Error('Amenity not found');
    return amenity;
  },

  async deleteAmenity(amenityId: string) {
    const deleted = await amenityRepository.delete(amenityId);
    if (!deleted) throw new Error('Amenity not found');
  }
};
