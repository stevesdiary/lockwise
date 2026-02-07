export interface MapLocation {
  address_id: string;
  apartment_number: string;
  latitude: number;
  longitude: number;
  full_address: string;
}

export interface EstateMapData {
  estate: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  locations: MapLocation[];
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export interface DirectionsRequest {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
}