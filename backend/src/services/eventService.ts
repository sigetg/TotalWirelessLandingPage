import pool from '../database/connection';
import { Event, LocationSearch, EventSearchResult } from '../types';
import { GeocodingService } from './geocoding';

export class EventService {
  static async getAllEvents(): Promise<Event[]> {
    const query = 'SELECT * FROM events ORDER BY event_date, event_time';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getEventsByType(eventType: string): Promise<Event[]> {
    const query = 'SELECT * FROM events WHERE event_type = $1 ORDER BY event_date, event_time';
    const result = await pool.query(query, [eventType]);
    return result.rows;
  }

  static async searchEventsByLocation(search: LocationSearch): Promise<EventSearchResult[]> {
    const { address, zip, city, state } = search;
    
    let userLat: number;
    let userLon: number;

    // Geocode the search location
    if (address) {
      const geocodeResult = await GeocodingService.geocodeAddress(address);
      if (!geocodeResult) {
        throw new Error('Could not geocode the provided address');
      }
      userLat = geocodeResult.latitude;
      userLon = geocodeResult.longitude;
    } else if (zip) {
      const geocodeResult = await GeocodingService.geocodeAddress(zip);
      if (!geocodeResult) {
        throw new Error('Could not geocode the provided zip code');
      }
      userLat = geocodeResult.latitude;
      userLon = geocodeResult.longitude;
    } else if (city && state) {
      const geocodeResult = await GeocodingService.geocodeAddress(`${city}, ${state}`);
      if (!geocodeResult) {
        throw new Error('Could not geocode the provided city and state');
      }
      userLat = geocodeResult.latitude;
      userLon = geocodeResult.longitude;
    } else {
      throw new Error('Please provide an address, zip code, or city and state');
    }

    // Get the 6 closest events using Haversine formula
    const query = `
      SELECT *,
        (3959 * acos(cos(radians($1)) * cos(radians(latitude)) * 
         cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
         sin(radians(latitude)))) AS distance
      FROM events 
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
      ORDER BY distance
      LIMIT 6
    `;

    const result = await pool.query(query, [userLat, userLon]);
    
    // Get driving distances for the closest events
    const events = result.rows;
    const eventSearchResults: EventSearchResult[] = [];

    if (events.length > 0) {
      const origins = [`${userLat},${userLon}`];
      const destinations = events.map(event => `${event.latitude},${event.longitude}`);
      
      const distanceMatrix = await GeocodingService.getDistanceMatrix(origins, destinations);
      
      events.forEach((event, index) => {
        const searchResult: EventSearchResult = {
          event,
          distance: event.distance,
        };

        if (distanceMatrix && distanceMatrix.rows[0]?.elements[index]) {
          const element = distanceMatrix.rows[0].elements[index];
          if (element.status === 'OK') {
            searchResult.driving_distance = element.distance?.value;
            searchResult.driving_duration = element.duration?.value;
          }
        }

        eventSearchResults.push(searchResult);
      });
    }

    return eventSearchResults;
  }

  static async addEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const query = `
      INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      event.event_date,
      event.event_time,
      event.event_type,
      event.address,
      event.address2,
      event.city,
      event.state,
      event.zip,
      event.latitude,
      event.longitude,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateEventGeocoding(): Promise<void> {
    const query = 'SELECT * FROM events WHERE latitude IS NULL OR longitude IS NULL';
    const result = await pool.query(query);
    
    for (const event of result.rows) {
      const fullAddress = `${event.address}, ${event.city}, ${event.state} ${event.zip}`;
      const geocodeResult = await GeocodingService.geocodeAddress(fullAddress);
      
      if (geocodeResult) {
        const updateQuery = 'UPDATE events SET latitude = $1, longitude = $2 WHERE id = $3';
        await pool.query(updateQuery, [geocodeResult.latitude, geocodeResult.longitude, event.id]);
        console.log(`Updated geocoding for event ${event.id}`);
      }
    }
  }
} 