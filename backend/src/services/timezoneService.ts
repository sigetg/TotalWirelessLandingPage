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

  /**
   * Check if an event is in the future based on its dates and optional times.
   * Uses the new schema: start_date (required), end_date (optional), start_time/end_time (optional)
   */
  static isEventInFuture(
    startDate: string | Date,
    endDate: string | Date | null | undefined,
    startTime: string | null | undefined,
    timeZoneId: string
  ): boolean {
    try {
      // Get current time in the specified timezone
      const now = this.getCurrentTimeInTimezone(timeZoneId);
      const todayStr = now.toISOString().split('T')[0];
      const today = new Date(`${todayStr}T00:00:00`);

      // Parse end_date if available, otherwise use start_date
      const effectiveEndDate = endDate || startDate;
      const endDateStr = effectiveEndDate instanceof Date
        ? effectiveEndDate.toISOString().split('T')[0]
        : String(effectiveEndDate);
      const eventEndDate = new Date(`${endDateStr}T00:00:00`);

      // If end_date is in the future, event is active
      if (eventEndDate > today) {
        return true;
      }

      // If end_date is today, check if there's a start_time
      if (eventEndDate.getTime() === today.getTime()) {
        // If no start_time, it's an all-day event - show it for the whole day
        if (!startTime) {
          return true;
        }

        // If there's a start_time, compare with current time
        const currentTimeStr = now.toTimeString().split(' ')[0]; // "HH:MM:SS"
        return startTime > currentTimeStr;
      }

      // Event end date is in the past
      return false;
    } catch (error) {
      console.error('Error checking if event is in future:', error);
      return true; // Default to showing the event if we can't determine
    }
  }

  /**
   * Parse time string to 24-hour format (HH:MM)
   * Handles formats like "3pm", "3:30pm", "15:00", etc.
   */
  static parseTimeString(timeStr: string): string | null {
    try {
      const input = timeStr.toLowerCase().trim();

      // Handle 24-hour format (15:00, 15:00:00)
      const match24 = input.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (match24) {
        const hour = parseInt(match24[1], 10);
        const minute = parseInt(match24[2], 10);
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
      }

      // Handle 12-hour format
      const match12 = input.match(/^(\d{1,2})(?::(\d{2}))?\s*(am?|pm?)?$/i);
      if (match12) {
        let hour = parseInt(match12[1], 10);
        const minute = match12[2] ? parseInt(match12[2], 10) : 0;
        const ampm = match12[3]?.toLowerCase();

        const isPm = ampm?.startsWith('p');
        const isAm = ampm?.startsWith('a');

        if (isPm && hour !== 12) {
          hour += 12;
        } else if (isAm && hour === 12) {
          hour = 0;
        }

        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing time string:', timeStr, error);
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
