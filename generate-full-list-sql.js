const https = require('https');
const fs = require('fs');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// Parse the CSV file
const csvContent = fs.readFileSync('data/full_list_qr_code_FORMATTED.csv', 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Skip header row
const dataLines = lines.slice(1);

const events = [];

for (const line of dataLines) {
  const columns = line.split(',');
  
  if (columns.length >= 10) {
    const event = {
      event_date: columns[0]?.trim(),
      start_date: columns[1]?.trim(),
      end_date: columns[2]?.trim(),
      event_time: columns[3]?.trim(),
      event_type: columns[4]?.trim(),
      address: columns[5]?.trim(),
      address2: columns[6]?.trim(),
      city: columns[7]?.trim(),
      state: columns[8]?.trim(),
      zip: columns[9]?.trim()
    };
    
    if (event.event_date && event.address && event.city) {
      events.push(event);
    }
  }
}

console.log(`📊 Parsed ${events.length} events from CSV`);

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
  console.log('🚀 Generating Full List SQL with geocoding...\n');
  
  const sqlStatements = [];
  
  // First, delete all existing events
  sqlStatements.push("-- DELETE ALL EXISTING EVENTS");
  sqlStatements.push("DELETE FROM events;");
  sqlStatements.push("");
  sqlStatements.push("-- Insert new events with geocoding");
  
  let processed = 0;
  let skipped = 0;
  
  for (const event of events) {
    // Geocode the address
    const geocode = await geocodeAddress(event.address, event.city, event.state, event.zip);
    
    if (!geocode) {
      console.log(`⚠ Skipping ${event.address} (no geocode)\n`);
      skipped++;
      continue;
    }
    
    // Escape single quotes in event type and address
    const escapedEventType = event.event_type.replace(/'/g, "''");
    const escapedAddress = event.address.replace(/'/g, "''");
    const escapedCity = event.city.replace(/'/g, "''");
    
    const sql = `INSERT INTO events (start_date, end_date, event_date, event_time, event_type, address, city, state, zip, latitude, longitude) VALUES ('${event.start_date}'::DATE, '${event.end_date}'::DATE, '${event.event_date}'::DATE, '${event.event_time}', '${escapedEventType}', '${escapedAddress}', '${escapedCity}', '${event.state}', '${event.zip}', ${geocode.latitude}, ${geocode.longitude});`;
    
    sqlStatements.push(sql);
    processed++;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const fullSQL = sqlStatements.join('\n');
  
  // Write to file
  fs.writeFileSync('full-list-complete.sql', fullSQL);
  
  console.log(`\n✅ SQL file generated: full-list-complete.sql`);
  console.log(`📊 Total events processed: ${processed}`);
  console.log(`⚠ Events skipped (no geocode): ${skipped}`);
  console.log('\n⚠️  WARNING: This will DELETE ALL existing events and replace with new data!');
  console.log('\nYou can now run this SQL file using:');
  console.log('  railway connect Postgres < full-list-complete.sql');
}

generateSQL().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
