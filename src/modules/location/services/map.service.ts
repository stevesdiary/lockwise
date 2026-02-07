import { Address } from '../models/address.model';
import { Estate } from '../../estate/models/estate.model';
import geocodingService from './geocoding.service';

interface MapLocation {
  address_id: string;
  apartment_number: string;
  latitude: number;
  longitude: number;
  full_address: string;
}

interface EstateMapData {
  estate: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  locations: MapLocation[];
}

class MapService {
  async getEstateMapData(estateId: string): Promise<EstateMapData | null> {
    try {
      const estate = await Estate.findByPk(estateId);
      if (!estate) return null;

      const addresses = await Address.findAll({
        where: { estate_id: estateId },
        attributes: ['address_id', 'apartment_number', 'street', 'building', 'city', 'state', 'country', 'latitude', 'longitude']
      });

      // Geocode estate main address if not already done
      let estateCoords = { latitude: 0, longitude: 0 };
      if (estate.address) {
        const geocoded = await geocodingService.geocodeAddress(estate.address);
        if (geocoded) {
          estateCoords = { latitude: geocoded.latitude, longitude: geocoded.longitude };
        }
      }

      const locations: MapLocation[] = addresses.map(addr => ({
        address_id: addr.address_id,
        apartment_number: addr.apartment_number,
        latitude: addr.latitude || estateCoords.latitude || 0,
        longitude: addr.longitude || estateCoords.longitude || 0,
        full_address: this.buildFullAddress(addr, estate)
      }));

      return {
        estate: {
          name: estate.name,
          address: estate.address,
          latitude: estateCoords.latitude,
          longitude: estateCoords.longitude
        },
        locations
      };
    } catch (error) {
      console.error('Error getting estate map data:', error);
      return null;
    }
  }

  async updateAddressCoordinates(addressId: string): Promise<boolean> {
    try {
      const address = await Address.findByPk(addressId, {
        include: [{ model: Estate, as: 'estate' }]
      });

      if (!address || !address.estate) return false;

      const fullAddress = this.buildFullAddress(address, address.estate);
      const geocoded = await geocodingService.geocodeAddress(fullAddress);

      if (geocoded) {
        await address.update({
          latitude: geocoded.latitude,
          longitude: geocoded.longitude
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating address coordinates:', error);
      return false;
    }
  }

  private buildFullAddress(address: any, estate: Estate): string {
    const parts = [
      address.apartment_number,
      address.building,
      address.street,
      estate.address,
      estate.city,
      estate.state,
      estate.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  generateDirectionsUrl(fromLat: number, fromLng: number, toLat: number, toLng: number): string {
    return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
  }

  generateStaticMapUrl(latitude: number, longitude: number, zoom: number = 15): string {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=400x300&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
  }
}

export default new MapService();