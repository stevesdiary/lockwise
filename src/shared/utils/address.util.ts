import { User } from '../../modules/auth/models/user.model';
import { Resident } from '../../modules/estate/models/resident.model';
import { Unit } from '../../modules/estate/models/unit.model';
import { Street } from '../../modules/estate/models/street.model';
import { Estate } from '../../modules/estate/models/estate.model';

export const getResidentFullAddress = async (userId: string): Promise<string> => {
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: Resident,
        as: 'residentProfile',
        include: [
          {
            model: Unit,
            as: 'unit',
            include: [{
              model: Street,
              as: 'street',
              attributes: ['name']
            }]
          },
          {
            model: Estate,
            as: 'estate',
            attributes: ['name', 'city', 'state']
          }
        ]
      }]
    });

    if (!user?.residentProfile) {
      return '';
    }

    const resident = user.residentProfile as any;
    
    // Return stored address if available
    if (resident.address) {
      return resident.address;
    }

    // Fallback to constructed address
    const unit = resident.unit;
    const street = unit?.street;
    const estate = resident.estate;

    // Format: Flat 1, 10, Abraham Adeleye street, Silver Estate, Agungi-Lekki
    const parts = [];
    
    if (unit?.unit_type) parts.push(unit.unit_type.charAt(0).toUpperCase() + unit.unit_type.slice(1));
    if (unit?.unit_identifier) parts.push(unit.unit_identifier);
    if (street?.name) parts.push(street.name);
    if (estate?.name) parts.push(estate.name);
    if (estate?.city) parts.push(estate.city);

    return parts.filter(Boolean).join(', ');
  } catch (error) {
    console.error('Error getting resident address:', error);
    return '';
  }
};

export const formatAccessCodeMessage = (
  guestName: string,
  accessCode: string,
  address: string,
  validFrom: Date,
  validUntil: Date
): string => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return `Hi ${guestName},
Your access code is: ${accessCode}

Location: ${address}
From: ${formatDate(validFrom)}
To: ${formatDate(validUntil)}

To start enjoying Lockwise in your community too, please send email to coresystemglobal@gmail.com

Powered by Core System Global Limited`;
};
