import axios from 'axios';
import { GeocodeResult, GoogleMapsResponse, DistanceMatrixResponse } from '../types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Mock geocoding data for development
const MOCK_GEOCODING_DATA: Record<string, GeocodeResult> = {
  'new york': { latitude: 40.7128, longitude: -74.0060, formatted_address: 'New York, NY, USA' },
  'los angeles': { latitude: 34.0522, longitude: -118.2437, formatted_address: 'Los Angeles, CA, USA' },
  'chicago': { latitude: 41.8781, longitude: -87.6298, formatted_address: 'Chicago, IL, USA' },
  'houston': { latitude: 29.7604, longitude: -95.3698, formatted_address: 'Houston, TX, USA' },
  'miami': { latitude: 25.7617, longitude: -80.1918, formatted_address: 'Miami, FL, USA' },
  'san antonio': { latitude: 29.4241, longitude: -98.4936, formatted_address: 'San Antonio, TX, USA' },
  '10001': { latitude: 40.7505, longitude: -73.9965, formatted_address: 'New York, NY 10001, USA' },
  '90210': { latitude: 34.1030, longitude: -118.4105, formatted_address: 'Beverly Hills, CA 90210, USA' },
  '60601': { latitude: 41.8857, longitude: -87.6228, formatted_address: 'Chicago, IL 60601, USA' },
  '77001': { latitude: 29.7604, longitude: -95.3698, formatted_address: 'Houston, TX 77001, USA' },
  '33101': { latitude: 25.7617, longitude: -80.1918, formatted_address: 'Miami, FL 33101, USA' },
  '78201': { latitude: 29.4241, longitude: -98.4936, formatted_address: 'San Antonio, TX 78201, USA' },
};

export class GeocodingService {
  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is required but not configured. Please set the GOOGLE_MAPS_API_KEY environment variable.');
    }

    try {
      const response = await axios.get<GoogleMapsResponse>(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formatted_address: result.formatted_address,
        };
      }

      if (response.data.status === 'ZERO_RESULTS') {
        return null;
      }

      // Handle specific Google Maps API errors
      switch (response.data.status) {
        case 'OVER_QUERY_LIMIT':
          throw new Error('Google Maps API quota exceeded. Please try again later.');
        case 'REQUEST_DENIED':
          throw new Error('Google Maps API request was denied. Please check your API key and billing settings.');
        case 'INVALID_REQUEST':
          throw new Error('Invalid request to Google Maps API. Please check the address format.');
        default:
          throw new Error(`Google Maps API error: ${response.data.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error('Google Maps API key is invalid or has insufficient permissions. Please check your API key and billing settings.');
        }
        throw new Error(`Network error while accessing Google Maps API: ${error.message}`);
      }
      throw error;
    }
  }

  static async getDistanceMatrix(
    origins: string[],
    destinations: string[]
  ): Promise<DistanceMatrixResponse | null> {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is required but not configured. Please set the GOOGLE_MAPS_API_KEY environment variable.');
    }

    try {
      const response = await axios.get<DistanceMatrixResponse>(
        `https://maps.googleapis.com/maps/api/distancematrix/json`,
        {
          params: {
            origins: origins.join('|'),
            destinations: destinations.join('|'),
            mode: 'driving',
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error('Google Maps API key is invalid or has insufficient permissions for Distance Matrix API.');
        }
        throw new Error(`Network error while accessing Google Maps Distance Matrix API: ${error.message}`);
      }
      console.error('Distance matrix error:', error);
      return null;
    }
  }

  static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
} 