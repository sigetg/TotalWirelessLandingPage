const { EventService } = require('./src/services/eventService');

async function testTimezoneFiltering() {
  console.log('Testing timezone-aware event filtering...\n');

  // Test 1: Get all events with UTC timezone (no user location)
  console.log('Test 1: Getting all events with UTC timezone');
  try {
    const eventsUTC = await EventService.getAllEvents();
    console.log(`Found ${eventsUTC.length} events with UTC timezone`);
  } catch (error) {
    console.error('Error getting events with UTC:', error);
  }

  // Test 2: Get all events with user timezone (New York coordinates)
  console.log('\nTest 2: Getting all events with New York timezone (40.7128, -74.0060)');
  try {
    const eventsNYC = await EventService.getAllEvents(40.7128, -74.0060);
    console.log(`Found ${eventsNYC.length} events with NYC timezone`);
  } catch (error) {
    console.error('Error getting events with NYC timezone:', error);
  }

  // Test 3: Get all events with user timezone (Los Angeles coordinates)
  console.log('\nTest 3: Getting all events with Los Angeles timezone (34.0522, -118.2437)');
  try {
    const eventsLA = await EventService.getAllEvents(34.0522, -118.2437);
    console.log(`Found ${eventsLA.length} events with LA timezone`);
  } catch (error) {
    console.error('Error getting events with LA timezone:', error);
  }

  // Test 4: Get events by type with timezone
  console.log('\nTest 4: Getting events by type with NYC timezone');
  try {
    const eventsByType = await EventService.getEventsByType('event', 40.7128, -74.0060);
    console.log(`Found ${eventsByType.length} events of type 'event' with NYC timezone`);
  } catch (error) {
    console.error('Error getting events by type with timezone:', error);
  }

  console.log('\nTimezone filtering test completed!');
}

// Run the test
testTimezoneFiltering().catch(console.error); 