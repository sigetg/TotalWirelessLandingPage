const https = require('https');
const fs = require('fs');

// You'll need to set your Google Maps API key here
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// HHM Events
const hhmEvents = [
  { date: 'October 3', time: '12pm - 2pm', address: '1275 Saint Nicholas', city: 'New York', state: 'NY', zip: '10033' },
  { date: 'October 3', time: '4pm - 6pm', address: '3341 Broadway', city: 'New York', state: 'NY', zip: '10031' },
  { date: 'October 3', time: '4pm- 6pm', address: '331 Kearny Ave', city: 'Kearny', state: 'NJ', zip: '7032' },
  { date: 'October 3', time: '12pm- 2pm', address: '6815 Bergenline Ave', city: 'Guttenberg', state: 'NJ', zip: '7093' },
  { date: 'October 4', time: '12pm - 2pm', address: '2143 White Plains Rd', city: 'Bronx', state: 'NY', zip: '10462' },
  { date: 'October 4', time: '4pm - 6pm', address: '1605 Westchester', city: 'Bronx', state: 'NY', zip: '10472' },
  { date: 'October 4', time: '4pm - 6pm', address: '379 Knickerbocker', city: 'Brooklyn', state: 'NY', zip: '11237' },
  { date: 'October 4', time: '12pm - 2pm', address: '64 Graham Ave', city: 'Brooklyn', state: 'NY', zip: '11206' },
  { date: 'October 10', time: '4pm- 6pm', address: '175 Passaic Ave', city: 'Passaic', state: 'NJ', zip: '7055' },
  { date: 'October 10', time: '12pm- 2pm', address: '136 Main St', city: 'Paterson', state: 'NJ', zip: '7505' },
  { date: 'October 10', time: '4pm- 6pm', address: '3539 Junction Blvd', city: 'Corona', state: 'NY', zip: '11368' },
  { date: 'October 10', time: '12pm- 2pm', address: '1830 College Point Blvd', city: 'College Point', state: 'NY', zip: '11356' },
  { date: 'October 11', time: '12pm - 2pm', address: '15 w Burnside ave', city: 'Bronx', state: 'NY', zip: '10453' },
  { date: 'October 11', time: '4pm - 6pm', address: '200 Dyckman Street', city: 'New York', state: 'NY', zip: '10040' },
  { date: 'October 11', time: '4pm - 6pm', address: '8012 Roosevelt Ave', city: 'Jackson Heights', state: 'NY', zip: '11372' },
  { date: 'October 11', time: '12pm- 2pm', address: '5022 5th Ave', city: 'Brooklyn', state: 'NY', zip: '11220' }
];

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function geocodeAddress(address, city, state, zip) {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('⚠ No Google Maps API key set');
    return null;
  }

  try {
    const fullAddress = `${address}, ${city}, ${state} ${zip}`;
    console.log(`Geocoding: ${fullAddress}`);
    
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const data = await httpsGet(url);

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const coords = {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      };
      console.log(`  ✓ Found: ${coords.latitude}, ${coords.longitude}`);
      return coords;
    } else {
      console.warn(`  ⚠ Geocoding failed: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`  ✗ Error:`, error.message);
    return null;
  }
}

async function generateSQL() {
  console.log('🚀 Generating HHM events SQL with geocoding...\n');
  
  const currentYear = new Date().getFullYear();
  const sqlStatements = [];
  
  // First, add a DELETE statement to remove incomplete HHM events
  sqlStatements.push("-- Delete existing incomplete HHM events");
  sqlStatements.push("DELETE FROM events WHERE event_type = 'HHM Event';\n");
  
  sqlStatements.push("-- Insert complete HHM events with geocoding");
  
  for (const event of hhmEvents) {
    const eventDate = new Date(`${event.date}, ${currentYear}`);
    const dateStr = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Geocode the address
    const geocode = await geocodeAddress(event.address, event.city, event.state, event.zip);
    
    if (!geocode) {
      console.log(`⚠ Skipping ${event.address} (no geocode)\n`);
      continue;
    }
    
    const sql = `INSERT INTO events (start_date, end_date, event_date, event_time, event_type, address, city, state, zip, latitude, longitude) VALUES ('${dateStr}', '${dateStr}', '${dateStr}', '${event.time}', 'HHM Event', '${event.address}', '${event.city}', '${event.state}', '${event.zip}', ${geocode.latitude}, ${geocode.longitude});`;
    
    sqlStatements.push(sql);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const fullSQL = sqlStatements.join('\n');
  
  // Write to file
  fs.writeFileSync('hhm-events-complete.sql', fullSQL);
  
  console.log('\n✅ SQL file generated: hhm-events-complete.sql');
  console.log('\nYou can now run this SQL file using:');
  console.log('  railway connect Postgres');
  console.log('  Then paste the contents of hhm-events-complete.sql');
  console.log('\nOr use psql directly if postgresql-client is installed:');
  console.log('  railway connect Postgres < hhm-events-complete.sql');
}

generateSQL().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});