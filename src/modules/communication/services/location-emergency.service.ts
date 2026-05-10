import { Op } from 'sequelize';
import {
  LocationEmergencyContact,
  EmergencyContactCategory,
  Country,
  State,
  City,
} from '../models/location-emergency.model';

export interface LocationContactGroup {
  category: { id: string; name: string; icon: string | null; priority: number };
  contacts: Array<{
    id: string;
    name: string;
    phone_number: string;
    alt_phone_number: string | null;
    description: string | null;
    scope: 'city' | 'state' | 'country';
    priority: number;
  }>;
}

class LocationEmergencyService {
  async getContactsForLocation(params: {
    countryId: string;
    stateId?: string | null;
    cityId?: string | null;
  }): Promise<LocationContactGroup[]> {
    const { countryId, stateId, cityId } = params;

    const whereConditions: any[] = [
      { country_id: countryId, state_id: null, city_id: null, is_active: true },
    ];
    if (stateId) {
      whereConditions.push({ country_id: countryId, state_id: stateId, city_id: null, is_active: true });
    }
    if (cityId && stateId) {
      whereConditions.push({ country_id: countryId, state_id: stateId, city_id: cityId, is_active: true });
    }

    const contacts = await LocationEmergencyContact.findAll({
      where: { [Op.or]: whereConditions },
      include: [{ model: EmergencyContactCategory, attributes: ['id', 'name', 'icon', 'priority'] }],
      order: [
        [{ model: EmergencyContactCategory, as: 'category' }, 'priority', 'ASC'],
        ['priority', 'ASC'],
      ],
    });

    const grouped = new Map<string, LocationContactGroup>();

    for (const c of contacts) {
      const cat = c.category as EmergencyContactCategory;
      if (!grouped.has(cat.id)) {
        grouped.set(cat.id, { category: { id: cat.id, name: cat.name, icon: cat.icon, priority: cat.priority }, contacts: [] });
      }
      const scope: 'city' | 'state' | 'country' = c.city_id ? 'city' : c.state_id ? 'state' : 'country';
      grouped.get(cat.id)!.contacts.push({
        id: c.id,
        name: c.name,
        phone_number: c.phone_number,
        alt_phone_number: c.alt_phone_number,
        description: c.description,
        scope,
        priority: c.priority,
      });
    }

    return Array.from(grouped.values());
  }

  async getCountries() {
    return Country.findAll({ order: [['name', 'ASC']] });
  }

  async getCountryByCode(isoCode: string) {
    return Country.findOne({ where: { iso_code: isoCode } });
  }

  async getStates(countryId: string) {
    return State.findAll({ where: { country_id: countryId }, order: [['name', 'ASC']] });
  }

  async getCities(stateId: string) {
    return City.findAll({ where: { state_id: stateId }, order: [['name', 'ASC']] });
  }

  async getCategories() {
    return EmergencyContactCategory.findAll({ order: [['priority', 'ASC']] });
  }

  async createContact(data: {
    category_id: string;
    name: string;
    phone_number: string;
    alt_phone_number?: string;
    country_id: string;
    state_id?: string;
    city_id?: string;
    description?: string;
    priority?: number;
  }) {
    return LocationEmergencyContact.create(data as any);
  }

  async updateContact(id: string, data: Partial<{
    name: string;
    phone_number: string;
    alt_phone_number: string;
    description: string;
    is_active: boolean;
    priority: number;
  }>) {
    const [count] = await LocationEmergencyContact.update(data, { where: { id } });
    return count > 0;
  }

  async deleteContact(id: string) {
    return LocationEmergencyContact.destroy({ where: { id } });
  }

  async getAllContacts(filters: { countryId?: string; stateId?: string; categoryId?: string } = {}) {
    const where: any = {};
    if (filters.countryId) where.country_id = filters.countryId;
    if (filters.stateId) where.state_id = filters.stateId;
    if (filters.categoryId) where.category_id = filters.categoryId;

    return LocationEmergencyContact.findAll({
      where,
      include: [
        { model: EmergencyContactCategory, attributes: ['id', 'name', 'icon'] },
        { model: Country, attributes: ['id', 'name', 'iso_code'] },
        { model: State, attributes: ['id', 'name', 'code'] },
        { model: City, attributes: ['id', 'name'] },
      ],
      order: [['priority', 'ASC'], ['name', 'ASC']],
    });
  }
}

export default new LocationEmergencyService();
