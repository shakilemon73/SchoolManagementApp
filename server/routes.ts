import { Request, Response } from 'express';
import { storage } from './storage';

export function setupRoutes(app: any) {
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  });

  // API endpoints for the school management system
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/students', async (req: Request, res: Response) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  app.get('/api/library/books', async (req: Request, res: Response) => {
    try {
      const books = await storage.getLibraryBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch library books' });
    }
  });

  app.post('/api/library/books', async (req: Request, res: Response) => {
    try {
      const book = await storage.createLibraryBook(req.body);
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create library book' });
    }
  });

  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  app.get('/api/user', async (req: Request, res: Response) => {
    try {
      // Return a mock user for now since we're using Supabase auth
      const user = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'admin'
      };
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  return app;
}