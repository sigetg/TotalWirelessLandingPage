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

  static isEventInFuture(eventDate: string | Date, eventTime: string, timeZoneId: string): boolean {
    try {
      // Handle different date formats - could be Date object or string
      const dateStr = eventDate instanceof Date ? eventDate.toISOString().split('T')[0] : eventDate;
      
      // Parse event time format (e.g., "3pm - 5pm", "4-6pm", "5p-7p")
      // Extract the start time and convert to 24-hour format
      const startTime = this.parseEventTime(eventTime);
      if (!startTime) {
        console.warn(`Could not parse event time: ${eventTime}, defaulting to show event`);
        return true; // Default to showing the event if we can't parse time
      }
      
      // Create event datetime
      const eventDateTime = new Date(`${dateStr}T${startTime}:00`);
      
      // Get current time in the event's timezone
      const currentTimeInTimezone = this.getCurrentTimeInTimezone(timeZoneId);
      
      // Compare the event time with current time
      return eventDateTime > currentTimeInTimezone;
    } catch (error) {
      console.error('Error checking if event is in future:', error);
      return true; // Default to showing the event if we can't determine
    }
  }

  static parseEventTime(eventTime: string): string | null {
    try {
      // Handle formats like "3pm - 5pm", "4-6pm", "5p-7p", "12-2pm"
      const timeStr = eventTime.toLowerCase().trim();
      
      // Extract the start time (before the dash or "to")
      const startMatch = timeStr.match(/^(\d{1,2})(:\d{2})?\s*(am|pm|a|p)?/);
      if (!startMatch) {
        return null;
      }
      
      let hour = parseInt(startMatch[1]);
      const minutes = startMatch[2] ? parseInt(startMatch[2].substring(1)) : 0;
      const ampm = startMatch[3];
      
      // If no am/pm specified, look for it elsewhere in the string
      let isPm = false;
      if (ampm) {
        isPm = ampm.includes('p');
      } else {
        // Look for pm/p anywhere in the string for cases like "4-6pm"
        isPm = timeStr.includes('pm') || timeStr.includes('p');
      }
      
      // Convert to 24-hour format
      if (isPm && hour !== 12) {
        hour += 12;
      } else if (!isPm && hour === 12) {
        hour = 0;
      }
      
      // Format as HH:MM
      return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error parsing event time:', eventTime, error);
      return null;
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