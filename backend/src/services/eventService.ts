import pool from '../database/connection';
import { Event, LocationSearch, EventSearchResult } from '../types';
import { GeocodingService } from './geocoding';
import { TimezoneService } from './timezoneService';

export class EventService {
  // Get ALL events without date filtering (for admin panel)
  static async getAllEventsAdmin(): Promise<Event[]> {
    const query = `
      SELECT * FROM events
      ORDER BY COALESCE(start_date, event_date) DESC, event_time
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getAllEvents(userLat?: number, userLon?: number): Promise<Event[]> {
    // Get timezone for filtering - use user location if provided, otherwise use UTC
    let timeZoneId = 'UTC';
    if (userLat && userLon) {
      const timezoneResult = await TimezoneService.getTimezone(userLat, userLon);
      timeZoneId = timezoneResult?.timeZoneId || 'UTC';
    }

    // Get current date and time in the user's timezone
    const currentTimeInTimezone = TimezoneService.getCurrentTimeInTimezone(timeZoneId);
    const currentDate = currentTimeInTimezone.toISOString().split('T')[0];
    const currentTime = currentTimeInTimezone.toTimeString().split(' ')[0];
    
    const query = `
      SELECT * FROM events 
      WHERE (
        -- New range-based logic: show events where end_date is in the future
        (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= $1)
        OR
        -- Fallback to single-day logic for legacy rows
        (start_date IS NULL AND end_date IS NULL AND (
          event_date > $1 OR (event_date = $1 AND event_time > $2)
        ))
      )
      ORDER BY COALESCE(start_date, event_date), event_time
    `;
    const result = await pool.query(query, [currentDate, currentTime]);
    
    // Double-check events are in the future using timezone-aware comparison
    const events = result.rows;
    return events.filter((event: any) => {
      if (event.start_date && event.end_date) {
        const todayDate = new Date(`${currentDate}T00:00:00`);
        const end = new Date(event.end_date);
        return todayDate <= end;
      }
      return TimezoneService.isEventInFuture(event.event_date, event.event_time, timeZoneId);
    });
  }

  static async getEventsByType(eventType: string, userLat?: number, userLon?: number): Promise<Event[]> {
    // Get timezone for filtering - use user location if provided, otherwise use UTC
    let timeZoneId = 'UTC';
    if (userLat && userLon) {
      const timezoneResult = await TimezoneService.getTimezone(userLat, userLon);
      timeZoneId = timezoneResult?.timeZoneId || 'UTC';
    }

    // Get current date and time in the user's timezone
    const currentTimeInTimezone = TimezoneService.getCurrentTimeInTimezone(timeZoneId);
    const currentDate = currentTimeInTimezone.toISOString().split('T')[0];
    const currentTime = currentTimeInTimezone.toTimeString().split(' ')[0];
    
    const query = `
      SELECT * FROM events 
      WHERE event_type = $1 
        AND (
          (start_date IS NOT NULL AND end_date IS NOT NULL AND $2 BETWEEN start_date AND end_date)
          OR
          (start_date IS NULL AND end_date IS NULL AND (
            event_date > $2 OR (event_date = $2 AND event_time > $3)
          ))
        )
      ORDER BY COALESCE(start_date, event_date), event_time
    `;
    const result = await pool.query(query, [eventType, currentDate, currentTime]);
    
    // Double-check events are in the future using timezone-aware comparison
    const events = result.rows;
    return events.filter((event: any) => {
      if (event.start_date && event.end_date) {
        const todayDate = new Date(`${currentDate}T00:00:00`);
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);
        return todayDate >= start && todayDate <= end;
      }
      return TimezoneService.isEventInFuture(event.event_date, event.event_time, timeZoneId);
    });
  }

  static async searchEventsByLocation(search: LocationSearch): Promise<EventSearchResult[]> {
    const { address, zip, city, state } = search;
    
    let userLat: number;
    let userLon: number;

    // Geocode the search location
    if (address) {
      console.log(`📍 Geocoding address: "${address}"`);
      const geocodeResult = await GeocodingService.geocodeAddress(address);
      if (!geocodeResult) {
        console.log(`❌ Geocoding failed for address: "${address}"`);
        throw new Error(`Could not find location for address: "${address}". Please try a different address or use a zip code.`);
      }
      userLat = geocodeResult.latitude;
      userLon = geocodeResult.longitude;
      console.log(`✅ Geocoded to: ${userLat}, ${userLon}`);
    } else if (zip) {
      console.log(`📍 Geocoding zip: "${zip}"`);
      const geocodeResult = await GeocodingService.geocodeAddress(zip);
      if (!geocodeResult) {
        console.log(`❌ Geocoding failed for zip: "${zip}"`);
        throw new Error(`Could not find location for zip code: "${zip}". Please check the zip code and try again.`);
      }
      userLat = geocodeResult.latitude;
      userLon = geocodeResult.longitude;
      console.log(`✅ Geocoded to: ${userLat}, ${userLon}`);
    } else if (city && state) {
      console.log(`📍 Geocoding city/state: "${city}, ${state}"`);
      const geocodeResult = await GeocodingService.geocodeAddress(`${city}, ${state}`);
      if (!geocodeResult) {
        console.log(`❌ Geocoding failed for: "${city}, ${state}"`);
        throw new Error(`Could not find location for "${city}, ${state}". Please check the city and state names and try again.`);
      }
      userLat = geocodeResult.latitude;
      userLon = geocodeResult.longitude;
      console.log(`✅ Geocoded to: ${userLat}, ${userLon}`);
    } else {
      throw new Error('Please provide an address, zip code, or city and state');
    }

    // Get the timezone for the user's location
    const timezoneResult = await TimezoneService.getTimezone(userLat, userLon);
    const timeZoneId = timezoneResult?.timeZoneId || 'UTC';

    // Get current date and time in the user's timezone
    const currentTimeInTimezone = TimezoneService.getCurrentTimeInTimezone(timeZoneId);
    const currentDate = currentTimeInTimezone.toISOString().split('T')[0];
    const currentTime = currentTimeInTimezone.toTimeString().split(' ')[0];

    // Get the 6 closest events using Haversine formula, filtered for future events
    const query = `
      SELECT *,
        (3959 * acos(cos(radians($1)) * cos(radians(latitude)) * 
         cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
         sin(radians(latitude)))) AS distance
      FROM events 
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND (
          (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= $3)
          OR
          (start_date IS NULL AND end_date IS NULL AND (
            event_date > $3 OR (event_date = $3 AND event_time > $4)
          ))
        )
      ORDER BY distance, COALESCE(start_date, event_date), event_time
      LIMIT 100
    `;

    console.log(`🔎 Querying database with:`, { 
      userLat, 
      userLon, 
      currentDate, 
      currentTime,
      timeZoneId 
    });
    
    const result = await pool.query(query, [userLat, userLon, currentDate, currentTime]);
    console.log(`📊 Database returned ${result.rows.length} candidate events`);
    
    const candidates = result.rows.filter((event: any) => {
      if (event.start_date && event.end_date) {
        const todayDate = new Date(`${currentDate}T00:00:00`);
        const end = new Date(event.end_date);
        const isValid = todayDate <= end;
        console.log(`📅 Event ${event.id} (${event.event_type}): ends ${event.end_date}, today: ${currentDate}, valid: ${isValid}`);
        return isValid;
      }
      return TimezoneService.isEventInFuture(event.event_date, event.event_time, timeZoneId);
    });

    const topSix = candidates.slice(0, 6);

    const eventSearchResults: EventSearchResult[] = topSix.map((event: any) => ({
      event,
      distance: event.distance,
    }));

    if (topSix.length > 0) {
      const origins = [`${userLat},${userLon}`];
      const destinations = topSix.map((event: any) => `${event.latitude},${event.longitude}`);
      const distanceMatrix = await GeocodingService.getDistanceMatrix(origins, destinations);
      if (distanceMatrix && distanceMatrix.rows[0]?.elements) {
        distanceMatrix.rows[0].elements.forEach((element, index) => {
          if (element.status === 'OK') {
            eventSearchResults[index].driving_distance = element.distance?.value;
            eventSearchResults[index].driving_duration = element.duration?.value;
          }
        });
      }
    }

    return eventSearchResults;
  }

  static async addEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    let latitude = event.latitude;
    let longitude = event.longitude;

    // If coordinates not provided, geocode the address
    if (!latitude || !longitude) {
      const fullAddress = `${event.address}, ${event.city}, ${event.state} ${event.zip}`;
      const geocodeResult = await GeocodingService.geocodeAddress(fullAddress);

      if (!geocodeResult) {
        throw new Error(`Could not geocode address: "${fullAddress}". Please verify the address is correct.`);
      }

      latitude = geocodeResult.latitude;
      longitude = geocodeResult.longitude;
    }

    const query = `
      INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip, latitude, longitude, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      latitude,
      longitude,
      event.start_date,
      event.end_date,
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

  static async testGoogleMapsAPI(): Promise<boolean> {
    try {
      // Test with a simple address that should always work
      const result = await GeocodingService.geocodeAddress('New York, NY');
      return result !== null;
    } catch (error) {
      console.error('Google Maps API test failed:', error);
      return false;
    }
  }

  static async updateEvent(id: number, eventData: Partial<Event>): Promise<Event> {
    // Get current event to check if address changed
    const currentEvent = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (currentEvent.rows.length === 0) {
      throw new Error('Event not found');
    }

    const current = currentEvent.rows[0];
    let latitude = eventData.latitude;
    let longitude = eventData.longitude;

    // If address changed, geocode the new address
    if (eventData.address || eventData.city || eventData.state || eventData.zip) {
      const fullAddress = `${eventData.address || current.address}, ${eventData.city || current.city}, ${eventData.state || current.state} ${eventData.zip || current.zip}`;
      const geocodeResult = await GeocodingService.geocodeAddress(fullAddress);
      if (!geocodeResult) {
        throw new Error(`Could not geocode address: "${fullAddress}". Please verify the address is correct.`);
      }
      latitude = geocodeResult.latitude;
      longitude = geocodeResult.longitude;
    }

    const query = `
      UPDATE events 
      SET event_date = COALESCE($2, event_date),
          event_time = COALESCE($3, event_time),
          event_type = COALESCE($4, event_type),
          address = COALESCE($5, address),
          address2 = COALESCE($6, address2),
          city = COALESCE($7, city),
          state = COALESCE($8, state),
          zip = COALESCE($9, zip),
          latitude = COALESCE($10, latitude),
          longitude = COALESCE($11, longitude),
          start_date = COALESCE($12, start_date),
          end_date = COALESCE($13, end_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      eventData.event_date,
      eventData.event_time,
      eventData.event_type,
      eventData.address,
      eventData.address2,
      eventData.city,
      eventData.state,
      eventData.zip,
      latitude,
      longitude,
      eventData.start_date,
      eventData.end_date,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deleteEvent(id: number): Promise<void> {
    const query = 'DELETE FROM events WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      throw new Error('Event not found');
    }
  }

  static async bulkCreateEvents(events: Omit<Event, 'id' | 'created_at' | 'updated_at'>[]): Promise<Event[]> {
    const createdEvents: Event[] = [];

    for (const event of events) {
      try {
        // Geocode the address
        const fullAddress = `${event.address}, ${event.city}, ${event.state} ${event.zip}`;
        const geocodeResult = await GeocodingService.geocodeAddress(fullAddress);

        const eventWithCoords = {
          ...event,
          latitude: geocodeResult?.latitude || undefined,
          longitude: geocodeResult?.longitude || undefined,
        };

        const createdEvent = await this.addEvent(eventWithCoords);
        createdEvents.push(createdEvent);
      } catch (error) {
        console.error(`Error creating event for ${event.address}:`, error);
        // Continue with other events even if one fails
      }
    }

    return createdEvents;
  }

  static async bulkAddEventsWithValidation(events: Omit<Event, 'id' | 'created_at' | 'updated_at'>[]): Promise<{
    success: boolean;
    events?: Event[];
    errors?: { row: number; address: string; error: string }[];
  }> {
    const errors: { row: number; address: string; error: string }[] = [];
    const geocodedEvents: (Omit<Event, 'id' | 'created_at' | 'updated_at'> & { latitude: number; longitude: number })[] = [];

    // Helper function to validate date format (YYYY-MM-DD)
    const isValidDate = (dateValue: unknown): boolean => {
      if (!dateValue) return false;
      const dateStr = String(dateValue);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return false;
      }
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    };

    // Helper to check if a date value is empty/missing
    const isDateEmpty = (dateValue: unknown): boolean => {
      if (!dateValue) return true;
      const dateStr = String(dateValue).trim();
      return dateStr === '' || dateStr === 'null' || dateStr === 'undefined';
    };

    // Phase 1: Validate ALL events (field validation + geocoding)
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const rowErrors: string[] = [];

      // 1. Required field validation
      if (!event.address?.trim()) rowErrors.push('address is required');
      if (!event.city?.trim()) rowErrors.push('city is required');
      if (!event.state?.trim()) rowErrors.push('state is required');
      if (!event.zip?.trim()) rowErrors.push('zip is required');
      if (!event.event_type?.trim()) rowErrors.push('event_type is required');
      if (!event.event_time?.trim()) rowErrors.push('event_time is required');

      // 2. Date validation
      const hasDateRange = !isDateEmpty(event.start_date) || !isDateEmpty(event.end_date);
      if (!hasDateRange && isDateEmpty(event.event_date)) {
        rowErrors.push('event_date is required (or provide start_date and end_date)');
      }

      if (!isDateEmpty(event.event_date) && !isValidDate(event.event_date)) {
        rowErrors.push('event_date must be a valid date (YYYY-MM-DD)');
      }

      // 3. Date range validation
      if (!isDateEmpty(event.start_date) && isDateEmpty(event.end_date)) {
        rowErrors.push('end_date is required when start_date is provided');
      }
      if (!isDateEmpty(event.end_date) && isDateEmpty(event.start_date)) {
        rowErrors.push('start_date is required when end_date is provided');
      }
      if (!isDateEmpty(event.start_date) && !isDateEmpty(event.end_date)) {
        if (!isValidDate(event.start_date)) {
          rowErrors.push('start_date must be a valid date (YYYY-MM-DD)');
        }
        if (!isValidDate(event.end_date)) {
          rowErrors.push('end_date must be a valid date (YYYY-MM-DD)');
        }
        if (isValidDate(event.start_date) && isValidDate(event.end_date) &&
            new Date(String(event.end_date)) < new Date(String(event.start_date))) {
          rowErrors.push('end_date must be on or after start_date');
        }
      }

      // Build address string for error reporting
      const addressDisplay = `${event.address || '(empty)'}, ${event.city || '(empty)'}, ${event.state || '(empty)'} ${event.zip || '(empty)'}`;

      // If field validation failed, add errors and skip geocoding
      if (rowErrors.length > 0) {
        errors.push({
          row: i + 1,
          address: addressDisplay,
          error: rowErrors.join('; ')
        });
        continue;
      }

      // 4. Geocoding validation
      const fullAddress = `${event.address}, ${event.city}, ${event.state} ${event.zip}`;
      try {
        const geocodeResult = await GeocodingService.geocodeAddress(fullAddress);
        if (!geocodeResult) {
          errors.push({
            row: i + 1,
            address: fullAddress,
            error: 'Address not found - verify address, city, state, and zip are correct'
          });
        } else {
          geocodedEvents.push({
            ...event,
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude
          });
        }
      } catch (err) {
        errors.push({
          row: i + 1,
          address: fullAddress,
          error: `Geocoding failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        });
      }
    }

    // Phase 2: If ANY errors, return them without inserting
    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Phase 3: All validated, insert all events (with error handling)
    try {
      const createdEvents: Event[] = [];
      for (const event of geocodedEvents) {
        const query = `
          INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip, latitude, longitude, start_date, end_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `;

        const values = [
          event.event_date,
          event.event_time,
          event.event_type,
          event.address,
          event.address2 || '',
          event.city,
          event.state,
          event.zip,
          event.latitude,
          event.longitude,
          event.start_date || null,
          event.end_date || null,
        ];

        const result = await pool.query(query, values);
        createdEvents.push(result.rows[0]);
      }

      return { success: true, events: createdEvents };
    } catch (err) {
      return {
        success: false,
        errors: [{
          row: 0,
          address: '',
          error: `Database error: ${err instanceof Error ? err.message : 'Failed to insert events'}`
        }]
      };
    }
  }
} 