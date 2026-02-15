const https = require('https');
const fs = require('fs');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// QR Code Landing Page Events
const events = [
  { date: '24-Oct', time: '4-6pm', address: '4916 Church Avenue', city: 'Brooklyn', state: 'NY', zip: '11203', eventType: 'Halloween Event' },
  { date: '24-Oct', time: '4-6pm', address: '379 Knickerbocker Ave', city: 'Brooklyn', state: 'NY', zip: '11237', eventType: 'Halloween Event' },
  { date: '25-Oct', time: '1-3pm', address: '2513 Broadway', city: 'Astoria', state: 'NY', zip: '11106', eventType: 'Halloween Event' },
  { date: '25-Oct', time: '4-6pm', address: '55-17 Myrtle Ave', city: 'Ridgewood', state: 'NY', zip: '11385', eventType: 'Halloween Event' },
  { date: '31-Oct', time: '5-7pm', address: '542 W 181 St', city: 'New York', state: 'NY', zip: '10033', eventType: 'Halloween Event' },
  { date: '31-Oct', time: '5-7pm', address: '199 Ave A', city: 'New York', state: 'NY', zip: '10009', eventType: 'Halloween Event' },
  { date: '31-Oct', time: '5-7pm', address: '1020 Longwood Ave', city: 'Bronx', state: 'NY', zip: '10459', eventType: 'Halloween Event' },
  { date: '31-Oct', time: '5-7pm', address: '2395 Westchester Ave', city: 'Bronx', state: 'NY', zip: '10461', eventType: 'Halloween Event' },
  { date: '24-Oct', time: '5p-7p', address: '200 S Neltnor Blvd', city: 'West Chicago', state: 'IL', zip: '60185', eventType: 'Halloween Event' },
  { date: '25-Oct', time: '12p-2p', address: '2317 S Cicero Ave', city: 'Cicero', state: 'IL', zip: '60804', eventType: 'Halloween Event' },
  { date: '25-Oct', time: '4p-6p', address: '5858 S Kedzie Ave', city: 'Chicago', state: 'IL', zip: '60629', eventType: 'Halloween Event' },
  { date: '31-Oct', time: '5p-7p', address: '3217 W 47th Pl', city: 'Chicago', state: 'IL', zip: '60632', eventType: 'Halloween Event' },
  { date: '25-Oct', time: '3p-7p', address: 'Doral Downtown', city: 'Miami', state: 'FL', zip: '33166', eventType: 'Halloween Event' },
  { date: '1-Nov', time: '3p-7p', address: 'Doral Downtown', city: 'Miami', state: 'FL', zip: '33166', eventType: 'Dia de Los Muertos' },
  { date: '14-Nov', time: '4pm - 7pm', address: '3341 Broadway', city: 'New York', state: 'NY', zip: '10031', eventType: 'UFC Meet & Greet - Daniel Cormier' },
  { date: '15-Nov', time: '2pm - 4:30pm', address: '1656 Broadway', city: 'New York', state: 'NY', zip: '10019', eventType: 'UFC Meet & Greet' },
  { date: '18-Nov', time: '5pm - 7pm', address: '501 W 125th St', city: 'New York', state: 'NY', zip: '10027', eventType: 'Holiday Lights - Hot Cocoa' },
  { date: '18-Nov', time: '5pm - 7pm', address: '28 E 125th St', city: 'New York', state: 'NY', zip: '10035', eventType: 'Holiday Lights - Hot Cocoa' }
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

function parseDate(dateStr) {
  // Parse date in format "24-Oct" or "1-Nov"
  const [day, monthAbbr] = dateStr.split('-');
  const monthMap = {
    'Oct': '10',
    'Nov': '11'
  };
  const month = monthMap[monthAbbr];
  const year = '2025';
  
  return `${year}-${month}-${day.padStart(2, '0')}`;
}

function normalizeTime(timeStr) {
  // Normalize time formats: "4-6pm", "5p-7p", "4pm - 7pm", "2pm - 4:30pm"
  return timeStr.replace(/p/g, 'pm').replace(/\s+/g, ' ').trim();
}

async function generateSQL() {
  console.log('🚀 Generating QR Code events SQL with geocoding...\n');
  
  const sqlStatements = [];
  
  sqlStatements.push("-- Insert QR Code Landing Page events with geocoding");
  
  for (const event of events) {
    const dateStr = parseDate(event.date);
    const time = normalizeTime(event.time);
    
    // Geocode the address
    const geocode = await geocodeAddress(event.address, event.city, event.state, event.zip);
    
    if (!geocode) {
      console.log(`⚠ Skipping ${event.address} (no geocode)\n`);
      continue;
    }
    
    // Escape single quotes in event type
    const escapedEventType = event.eventType.replace(/'/g, "''");
    
    const sql = `INSERT INTO events (start_date, end_date, event_date, event_time, event_type, address, city, state, zip, latitude, longitude) VALUES ('${dateStr}', '${dateStr}', '${dateStr}', '${time}', '${escapedEventType}', '${event.address}', '${event.city}', '${event.state}', '${event.zip}', ${geocode.latitude}, ${geocode.longitude});`;
    
    sqlStatements.push(sql);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const fullSQL = sqlStatements.join('\n');
  
  // Write to file
  fs.writeFileSync('qr-events-complete.sql', fullSQL);
  
  console.log('\n✅ SQL file generated: qr-events-complete.sql');
  console.log(`\n📊 Total events processed: ${sqlStatements.length - 1}`);
  console.log('\nYou can now run this SQL file using:');
  console.log('  railway connect Postgres < qr-events-complete.sql');
}

generateSQL().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

