import type { Express, Request, Response } from "express";

export function registerSimpleHealth(app: Express) {
  // Simple health check endpoint for deployment platforms
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  });

  // Root endpoint
  app.get('/health', async (req: Request, res: Response) => {
    res.redirect('/api/health');
  });
}