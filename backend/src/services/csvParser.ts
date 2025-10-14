const { parse } = require('csv-parse/sync');
import { Event } from '../types';

export interface CsvEventData {
  event_date: string;
  event_time: string;
  event_type: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  start_date?: string;
  end_date?: string;
}

export class CsvParserService {
  static parseCsvToEvents(csvContent: string): CsvEventData[] {
    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      return records.map((record: any) => ({
        event_date: record.event_date || record.date,
        event_time: record.event_time || record.time,
        event_type: record.event_type || record.type,
        address: record.address,
        address2: record.address2 || '',
        city: record.city,
        state: record.state,
        zip: record.zip,
        start_date: record.start_date || '',
        end_date: record.end_date || '',
      }));
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error('Failed to parse CSV file. Please check the format and try again.');
    }
  }

  static validateEventData(event: CsvEventData): string[] {
    const errors: string[] = [];

    if (!event.event_date) errors.push('event_date is required');
    if (!event.event_time) errors.push('event_time is required');
    if (!event.event_type) errors.push('event_type is required');
    if (!event.address) errors.push('address is required');
    if (!event.city) errors.push('city is required');
    if (!event.state) errors.push('state is required');
    if (!event.zip) errors.push('zip is required');

    // Validate date format
    if (event.event_date && !this.isValidDate(event.event_date)) {
      errors.push('event_date must be in YYYY-MM-DD format');
    }

    // Validate time format
    if (event.event_time && !this.isValidTime(event.event_time)) {
      errors.push('event_time must be in HH:MM format');
    }

    return errors;
  }

  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
  }

  private static isValidTime(timeString: string): boolean {
    return timeString.match(/^\d{2}:\d{2}$/) !== null;
  }
}
