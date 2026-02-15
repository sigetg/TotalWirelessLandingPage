const { parse } = require('csv-parse/sync');

export interface CsvEventData {
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

export class CsvParserService {
  /**
   * Parse liberal time formats to PostgreSQL TIME format (HH:MM:SS)
   * Accepts: "3pm", "3p", "3 pm", "3:30pm", "3:30 PM", "15:00", "12am", etc.
   */
  static parseTimeToPostgres(timeStr: string | undefined): string | null {
    if (!timeStr || timeStr.trim() === '') {
      return null;
    }

    const input = timeStr.trim().toLowerCase();

    // Handle 24-hour format (15:00, 15:00:00)
    const match24 = input.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match24) {
      const hour = parseInt(match24[1], 10);
      const minute = parseInt(match24[2], 10);
      const second = match24[3] ? parseInt(match24[3], 10) : 0;
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
      }
    }

    // Handle 12-hour format (3pm, 3p, 3 pm, 3:30pm, 3:30 PM, 12am, etc.)
    const match12 = input.match(/^(\d{1,2})(?::(\d{2}))?\s*(am?|pm?)?$/i);
    if (match12) {
      let hour = parseInt(match12[1], 10);
      const minute = match12[2] ? parseInt(match12[2], 10) : 0;
      const ampm = match12[3]?.toLowerCase();

      // Determine AM/PM
      const isPm = ampm?.startsWith('p');
      const isAm = ampm?.startsWith('a');

      // Convert to 24-hour format
      if (isPm && hour !== 12) {
        hour += 12;
      } else if (isAm && hour === 12) {
        hour = 0;
      }

      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      }
    }

    return null;
  }

  static parseCsvToEvents(csvContent: string): CsvEventData[] {
    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      return records.map((record: any) => ({
        start_date: record.start_date || record.date,
        end_date: record.end_date || '',
        start_time: record.start_time || record.time || '',
        end_time: record.end_time || '',
        event_type: record.event_type || record.type,
        address: record.address,
        address2: record.address2 || '',
        city: record.city,
        state: record.state,
        zip: record.zip,
      }));
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error('Failed to parse CSV file. Please check the format and try again.');
    }
  }

  static validateEventData(event: CsvEventData): string[] {
    const errors: string[] = [];

    if (!event.start_date) errors.push('start_date is required');
    if (!event.event_type) errors.push('event_type is required');
    if (!event.address) errors.push('address is required');
    if (!event.city) errors.push('city is required');
    if (!event.state) errors.push('state is required');
    if (!event.zip) errors.push('zip is required');

    // Validate date format
    if (event.start_date && !this.isValidDate(event.start_date)) {
      errors.push('start_date must be in YYYY-MM-DD format');
    }

    if (event.end_date && event.end_date.trim() !== '' && !this.isValidDate(event.end_date)) {
      errors.push('end_date must be in YYYY-MM-DD format');
    }

    // Validate time formats if provided
    if (event.start_time && event.start_time.trim() !== '') {
      const parsed = this.parseTimeToPostgres(event.start_time);
      if (!parsed) {
        errors.push('start_time format not recognized (try: 3pm, 3:30pm, 15:00)');
      }
    }

    if (event.end_time && event.end_time.trim() !== '') {
      const parsed = this.parseTimeToPostgres(event.end_time);
      if (!parsed) {
        errors.push('end_time format not recognized (try: 3pm, 3:30pm, 15:00)');
      }
    }

    return errors;
  }

  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
  }
}
