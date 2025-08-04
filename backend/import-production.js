const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection using Railway environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importCSVData(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  console.log(`Processing ${filePath}: ${lines.length} lines`);
  
  // Skip the first two lines (header rows)
  const dataLines = lines.slice(2);
  
  for (const line of dataLines) {
    const columns = line.split(',');
    
    if (columns.length >= 7) {
      // Check if the first column is a date (indicating no index column)
      const firstColumn = columns[0]?.trim();
      const hasIndexColumn = !firstColumn?.includes('-') && !firstColumn?.includes('/');
      
      let event;
      
      if (hasIndexColumn) {
        // Has index column: Event Date is at index 1
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
      
      if (event.eventDate && event.eventDate !== 'Event Date') {
        try {
          // Parse the date
          let eventDate = new Date(event.eventDate);
          
          if (isNaN(eventDate.getTime())) {
            console.log(`⚠ Skipping invalid date: ${event.eventDate}`);
            continue;
          }
          
          // Insert into database
          const query = `
            INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
          ];

          await pool.query(query, values);
          console.log(`✓ Added event: ${event.eventType} in ${event.city}`);
        } catch (error) {
          console.error(`Error processing event: ${event.address}`, error);
        }
      }
    }
  }
}

async function importAllData() {
  try {
    // Read CSV data from environment variable or use sample data
    const csvData = process.env.CSV_DATA || '';
    
    if (!csvData) {
      console.log('No CSV data provided. Please set CSV_DATA environment variable.');
      return;
    }
    
    // Parse CSV data
    const lines = csvData.split('\n').filter(line => line.trim());
    console.log(`Processing ${lines.length} lines of CSV data`);
    
    // Skip headers and process data
    const dataLines = lines.slice(2);
    
    for (const line of dataLines) {
      const columns = line.split(',');
      
      if (columns.length >= 7) {
        const event = {
          eventDate: columns[0]?.trim() || '',
          eventTime: columns[1]?.trim() || '',
          eventType: columns[2]?.trim() || '',
          address: columns[3]?.trim() || '',
          city: columns[4]?.trim() || '',
          state: columns[5]?.trim() || '',
          zip: columns[6]?.trim() || '',
        };
        
        if (event.eventDate && event.eventDate !== 'Event Date') {
          try {
            let eventDate = new Date(event.eventDate);
            
            if (isNaN(eventDate.getTime())) {
              continue;
            }
            
            const query = `
              INSERT INTO events (event_date, event_time, event_type, address, city, state, zip)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT DO NOTHING
            `;
            
            const values = [
              eventDate,
              event.eventTime,
              event.eventType,
              event.address,
              event.city,
              event.state,
              event.zip,
            ];

            await pool.query(query, values);
            console.log(`✓ Added event: ${event.eventType} in ${event.city}`);
          } catch (error) {
            console.error(`Error processing event: ${event.address}`, error);
          }
        }
      }
    }
    
    console.log('✓ All data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the import
importAllData()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 