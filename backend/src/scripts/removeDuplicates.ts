import pool from '../database/connection';

interface DuplicateGroup {
  event_date: string;
  event_time: string;
  event_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  count: number;
  ids: number[];
}

async function findDuplicates(): Promise<DuplicateGroup[]> {
  const query = `
    SELECT 
      event_date,
      event_time,
      event_type,
      address,
      city,
      state,
      zip,
      COUNT(*) as count,
      array_agg(id ORDER BY created_at) as ids
    FROM events 
    GROUP BY event_date, event_time, event_type, address, city, state, zip
    HAVING COUNT(*) > 1
    ORDER BY count DESC, event_date, event_time
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function removeDuplicates(): Promise<void> {
  console.log('🔍 Starting duplicate detection...');
  
  try {
    // Find all duplicate groups
    const duplicates = await findDuplicates();
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found in the database.');
      return;
    }

    console.log(`📊 Found ${duplicates.length} groups of duplicates:`);
    
    let totalDuplicates = 0;
    let totalRemoved = 0;

    // Process each group of duplicates
    for (const group of duplicates) {
      totalDuplicates += group.count;
      const idsToKeep = group.ids[0]; // Keep the oldest record (first in array)
      const idsToRemove = group.ids.slice(1); // Remove all others
      
      console.log(`\n📍 Group: ${group.event_type} on ${group.event_date} at ${group.event_time}`);
      console.log(`   Location: ${group.address}, ${group.city}, ${group.state} ${group.zip}`);
      console.log(`   Found ${group.count} duplicates`);
      console.log(`   Keeping ID: ${idsToKeep}`);
      console.log(`   Removing IDs: ${idsToRemove.join(', ')}`);

      // Delete the duplicate records
      const deleteQuery = `
        DELETE FROM events 
        WHERE id = ANY($1)
      `;
      
      const deleteResult = await pool.query(deleteQuery, [idsToRemove]);
      totalRemoved += deleteResult.rowCount || 0;
      
      console.log(`   ✅ Removed ${deleteResult.rowCount} duplicate(s)`);
    }

    console.log(`\n🎉 Summary:`);
    console.log(`   Total duplicate groups: ${duplicates.length}`);
    console.log(`   Total duplicate records: ${totalDuplicates}`);
    console.log(`   Total records removed: ${totalRemoved}`);
    console.log(`   Records kept: ${totalDuplicates - totalRemoved}`);

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    throw error;
  }
}

async function showDuplicateStats(): Promise<void> {
  console.log('📈 Duplicate Statistics:');
  
  const duplicates = await findDuplicates();
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found.');
    return;
  }

  console.log(`\nFound ${duplicates.length} groups of duplicates:`);
  
  duplicates.forEach((group, index) => {
    console.log(`\n${index + 1}. ${group.event_type} on ${group.event_date} at ${group.event_time}`);
    console.log(`   Location: ${group.address}, ${group.city}, ${group.state} ${group.zip}`);
    console.log(`   Count: ${group.count} duplicates`);
  });

  const totalDuplicates = duplicates.reduce((sum, group) => sum + group.count, 0);
  const totalToRemove = totalDuplicates - duplicates.length; // Keep one from each group
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total duplicate groups: ${duplicates.length}`);
  console.log(`   Total duplicate records: ${totalDuplicates}`);
  console.log(`   Records that would be removed: ${totalToRemove}`);
  console.log(`   Records that would be kept: ${duplicates.length}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'stats':
        await showDuplicateStats();
        break;
      case 'remove':
        await removeDuplicates();
        break;
      default:
        console.log('Usage:');
        console.log('  npm run remove-duplicates:stats  - Show duplicate statistics');
        console.log('  npm run remove-duplicates:remove - Remove duplicate entries');
        break;
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

export { findDuplicates, removeDuplicates, showDuplicateStats }; 