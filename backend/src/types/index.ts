export interface Event {
  id: number;
  event_date: Date;
  event_time: string;
  event_type: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
  updated_at: Date;
}

export interface LocationSearch {
  address?: string;
  zip?: string;
  city?: string;
  state?: string;
  radius?: number;
}

export interface EventSearchResult {
  event: Event;
  distance: number;
  driving_distance?: number;
  driving_duration?: number;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export interface GoogleMapsResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
  status: string;
}

export interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance?: {
        text: string;
        value: number;
      };
      duration?: {
        text: string;
        value: number;
      };
      status: string;
    }>;
  }>;
  status: string;
} 