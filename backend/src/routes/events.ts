import { Router, Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { LocationSearch } from '../types';

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
    const events = await EventService.searchEventsByLocation(searchParams);
    res.json(events);
  } catch (error) {
    console.error('Error searching events:', error);
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

export default router; 