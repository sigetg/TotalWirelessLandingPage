const fs = require('fs');
const https = require('https');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error('ERROR: GOOGLE_MAPS_API_KEY environment variable is required');
  process.exit(1);
}

function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'OK' && json.results[0]) {
            const location = json.results[0].geometry.location;
            resolve({ lat: location.lat, lng: location.lng });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

async function main() {
  console.log('Reading SSI CSV file...');
  const csvContent = fs.readFileSync('LANDING PAGE SSI.csv', 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  console.log(`Processing ${dataLines.length} SSI locations...`);
  
  let sqlStatements = [];
  sqlStatements.push('-- SSI Exclusive Savings Events');
  sqlStatements.push('-- Generated: ' + new Date().toISOString());
  sqlStatements.push('');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line.trim()) continue;
    
    const parts = parseCSVLine(line);
    if (parts.length < 6) continue;
    
    const eventType = parts[0] || 'Exclusive Savings - SSI';
    const name = parts[1] || 'Total Wireless';
    const address = parts[2] || '';
    const city = parts[3] || '';
    const stateZip = parts[4] || '';
    const zip = parts[5] || '';
    
    // Parse state from stateZip (format: "City, State")
    let state = '';
    if (stateZip.includes(',')) {
      const stateParts = stateZip.split(',');
      state = stateParts[stateParts.length - 1].trim();
    }
    
    if (!address || !city) {
      console.log(`⚠️  Skipping row ${i + 2}: missing address or city`);
      failCount++;
      continue;
    }
    
    const fullAddress = `${address}, ${city}, ${state} ${zip}`.trim();
    console.log(`\n[${i + 1}/${dataLines.length}] Geocoding: ${fullAddress}`);
    
    await sleep(100); // Rate limiting
    const coords = await geocodeAddress(fullAddress);
    
    if (coords) {
      console.log(`✅ Found: ${coords.lat}, ${coords.lng}`);
      
      const sql = `INSERT INTO events (
  event_type, address, city, state, zip,
  start_date, end_date, event_date, event_time,
  latitude, longitude
) VALUES (
  'Exclusive Savings - SSI',
  '${address.replace(/'/g, "''")}',
  '${city.replace(/'/g, "''")}',
  '${state.replace(/'/g, "''")}',
  '${zip.replace(/'/g, "''")}',
  '2026-01-15'::DATE,
  '2026-02-15'::DATE,
  '2026-01-15'::DATE,
  '10a-6p',
  ${coords.lat},
  ${coords.lng}
);`;
      
      sqlStatements.push(sql);
      successCount++;
    } else {
      console.log(`❌ Geocoding failed`);
      failCount++;
    }
  }
  
  console.log(`\n✅ Successfully geocoded: ${successCount}`);
  console.log(`❌ Failed to geocode: ${failCount}`);
  
  const outputFile = 'ssi-events-complete.sql';
  fs.writeFileSync(outputFile, sqlStatements.join('\n'));
  console.log(`\n📝 SQL file generated: ${outputFile}`);
  console.log(`\nTo upload to Railway, run:`);
  console.log(`railway connect Postgres < ${outputFile}`);
}

main().catch(console.error);
