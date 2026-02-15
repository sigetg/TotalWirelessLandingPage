export interface Event {
  id: number;
  start_date: string;
  end_date?: string;
  start_time?: string;  // TIME as "HH:MM:SS" or null for "All Day"
  end_time?: string;    // TIME as "HH:MM:SS" or null
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
}

export interface EventUpdate {
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  event_type?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  events: Event[];
  error?: string;
  details?: string[];
}

export interface BulkAddError {
  row: number;
  address: string;
  error: string;
}

export interface BulkAddResult {
  success: boolean;
  events?: Event[];
  errors?: BulkAddError[];
}

export interface EventFormData {
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  event_type: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
}
