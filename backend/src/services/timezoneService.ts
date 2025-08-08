import axios from 'axios';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export interface TimezoneResult {
  timeZoneId: string;
  timeZoneName: string;
  rawOffset: number;
  dstOffset: number;
}

export class TimezoneService {
  private static readonly API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  static async getTimezone(latitude: number, longitude: number): Promise<TimezoneResult | null> {
    if (!this.API_KEY) {
      console.warn('Google Maps API key not found, using UTC as fallback');
      return null;
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${this.API_KEY}`;
      
      const response = await axios.get(url);
      const data = response.data;

      if (data.status === 'OK') {
        return {
          timeZoneId: data.timeZoneId,
          timeZoneName: data.timeZoneName,
          rawOffset: data.rawOffset,
          dstOffset: data.dstOffset,
        };
      } else {
        console.warn(`Timezone API error: ${data.status}`, data.errorMessage);
        return null;
      }
    } catch (error) {
      console.error('Error fetching timezone:', error);
      return null;
    }
  }

  static getCurrentTimeInTimezone(timeZoneId: string): Date {
    const now = new Date();
    return toZonedTime(now, timeZoneId);
  }

  static isEventInFuture(eventDate: string, eventTime: string, timeZoneId: string): boolean {
    try {
      // Parse the event date and time
      const eventDateTime = new Date(`${eventDate}T${eventTime}`);
      
      // Get current time in the event's timezone
      const currentTimeInTimezone = this.getCurrentTimeInTimezone(timeZoneId);
      
      // Compare the event time with current time
      return eventDateTime > currentTimeInTimezone;
    } catch (error) {
      console.error('Error checking if event is in future:', error);
      return true; // Default to showing the event if we can't determine
    }
  }

  static formatEventDateTime(eventDate: string, eventTime: string, timeZoneId: string): string {
    try {
      const eventDateTime = new Date(`${eventDate}T${eventTime}`);
      return formatInTimeZone(eventDateTime, timeZoneId, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error formatting event date time:', error);
      return `${eventDate} ${eventTime}`;
    }
  }
} 