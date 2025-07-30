export interface Event {
  id: number;
  event_date: string;
  event_time: string;
  event_type: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
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

export interface SearchFormData {
  address?: string;
  zip?: string;
  city?: string;
  state?: string;
  radius: number;
} 