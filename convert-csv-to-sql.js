const fs = require('fs');
const path = require('path');

function convertCSVToSQL(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  console.log(`Processing ${filePath}: ${lines.length} lines`);
  
  // Skip the first two lines (header rows)
  const dataLines = lines.slice(2);
  const sqlStatements = [];
  
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
          address2: columns.length >= 9 ? columns[5]?.trim() || null : null,
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
          address2: columns.length >= 8 ? columns[4]?.trim() || null : null,
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
          
          // Format date for SQL
          const formattedDate = eventDate.toISOString().split('T')[0];
          
          // Escape single quotes in strings
          const escapeSQL = (str) => str ? str.replace(/'/g, "''") : '';
          
          const sql = `INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('${formattedDate}', '${escapeSQL(event.eventTime)}', '${escapeSQL(event.eventType)}', '${escapeSQL(event.address)}', ${event.address2 ? `'${escapeSQL(event.address2)}'` : 'NULL'}, '${escapeSQL(event.city)}', '${escapeSQL(event.state)}', '${escapeSQL(event.zip)}') ON CONFLICT DO NOTHING;`;
          
          sqlStatements.push(sql);
        } catch (error) {
          console.error(`Error processing event: ${event.address}`, error);
        }
      }
    }
  }
  
  return sqlStatements;
}

// Process all CSV files
const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv'));

console.log(`Found ${files.length} CSV files to convert`);

let allSQL = [];

for (const file of files) {
  const filePath = path.join(dataDir, file);
  console.log(`\nConverting ${file}...`);
  const sqlStatements = convertCSVToSQL(filePath);
  allSQL = allSQL.concat(sqlStatements);
  console.log(`Generated ${sqlStatements.length} SQL statements from ${file}`);
}

// Write all SQL to a file
const outputFile = 'import-data.sql';
fs.writeFileSync(outputFile, allSQL.join('\n'));

console.log(`\n✅ Generated ${allSQL.length} SQL statements in ${outputFile}`);
console.log(`\nTo import the data, run:`);
console.log(`1. railway connect postgres`);
console.log(`2. \\i import-data.sql`);
console.log(`3. \\q`); 