const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Source and output paths
const sourcePath = path.join(__dirname, "Q1 26' Landing page updates.csv");
const outputPath = path.join(__dirname, 'Q1-2026-events-formatted.csv');
const skippedPath = path.join(__dirname, 'Q1-2026-events-skipped.csv');

/**
 * Parse date from format "Friday, February 20, 2026" to "2026-02-20"
 */
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '' || dateStr === 'CLOSED') {
    return null;
  }

  const months = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12'
  };

  // Remove day of week if present, e.g., "Friday, February 20, 2026" -> "February 20, 2026"
  const cleanedDate = dateStr.replace(/^[A-Za-z]+,\s*/, '');

  // Match "Month Day, Year"
  const match = cleanedDate.match(/([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/i);
  if (!match) {
    console.warn(`Could not parse date: "${dateStr}"`);
    return null;
  }

  const monthName = match[1].toLowerCase();
  const day = match[2].padStart(2, '0');
  const year = match[3];

  const month = months[monthName];
  if (!month) {
    console.warn(`Unknown month: "${monthName}" in date "${dateStr}"`);
    return null;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Parse time range from various formats:
 * - "3p - 5p" -> { start: "15:00", end: "17:00" }
 * - "3pm - 5pm" -> { start: "15:00", end: "17:00" }
 * - "11am-1pm" -> { start: "11:00", end: "13:00" }
 * - "4:30pm - 6:30pm" -> { start: "16:30", end: "18:30" }
 * - "12 - 2pm" -> { start: "12:00", end: "14:00" }
 * - "5-7pm" -> { start: "17:00", end: "19:00" }
 */
function parseTimeRange(timeStr) {
  if (!timeStr || timeStr.trim() === '') {
    return { start: null, end: null };
  }

  // Clean up the string
  const cleaned = timeStr.toLowerCase().replace(/\s+/g, '');

  // Split on " - " or "-"
  const parts = cleaned.split(/-/);
  if (parts.length !== 2) {
    console.warn(`Could not parse time range: "${timeStr}"`);
    return { start: null, end: null };
  }

  let [startPart, endPart] = parts;

  // Determine if end time has am/pm indicator
  const endHasPM = endPart.includes('p');
  const endHasAM = endPart.includes('a');

  // If start doesn't have am/pm, infer from end time or context
  const startHasPM = startPart.includes('p');
  const startHasAM = startPart.includes('a');

  function parseTime(part, inferPM = false) {
    // Remove am/pm markers
    const cleaned = part.replace(/[ap]m?/gi, '').trim();

    // Check for hour:minute format
    const hasMinutes = cleaned.includes(':');
    let hour, minute = '00';

    if (hasMinutes) {
      const [h, m] = cleaned.split(':');
      hour = parseInt(h, 10);
      minute = m.padStart(2, '0');
    } else {
      hour = parseInt(cleaned, 10);
    }

    // Determine if PM
    const isPM = part.includes('p') || (inferPM && !part.includes('a'));
    const isAM = part.includes('a');

    // Convert to 24-hour format
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (isAM && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  // Parse start time - infer PM from end if not specified
  const inferStartPM = !startHasAM && !startHasPM && endHasPM;
  const startTime = parseTime(startPart, inferStartPM);
  const endTime = parseTime(endPart, false);

  return { start: startTime, end: endTime };
}

/**
 * Pad ZIP codes with leading zeros (especially NJ ZIPs)
 */
function padZip(zip, state) {
  if (!zip || zip.trim() === '' || zip === 'CLOSED') {
    return null;
  }

  const cleanZip = zip.toString().trim();

  // NJ, CT, MA, and some other states have 5-digit ZIPs starting with 0
  // Common states needing padding: NJ (07xxx, 08xxx), CT (06xxx), MA (01xxx, 02xxx)
  const needsPadding = ['NJ', 'CT', 'MA', 'NH', 'VT', 'ME', 'RI', 'PR'];

  if (needsPadding.includes(state) && cleanZip.length === 4) {
    return '0' + cleanZip;
  }

  return cleanZip;
}

/**
 * ZIP code fixes for addresses with missing ZIPs
 */
const ZIP_FIXES = {
  // Unknown city - determined to be New York, NY
  '105 Clinton St': { city: 'New York', state: 'NY', zip: '10002' },

  // San Antonio, TX
  '4881 W Commerce St': { zip: '78237' },
  '7121 W Us Hwy 90': { zip: '78227' },
  '8256 Marbach Rd': { zip: '78227' },
  '1862 S Ww White Rd': { zip: '78220' },
  '323 N New Braunfels Ave': { zip: '78202' },
  '11545 West Ave': { zip: '78213' },
  '2180 Jackson Keller Rd': { zip: '78213' },
  '3227 Sw Military Dr': { zip: '78211' },
  '1139 SE Military Dr': { zip: '78214' },
  '6210 Pecan Valley Dr': { zip: '78223' },

  // Arizona
  '11435 W Buckeye Rd': { zip: '85323' },
  '367 S Arizona Ave': { zip: '85225' },
  '3348 W Van Buren St': { zip: '85009' },
  '1320 W Elliot Rd': { zip: '85284' },
  '6442 W Glendale Ave': { zip: '85301' },
  '8024 N 35th Ave': { zip: '85051' },
  '1810 W Southern Ave': { zip: '85041' },
  '2753 E Broadway Rd': { zip: '85204' },
  '350 E Southern Ave': { zip: '85210' },
  '3549 W Thomas Rd': { zip: '85019' },
  '4264 W Thomas Rd': { zip: '85019' },
  '5045 W Indian School Rd': { zip: '85031' },
  '318 E Brown Rd': { zip: '85201' },
  '1940 W Indian School Rd': { zip: '85015' },
  '323 N Gilbert Rd': { zip: '85203' },
  '1635 E Baseline Rd': { zip: '85042' },
  '2700 W Baseline Rd': { zip: '85283' },
  '610 E Baseline Rd': { zip: '85042' },
  '2816 N 16th St': { zip: '85006' }
};

/**
 * Apply ZIP fixes to a row if needed
 */
function applyZipFix(row) {
  const address = row['Address'];
  const fix = ZIP_FIXES[address];

  if (fix) {
    if (fix.city) row['City'] = fix.city;
    if (fix.state) row['State'] = fix.state;
    if (fix.zip) row['ZIP'] = fix.zip;
    return true;
  }
  return false;
}

/**
 * Fix typos in dates (2021 -> 2026)
 */
function fixDateTypos(row) {
  if (row['Date'] && row['Date'].includes('2021')) {
    row['Date'] = row['Date'].replace('2021', '2026');
    return true;
  }
  return false;
}

/**
 * Check if a row should be skipped
 */
function shouldSkipRow(row) {
  // Skip rows with CLOSED values
  if (Object.values(row).some(v => v === 'CLOSED')) {
    return true;
  }

  // Skip rows missing required fields
  const city = row['City']?.trim();
  const state = row['State']?.trim();
  const zip = row['ZIP']?.trim();

  if (!city || !state || !zip) {
    return true;
  }

  return false;
}

// Main execution
console.log('Reading source CSV...');
const sourceContent = fs.readFileSync(sourcePath, 'utf-8');

console.log('Parsing CSV...');
const records = parse(sourceContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

console.log(`Found ${records.length} rows in source file`);

// Transform records
const transformed = [];
const skippedByReason = {
  'CLOSED': [],
  'Missing ZIP': [],
  'Wrong Year': [],
  'Invalid Date': []
};

for (let i = 0; i < records.length; i++) {
  const row = records[i];
  const rowNum = i + 2; // Account for header and 0-indexing

  // Apply ZIP fixes for known missing addresses
  const wasZipFixed = applyZipFix(row);
  if (wasZipFixed) {
    console.log(`Fixed ZIP row ${rowNum}: ${row['Address']} -> ${row['City']}, ${row['State']} ${row['ZIP']}`);
  }

  // Fix date typos (2021 -> 2026)
  const wasDateFixed = fixDateTypos(row);
  if (wasDateFixed) {
    console.log(`Fixed date row ${rowNum}: ${row['Address']} -> ${row['Date']}`);
  }

  // Helper to create a formatted row
  function formatRow(row) {
    const date = parseDate(row['Date']);
    const { start: startTime, end: endTime } = parseTimeRange(row['Time']);
    const zip = padZip(row['ZIP'], row['State']);
    return {
      start_date: date || row['Date'],
      start_time: startTime || row['Time'],
      end_time: endTime || '',
      event_type: row['District Description'] || 'Tax Time',
      address: row['Address'],
      address2: row['Address 2'] || '',
      city: row['City'] || '',
      state: row['State'] || '',
      zip: zip || ''
    };
  }

  // Check for CLOSED
  if (Object.values(row).some(v => v === 'CLOSED')) {
    console.log(`Skipping row ${rowNum}: ${row['Address']} - CLOSED event`);
    skippedByReason['CLOSED'].push(formatRow(row));
    continue;
  }

  // Check for missing required fields
  const city = row['City']?.trim();
  const state = row['State']?.trim();
  const zip = row['ZIP']?.trim();

  if (!city || !state || !zip) {
    console.log(`Skipping row ${rowNum}: ${row['Address']} - Missing ZIP/city/state`);
    skippedByReason['Missing ZIP'].push(formatRow(row));
    continue;
  }

  const date = parseDate(row['Date']);
  if (!date) {
    console.log(`Skipping row ${rowNum}: ${row['Address']} - Invalid date`);
    skippedByReason['Invalid Date'].push(formatRow(row));
    continue;
  }

  // Check for wrong year
  if (!date.startsWith('2026')) {
    console.log(`Skipping row ${rowNum}: ${row['Address']} - Wrong year (${date.substring(0, 4)})`);
    skippedByReason['Wrong Year'].push(formatRow(row));
    continue;
  }

  const { start: startTime, end: endTime } = parseTimeRange(row['Time']);
  const paddedZip = padZip(row['ZIP'], row['State']);

  transformed.push({
    start_date: date,
    start_time: startTime,
    end_time: endTime,
    event_type: row['District Description'] || 'Tax Time',
    address: row['Address'],
    address2: row['Address 2'] || '',
    city: row['City'],
    state: row['State'],
    zip: paddedZip
  });
}

// Combine all skipped rows
const skipped = [];
for (const [reason, rows] of Object.entries(skippedByReason)) {
  if (rows.length > 0) {
    skipped.push(...rows);
  }
}

console.log(`\nTransformed ${transformed.length} rows (skipped ${skipped.length})`);

// Write output CSV
const outputContent = stringify(transformed, {
  header: true,
  columns: ['start_date', 'start_time', 'end_time', 'event_type', 'address', 'address2', 'city', 'state', 'zip']
});

fs.writeFileSync(outputPath, outputContent);
console.log(`\nOutput written to: ${outputPath}`);

// Write skipped rows CSV - grouped by reason with category headers
const columns = ['start_date', 'start_time', 'end_time', 'event_type', 'address', 'address2', 'city', 'state', 'zip'];
let skippedLines = [columns.join(',')]; // Header row

for (const [reason, rows] of Object.entries(skippedByReason)) {
  if (rows.length > 0) {
    // Add category header as a comment-style row
    skippedLines.push('');
    skippedLines.push(`# ${reason} (${rows.length} rows)`);

    // Add the formatted rows
    const rowsContent = stringify(rows, {
      header: false,
      columns: columns
    }).trim();
    skippedLines.push(rowsContent);
  }
}

fs.writeFileSync(skippedPath, skippedLines.join('\n'));
console.log(`Skipped rows written to: ${skippedPath}`);

// Print skip summary
console.log('\n--- Skip Summary ---');
for (const [reason, rows] of Object.entries(skippedByReason)) {
  if (rows.length > 0) {
    console.log(`${reason}: ${rows.length} rows`);
  }
}

// Print sample output for verification
console.log('\n--- Sample output (first 5 rows) ---');
transformed.slice(0, 5).forEach((row, i) => {
  console.log(`${i + 1}. ${row.start_date} ${row.start_time}-${row.end_time} | ${row.address}, ${row.city}, ${row.state} ${row.zip}`);
});

console.log('\n--- Sample output (last 5 rows) ---');
transformed.slice(-5).forEach((row, i) => {
  console.log(`${transformed.length - 4 + i}. ${row.start_date} ${row.start_time}-${row.end_time} | ${row.address}, ${row.city}, ${row.state} ${row.zip}`);
});
