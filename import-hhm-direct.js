const { Pool } = require('pg');

// Railway database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// HHM Events NYC data embedded directly
const hhmEventsData = `,,,,,,
,,,,,,
,Date,Time,Address,City,State,Zip Code
1,October 3,12pm - 2pm,1275 Saint Nicholas,New York,NY,10033
1,October 3,4pm - 6pm,3341 Broadway,New York,NY,10031
1,October 3,4pm- 6pm,331 Kearny Ave,Kearny,NJ,7032
1,October 3,12pm- 2pm,6815 Bergenline Ave,Guttenberg,NJ,7093
1,October 4,12pm - 2pm,2143 White Plains Rd,Bronx,NY,10462
1,October 4,4pm - 6pm,1605 Westchester,Bronx,NY,10472
1,October 4,4pm - 6pm ,379 Knickerbocker,Brooklyn,NY,11237
1,October 4,12pm -  2pm,64 Graham Ave,Brooklyn,NY,11206
1,October 10,4pm- 6pm,175 Passaic Ave,Passaic,NJ,7055
1,October 10,12pm- 2pm,136 Main St,Paterson,NJ,7505
1,October 10,4pm- 6pm,3539 Junction Blvd,Corona,NY,11368
1,October 10,12pm- 2pm,1830 College Point Blvd,College Point,NY,11356
1,October 11,12pm - 2pm,15 w Burnside ave,Bronx,NY,10453
1,October 11,4pm - 6pm,200 Dyckman Street,New York,NY,10040
1,October 11,4pm - 6pm,8012 Roosevelt Ave,Jackson Heights,NY,11372
1,October 11,12pm- 2pm,5022 5th Ave,Brooklyn,NY,11220
,,,,,,
,,,,,,
16,,,,,,`;

async function importHHMEvents() {
  console.log('📁 Processing HHM Events NYC data...');
  
  const lines = hhmEventsData.split('\n').filter(line => line.trim());
  
  // Skip the first 3 lines (empty rows and header)
  const dataLines = lines.slice(3);
  
  let importedCount = 0;
  
  for (const line of dataLines) {
    const columns = line.split(',');
    
    if (columns.length >= 7) {
      const event = {
        eventDate: columns[1]?.trim() || '',
        eventTime: columns[2]?.trim() || '',
        eventType: 'HHM Event',
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

          const result = await pool.query(query, values);
          if (result.rowCount > 0) {
            console.log(`✓ Added HHM event: ${event.eventType} in ${event.city} on ${event.eventDate}`);
            importedCount++;
          } else {
            console.log(`⚠ Event already exists: ${event.address} on ${event.eventDate}`);
          }
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
