import axios from 'axios';
import { Event, LocationSearch, EventSearchResult, EventUpdate, AdminLoginResponse, BulkUploadResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const eventService = {
  // Get all events
  getAllEvents: async (userLat?: number, userLon?: number): Promise<Event[]> => {
    const params = new URLSearchParams();
    if (userLat !== undefined) params.append('lat', userLat.toString());
    if (userLon !== undefined) params.append('lon', userLon.toString());
    
    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },

  // Get events by type
  getEventsByType: async (eventType: string, userLat?: number, userLon?: number): Promise<Event[]> => {
    const params = new URLSearchParams();
    if (userLat !== undefined) params.append('lat', userLat.toString());
    if (userLon !== undefined) params.append('lon', userLon.toString());
    
    const response = await api.get(`/events/type/${eventType}?${params.toString()}`);
    return response.data;
  },

  // Search events by location
  searchEventsByLocation: async (searchParams: LocationSearch): Promise<EventSearchResult[]> => {
    const response = await api.post('/events/search', searchParams);
    return response.data;
  },

  // Add new event
  addEvent: async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> => {
    const response = await api.post('/events', event);
    return response.data;
  },

  // Admin login
  adminLogin: async (password: string): Promise<AdminLoginResponse> => {
    const response = await api.post('/events/admin/login', { password });
    return response.data;
  },

  // Update event
  updateEvent: async (id: number, event: EventUpdate): Promise<Event> => {
    const response = await api.put(`/events/${id}`, event);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  // Bulk upload CSV
  bulkUploadEvents: async (csvFile: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    
    const response = await api.post('/events/admin/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 