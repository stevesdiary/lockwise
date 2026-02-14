import axios from 'axios';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

interface GoogleGeocodeResponse {
  status: string;
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
}

class GeocodingService {
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          address,
          key: this.apiKey
        }
      });

      const data = response.data as GoogleGeocodeResponse;
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formatted_address: result.formatted_address
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.apiKey
        }
      });

      const data = response.data as GoogleGeocodeResponse;
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

export default new GeocodingService();