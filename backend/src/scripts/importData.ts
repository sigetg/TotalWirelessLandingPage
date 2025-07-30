import fs from 'fs';
import path from 'path';
import pool from '../database/connection';
import { GeocodingService } from '../services/geocoding';

interface CSVEvent {
  eventDate: string;
  eventTime: string;
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
  
  // Skip the first two lines (header rows)
  const dataLines = lines.slice(2);
  console.log(`Data lines (after skipping headers): ${dataLines.length}`);
  
  const events: CSVEvent[] = [];

  for (const line of dataLines) {
    const columns = line.split(',');
    console.log(`Columns in line: ${columns.length}`);
    console.log(`Line content: ${line}`);
    
    if (columns.length >= 7) {
      // Check if the first column is a date (indicating no index column)
      const firstColumn = columns[0]?.trim();
      const hasIndexColumn = !firstColumn?.includes('-') && !firstColumn?.includes('/');
      
      let event: CSVEvent;
      
      if (hasIndexColumn) {
        // Has index column: Event Date is at index 1
        // Format: Index, Event Date, Event Time, Event Type, Address, Address 2, City, State, Zip
        event = {
          eventDate: columns[1]?.trim() || '',
          eventTime: columns[2]?.trim() || '',
          eventType: columns[3]?.trim() || '',
          address: columns[4]?.trim() || '',
          address2: columns.length >= 9 ? columns[5]?.trim() || undefined : undefined,
          city: columns.length >= 9 ? columns[6]?.trim() || '' : columns[5]?.trim() || '',
          state: columns.length >= 9 ? columns[7]?.trim() || '' : columns[6]?.trim() || '',
          zip: columns.length >= 9 ? columns[8]?.trim() || '' : columns[7]?.trim() || '',
        };
      } else {
        // No index column: Event Date is at index 0
        // Format: Event Date, Event Time, Event Type, Address, Address 2, City, State, Zip
        event = {
          eventDate: columns[0]?.trim() || '',
          eventTime: columns[1]?.trim() || '',
          eventType: columns[2]?.trim() || '',
          address: columns[3]?.trim() || '',
          address2: columns.length >= 8 ? columns[4]?.trim() || undefined : undefined,
          city: columns.length >= 8 ? columns[5]?.trim() || '' : columns[4]?.trim() || '',
          state: columns.length >= 8 ? columns[6]?.trim() || '' : columns[5]?.trim() || '',
          zip: columns.length >= 8 ? columns[7]?.trim() || '' : columns[6]?.trim() || '',
        };
      }
      
      console.log(`Parsed event:`, event);
      
      if (event.eventDate && event.eventDate !== 'Event Date') {
        events.push(event);
        console.log(`✓ Added event with date: ${event.eventDate}`);
      } else {
        console.log(`⚠ Skipping event - invalid date: ${event.eventDate}`);
      }
    } else {
      console.log(`⚠ Skipping line - not enough columns: ${columns.length}`);
    }
  }

  console.log(`Processing ${events.length} events from ${filePath}`);
  
  for (const event of events) {
    try {
      console.log(`Processing event with date: "${event.eventDate}" and time: "${event.eventTime}"`);
      
      // Parse the date - handle the format "2025-08-01 00:00:00"
      let eventDate: Date;
      if (event.eventDate.includes(' ')) {
        // Format: "2025-08-01 00:00:00"
        eventDate = new Date(event.eventDate);
      } else {
        // Try to parse as just date
        eventDate = new Date(event.eventDate);
      }
      
      // Validate the date
      if (isNaN(eventDate.getTime())) {
        console.log(`⚠ Skipping invalid date: ${event.eventDate}`);
        continue;
      }
      
      console.log(`✓ Parsed date: ${eventDate.toISOString()}`);
      
      // Geocode the address
      const fullAddress = `${event.address}, ${event.city}, ${event.state} ${event.zip}`;
      const geocodeResult = await GeocodingService.geocodeAddress(fullAddress);
      
      // Insert into database
      const query = `
        INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `;
      
      const values = [
        eventDate,
        event.eventTime,
        event.eventType,
        event.address,
        event.address2,
        event.city,
        event.state,
        event.zip,
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