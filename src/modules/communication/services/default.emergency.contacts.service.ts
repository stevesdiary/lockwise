import sequelize from '../../../shared/core/database';
import { EmergencyContact } from "../models/emergency.model";

class DefaultEmergencyContactsService {
  private defaultContacts = [
    {
      name: "Fire Department",
      type: "fire",
      phone: "199",
      email: "fire@emergency.gov",
    },
    {
      name: "Police",
      type: "police",
      phone: "199",
      email: "police@emergency.gov",
    },
    {
      name: "Ambulance",
      type: "ambulance",
      phone: "199",
      email: "ambulance@emergency.gov",
    },
    {
      name: "General Hospital",
      type: "hospital",
      phone: "+234-1-234-5678",
      email: "info@generalhospital.com",
    },
    {
      name: "Estate Security",
      type: "security",
      phone: "+234-800-SECURITY",
      email: "security@estate.com",
    },
    {
      name: "Maintenance Team",
      type: "maintenance",
      phone: "+234-800-MAINTAIN",
      email: "maintenance@estate.com",
    },
  ];

  async createDefaultContacts(estateId: string) {
    const existingContacts = await EmergencyContact.count({
      where: { estate_id: estateId },
    });

    if (existingContacts === 0) {
      const contacts = this.defaultContacts.map((contact) => ({
        ...contact,
        estate_id: estateId,
      }));

      await EmergencyContact.bulkCreate(contacts);
      return contacts.length;
    }

    return 0;
  }

  async updateDefaultContacts(estateId: string, customContacts: any[]) {
    const contacts = customContacts.map((contact) => ({
      ...contact,
      estate_id: estateId,
    }));

    // Atomically replace all contacts — if bulkCreate fails, destroy is rolled back
    await sequelize.transaction(async (t) => {
      await EmergencyContact.destroy({ where: { estate_id: estateId }, transaction: t });
      await EmergencyContact.bulkCreate(contacts, { transaction: t });
    });

    return contacts.length;
  }
}

export default new DefaultEmergencyContactsService();
