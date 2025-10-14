import { Router, Request, Response } from 'express';
import multer from 'multer';
import { EventService } from '../services/eventService';
import { CsvParserService, CsvEventData } from '../services/csvParser';
import { LocationSearch } from '../types';

const upload = multer({ storage: multer.memoryStorage() });

// Extend Request type to include file
interface MulterRequest extends Request {
  file?: any;
}

const router = Router();

// Get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    // Extract optional user location from query parameters
    const userLat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const userLon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    
    const events = await EventService.getAllEvents(userLat, userLon);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get events by type
router.get('/type/:eventType', async (req: Request, res: Response) => {
  try {
    const { eventType } = req.params;
    
    // Extract optional user location from query parameters
    const userLat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const userLon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    
    const events = await EventService.getEventsByType(eventType, userLat, userLon);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by type:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Search events by location
router.post('/search', async (req: Request, res: Response) => {
  try {
    const searchParams: LocationSearch = req.body;
    console.log('🔍 Search request received:', JSON.stringify(searchParams, null, 2));
    
    const events = await EventService.searchEventsByLocation(searchParams);
    console.log(`✅ Found ${events.length} events`);
    console.log('📍 Events:', events.map(e => ({ 
      type: e.event.event_type, 
      address: e.event.address, 
      city: e.event.city,
      distance: e.distance 
    })));
    
    res.json(events);
  } catch (error) {
    console.error('❌ Error searching events:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to search events' });
  }
});

// Add new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const event = await EventService.addEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Failed to add event' });
  }
});

// Update event geocoding
router.post('/update-geocoding', async (req: Request, res: Response) => {
  try {
    await EventService.updateEventGeocoding();
    res.json({ message: 'Geocoding update completed' });
  } catch (error) {
    console.error('Error updating geocoding:', error);
    res.status(500).json({ error: 'Failed to update geocoding' });
  }
});

// Admin login
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return res.status(500).json({ error: 'Admin password not configured' });
    }
    
    if (password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await EventService.updateEvent(parseInt(id), req.body);
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await EventService.deleteEvent(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Bulk upload CSV
router.post('/admin/bulk-upload', upload.single('csvFile'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const csvEvents = CsvParserService.parseCsvToEvents(csvContent);
    
    // Validate all events
    const validationErrors: string[] = [];
    csvEvents.forEach((event, index) => {
      const errors = CsvParserService.validateEventData(event);
      if (errors.length > 0) {
        validationErrors.push(`Row ${index + 1}: ${errors.join(', ')}`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation errors found', 
        details: validationErrors 
      });
    }

    // Convert CsvEventData to Event format
    const eventsToCreate = csvEvents.map((csvEvent: CsvEventData) => ({
      event_date: new Date(csvEvent.event_date),
      event_time: csvEvent.event_time,
      event_type: csvEvent.event_type,
      address: csvEvent.address,
      address2: csvEvent.address2 || '',
      city: csvEvent.city,
      state: csvEvent.state,
      zip: csvEvent.zip,
      start_date: csvEvent.start_date ? new Date(csvEvent.start_date) : undefined,
      end_date: csvEvent.end_date ? new Date(csvEvent.end_date) : undefined,
    }));

    const events = await EventService.bulkCreateEvents(eventsToCreate);
    res.status(201).json({ 
      success: true, 
      message: `Successfully created ${events.length} events`,
      events 
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ error: 'Failed to upload events' });
  }
});

// Test geocoding endpoint
router.post('/test-geocoding', async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const { GeocodingService } = await import('../services/geocoding');
    const result = await GeocodingService.geocodeAddress(address);
    
    if (result) {
      res.json({
        success: true,
        address: result.formatted_address,
        coordinates: {
          latitude: result.latitude,
          longitude: result.longitude
        },
        city: result.city,
        zip: result.zip
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Could not geocode the address'
      });
    }
  } catch (error) {
    console.error('Geocoding test error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Geocoding failed'
    });
  }
});

// Health check for Google Maps API configuration
router.get('/health/maps-api', async (req: Request, res: Response) => {
  try {
    // Test geocoding with a simple address
    const testResult = await EventService.testGoogleMapsAPI();
    res.json({ 
      status: 'ok', 
      googleMapsApiConfigured: true,
      testResult: testResult ? 'success' : 'failed'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      googleMapsApiConfigured: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 