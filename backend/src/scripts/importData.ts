import fs from 'fs';
import path from 'path';
import pool from '../database/connection';
import { GeocodingService } from '../services/geocoding';

interface CSVEvent {
  startDate?: string;
  endDate?: string;
  eventDate?: string; // legacy
  eventTime?: string; // legacy
  eventType: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
}

async function importCSVData(filePath: string): Promise<void> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  console.log(`Total lines in file: ${lines.length}`);
  console.log(`First few lines:`);
  lines.slice(0, 5).forEach((line, index) => {
    console.log(`Line ${index}: ${line}`);
  });
  
  // SSI CSV has multiple header/section rows. We'll skip lines that don't look like data.
  const dataLines = lines.slice(0);
  console.log(`Data lines (after skipping headers): ${dataLines.length}`);
  
  const events: CSVEvent[] = [];

  for (const line of dataLines) {
    const columns = line.split(',');
    console.log(`Columns in line: ${columns.length}`);
    console.log(`Line content: ${line}`);
    
    // SSI format columns (per sample):
    // col0: section/flag (ignore), col1: TSP ID, col2: Agent Store ID,
    // col3: Location Status, col4: Address 1, col5: State, col6: CMA (ignore),
    // col7: Start Date, col8: End Date, col9: Ticket Allocation (ignore), col10: Event Type

    if (columns.length >= 11) {
      const locationStatus = columns[3]?.trim();
      const address1 = columns[4]?.trim();
      const state = columns[5]?.trim();
      const startDate = columns[7]?.trim();
      const endDate = columns[8]?.trim();
      const eventType = columns[10]?.trim();

      // Skip non-data sections and closed rows
      if (!address1 || !state || (locationStatus && !locationStatus.toLowerCase().startsWith('open'))) {
        continue;
      }

      const event: CSVEvent = {
        startDate,
        endDate,
        eventType,
        address: address1,
        city: '',
        state,
        zip: '',
      };

      events.push(event);
    }
  }

  console.log(`Processing ${events.length} events from ${filePath}`);
  
  for (const event of events) {
    try {
      console.log(`Processing event with range: "${event.startDate}" to "${event.endDate}"`);

      // Parse start/end dates (support M/D/YYYY or M/D/YY)
      const normalizeDate = (d?: string) => {
        if (!d) return undefined;
        const trimmed = d.replace(/\s+/g, '');
        const parts = trimmed.includes('-') ? trimmed.split('-') : trimmed.split('/');
        if (parts.length === 3) {
          let [m, day, y] = parts;
          if (y.length === 2) y = `20${y}`;
          if (m.length === 4) { // already YYYY-MM-DD
            return new Date(trimmed);
          }
          const mm = m.padStart(2, '0');
          const dd = day.padStart(2, '0');
          return new Date(`${y}-${mm}-${dd}`);
        }
        const asDate = new Date(d);
        return isNaN(asDate.getTime()) ? undefined : asDate;
      };

      const startDate = normalizeDate(event.startDate);
      const endDate = normalizeDate(event.endDate);
      if (!startDate || !endDate) {
        console.log(`⚠ Skipping invalid range: ${event.startDate} - ${event.endDate}`);
        continue;
      }
      
      // Geocode the address
      const fullAddress = `${event.address}, ${event.state}`;
      const geocodeResult = await GeocodingService.geocodeAddress(fullAddress);
      const city = event.city || geocodeResult?.city || '';
      const zip = event.zip || geocodeResult?.zip || '';
      
      // Insert into database
      const query = `
        INSERT INTO events (start_date, end_date, event_date, event_time, event_type, address, address2, city, state, zip, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT DO NOTHING
      `;
      
      const values = [
        startDate,
        endDate,
        startDate, // keep legacy event_date for compatibility (start of range)
        '10am - 6pm',
        event.eventType,
        event.address,
        event.address2,
        city,
        event.state,
        zip,
        geocodeResult?.latitude || null,
        geocodeResult?.longitude || null,
      ];

      await pool.query(query, values);
      
      if (geocodeResult) {
        console.log(`✓ Geocoded: ${fullAddress}`);
      } else {
        console.log(`⚠ Could not geocode: ${fullAddress}`);
      }
    } catch (error) {
      console.error(`Error processing event: ${event.address}`, error);
    }
  }
  
  console.log(`✓ Completed importing ${events.length} events from ${filePath}`);
}

async function importAllData(): Promise<void> {
  try {
    const dataDir = path.join(__dirname, '../../../data');
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv'));
    
    console.log(`Found ${files.length} CSV files to import`);
    
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      console.log(`\nImporting ${file}...`);
      await importCSVData(filePath);
    }
    
    console.log('\n✓ All data imported successfully!');
  } catch (error) {
    console.error('Error importing all data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importAllData()
    .then(() => {
      console.log('Import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
} 