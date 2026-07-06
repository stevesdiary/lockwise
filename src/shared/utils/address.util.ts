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

// Precise GPS coordinates for a resident's unit, when configured. Used to give
// a guest turn-by-turn directions to the exact home (only after gate check-in).
export const getResidentUnitCoordinates = async (
  userId: string
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: Resident,
        as: 'residentProfile',
        include: [{ model: Unit, as: 'unit' }],
      }],
    });

    const unit = (user?.residentProfile as any)?.unit;
    const coords = unit?.unit_details?.coordinates;
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      return { lat: coords.lat, lng: coords.lng };
    }
    return null;
  } catch (error) {
    console.error('Error getting resident unit coordinates:', error);
    return null;
  }
};

// "lat,lng" string when both are valid numbers, else empty string.
export const coordsToString = (coords?: { lat?: number; lng?: number } | null): string => {
  if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
    return `${coords.lat},${coords.lng}`;
  }
  return '';
};

export const buildGoogleMapsSearchUrl = (address: string): string => {
  if (!address?.trim()) {
    return '';
  }

  const encodedAddress = encodeURIComponent(address.trim());
  return `https://maps.google.com/?q=${encodedAddress}`;
};

// Turn-by-turn directions URL. `dest` is either a "lat,lng" pair or a text address.
export const buildGoogleMapsDirectionsUrl = (dest: string): string => {
  if (!dest?.trim()) {
    return '';
  }

  const encodedDest = encodeURIComponent(dest.trim());
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`;
};

export const formatAccessCodeMessage = (
  guestName: string,
  accessCode: string,
  address: string,
  validFrom: Date,
  validUntil: Date,
  mapsUrl?: string
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

  const addressBlock = address?.trim()
    ? `Destination: ${address}\n${mapsUrl ? `Navigate: ${mapsUrl}\n` : ''}`
    : '';

  return `Hi ${guestName},
Your access code is: ${accessCode}

${addressBlock}From: ${formatDate(validFrom)}
To: ${formatDate(validUntil)}

To start enjoying Lockwise in your community too, please send email to coresystemglobal@gmail.com

Powered by Core System Global Limited`;
};
