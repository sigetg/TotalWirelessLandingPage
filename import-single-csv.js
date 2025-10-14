const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Railway database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importHHMEvents() {
  const filePath = 'HHM Events NYC.csv';
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ HHM Events NYC.csv file not found');
    process.exit(1);
  }

  console.log(`📁 Processing ${filePath}...`);
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  // Skip the first 3 lines (empty rows and header)
  const dataLines = lines.slice(3);
  
  let importedCount = 0;
  
  for (const line of dataLines) {
    const columns = line.split(',');
    
    if (columns.length >= 7) {
      const event = {
        eventDate: columns[1]?.trim() || '',
        eventTime: columns[2]?.trim() || '',
        eventType: 'HHM Event', // Default event type
        address: columns[3]?.trim() || '',
        city: columns[4]?.trim() || '',
        state: columns[5]?.trim() || '',
        zip: columns[6]?.trim() || '',
      };
      
      if (event.eventDate && event.eventDate !== 'Date' && event.address) {
        try {
          // Parse the date (October 3, October 4, etc.)
          const currentYear = new Date().getFullYear();
          const eventDate = new Date(`${event.eventDate}, ${currentYear}`);
          
          if (isNaN(eventDate.getTime())) {
            console.log(`⚠ Skipping invalid date: ${event.eventDate}`);
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
          console.log(`✓ Added HHM event: ${event.eventType} in ${event.city} on ${event.eventDate}`);
          importedCount++;
        } catch (error) {
          console.error(`Error processing event: ${event.address}`, error);
        }
      }
    }
  }
  
  console.log(`✅ Successfully imported ${importedCount} HHM events!`);
}

// Run the import
importHHMEvents()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
