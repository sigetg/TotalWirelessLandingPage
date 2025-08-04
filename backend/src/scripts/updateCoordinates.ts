import pool from '../database/connection';
import { GeocodingService } from '../services/geocoding';

async function updateEventCoordinates(): Promise<void> {
  try {
    // Get all events that don't have coordinates
    const query = 'SELECT * FROM events WHERE latitude IS NULL OR longitude IS NULL';
    const result = await pool.query(query);
    
    console.log(`Found ${result.rows.length} events without coordinates`);
    
    for (const event of result.rows) {
      try {
        console.log(`Geocoding event ${event.id}: ${event.address}, ${event.city}, ${event.state} ${event.zip}`);
        
        // Create full address for geocoding
        const fullAddress = `${event.address}, ${event.city}, ${event.state} ${event.zip}`;
        
        // Geocode the address
        const geocodeResult = await GeocodingService.geocodeAddress(fullAddress);
        
        if (geocodeResult) {
          // Update the event with coordinates
          const updateQuery = 'UPDATE events SET latitude = $1, longitude = $2 WHERE id = $3';
          await pool.query(updateQuery, [geocodeResult.latitude, geocodeResult.longitude, event.id]);
          
          console.log(`✅ Updated event ${event.id} with coordinates: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
        } else {
          console.log(`⚠ Could not geocode event ${event.id}: ${fullAddress}`);
        }
        
        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
      }
    }
    
    console.log('✅ Coordinate update completed!');
  } catch (error) {
    console.error('Error updating coordinates:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the coordinate update if this script is executed directly
if (require.main === module) {
  updateEventCoordinates()
    .then(() => {
      console.log('Coordinate update completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Coordinate update failed:', error);
      process.exit(1);
    });
} 