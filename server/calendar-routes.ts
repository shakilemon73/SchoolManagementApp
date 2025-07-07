import { Express, Request, Response } from 'express';
import { db } from './db';
import { calendarEvents } from '../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { calendarEventsInsertSchema } from '../shared/schema';
import { z } from 'zod';

// Create a flexible validation schema for calendar event creation
const flexibleCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleBn: z.string().optional(),
  description: z.string().optional(),
  descriptionBn: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.string().default("event"),
  location: z.string().optional(),
  organizer: z.string().optional(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  createdBy: z.number().optional(),
  schoolId: z.number().default(1)
});

export function registerCalendarRoutes(app: Express) {
  
  // Get all calendar events
  app.get('/api/calendar/events', async (req: Request, res: Response) => {
    try {
      const events = await db
        .select()
        .from(calendarEvents)
        .orderBy(desc(calendarEvents.startDate));
      
      return res.json(events);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch calendar events',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create new calendar event
  app.post('/api/calendar/events', async (req: Request, res: Response) => {
    try {
      // Transform incoming data to match expected format
      const rawData = {
        title: req.body.title || req.body.eventTitle,
        titleBn: req.body.titleBn || req.body.title || '',
        description: req.body.description,
        descriptionBn: req.body.descriptionBn || req.body.description || '',
        startDate: req.body.startDate || req.body.date,
        endDate: req.body.endDate,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        type: req.body.type || req.body.eventType || 'event',
        location: req.body.location,
        organizer: req.body.organizer,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : false,
        createdBy: req.user?.id || 1,
        schoolId: req.user?.schoolId || 1
      };

      // Validate with flexible schema first
      const validatedInput = flexibleCalendarEventSchema.parse(rawData);
      
      // Prepare data for database insertion with required fields
      const dbData = {
        ...validatedInput,
        titleBn: validatedInput.titleBn || validatedInput.title // Ensure titleBn is not empty
      };
      
      const [newEvent] = await db
        .insert(calendarEvents)
        .values(dbData)
        .returning();
      
      return res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed',
          message: 'Please check required fields: title and start date',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }
      return res.status(500).json({ 
        error: 'Failed to create calendar event',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get today's events (must be before :id route)
  app.get('/api/calendar/events/today', async (req: Request, res: Response) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const events = await db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.startDate, today))
        .orderBy(calendarEvents.startTime);
      
      return res.json(events);
    } catch (error) {
      console.error('Error fetching today\'s events:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch today\'s events',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get upcoming events (must be before :id route)
  app.get('/api/calendar/events/upcoming', async (req: Request, res: Response) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const limit = parseInt(req.query.limit as string) || 5;
      
      const events = await db
        .select()
        .from(calendarEvents)
        .where(gte(calendarEvents.startDate, today))
        .orderBy(calendarEvents.startDate)
        .limit(limit);
      
      return res.json(events);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch upcoming events',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get events in date range (must be before :id route)
  app.get('/api/calendar/events/range/:startDate/:endDate', async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.params;
      
      const events = await db
        .select()
        .from(calendarEvents)
        .where(
          and(
            gte(calendarEvents.startDate, startDate),
            lte(calendarEvents.startDate, endDate)
          )
        )
        .orderBy(calendarEvents.startDate);
      
      return res.json(events);
    } catch (error) {
      console.error('Error fetching events for date range:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch events for date range',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get single calendar event (must be after specific routes)
  app.get('/api/calendar/events/:id', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }
      
      const [event] = await db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.id, eventId));
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      return res.json(event);
    } catch (error) {
      console.error('Error fetching calendar event:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch calendar event',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update calendar event
  app.put('/api/calendar/events/:id', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }
      
      const validatedData = flexibleCalendarEventSchema.parse(req.body);
      
      const [updatedEvent] = await db
        .update(calendarEvents)
        .set(validatedData)
        .where(eq(calendarEvents.id, eventId))
        .returning();
      
      if (!updatedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      return res.json(updatedEvent);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }
      return res.status(500).json({ 
        error: 'Failed to update calendar event',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete calendar event
  app.delete('/api/calendar/events/:id', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }
      
      const [deletedEvent] = await db
        .delete(calendarEvents)
        .where(eq(calendarEvents.id, eventId))
        .returning();
      
      if (!deletedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      return res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return res.status(500).json({ 
        error: 'Failed to delete calendar event',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}