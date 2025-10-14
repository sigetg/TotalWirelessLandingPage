const https = require('https');
const fs = require('fs');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// Miami HHM Events
const miamiEvents = [
  { date: '10/3/2025', time: '2-6PM', address: '1313 W 49th Street', city: 'Hialeah', state: 'FL', zip: '33012' },
  { date: '10/4/2025', time: '2-6PM', address: '6337 Stirling Road', city: 'Davie', state: 'FL', zip: '33314' },
  { date: '10/4/2025', time: '2-6PM', address: '12192 NW 7th Ave', city: 'North Miami', state: 'FL', zip: '33168' },
  { date: '10/10/2025', time: '2-6PM', address: '3670 Davie Boulevard', city: 'Fort Lauderdale', state: 'FL', zip: '33312' },
  { date: '10/10/2025', time: '2-6PM', address: '133 NE 54th Street', city: 'Miami', state: 'FL', zip: '33137' },
  { date: '10/11/2025', time: '2-6PM', address: '549 E Sample Road', city: 'Pompano beach', state: 'FL', zip: '33064' },
  { date: '10/11/2025', time: '2-6PM', address: '3853 W Hillsboro Boulevard', city: 'Deerfield Beach', state: 'FL', zip: '33442' }
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
  console.log('🚀 Generating Miami HHM events SQL with geocoding...\n');
  
  const sqlStatements = [];
  
  sqlStatements.push("-- Insert Miami HHM events with geocoding");
  
  for (const event of miamiEvents) {
    // Parse date from M/D/YYYY format
    const [month, day, year] = event.date.split('/');
    const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Geocode the address
    const geocode = await geocodeAddress(event.address, event.city, event.state, event.zip);
    
    if (!geocode) {
      console.log(`⚠ Skipping ${event.address} (no geocode)\n`);
      continue;
    }
    
    const sql = `INSERT INTO events (start_date, end_date, event_date, event_time, event_type, address, city, state, zip, latitude, longitude) VALUES ('${dateStr}', '${dateStr}', '${dateStr}', '${event.time}', 'HHM Special Event', '${event.address}', '${event.city}', '${event.state}', '${event.zip}', ${geocode.latitude}, ${geocode.longitude});`;
    
    sqlStatements.push(sql);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const fullSQL = sqlStatements.join('\n');
  
  // Write to file
  fs.writeFileSync('miami-events-complete.sql', fullSQL);
  
  console.log('\n✅ SQL file generated: miami-events-complete.sql');
  console.log('\nYou can now run this SQL file using:');
  console.log('  railway connect Postgres < miami-events-complete.sql');
}

generateSQL().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
