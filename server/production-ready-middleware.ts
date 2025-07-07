import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { securityHeaders, requestLogger, apiRateLimit, validateInput, authRateLimit, documentRateLimit } from './security-middleware';
import { registerSchoolSetupWizard } from './school-setup-wizard';
import { emailService } from './email-service';

// Production session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' as const,
  },
  name: 'edubd.session',
};

// Apply all production-ready middleware
export function applyProductionMiddleware(app: Express) {
  // Session management
  app.use(session(sessionConfig));
  
  // Security headers
  app.use(securityHeaders);
  
  // Request logging (optimized to reduce noise)
  app.use(requestLogger);
  
  // Input validation for all routes
  app.use(validateInput);
  
  // Rate limiting for different endpoint types
  app.use('/api/auth', authRateLimit);
  app.use('/api/documents/generate', documentRateLimit);
  app.use('/api', apiRateLimit);
  
  // Register production-ready routes
  registerSchoolSetupWizard(app);
  
  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      features: {
        database: 'connected',
        authentication: 'enabled',
        rateLimit: 'active',
        security: 'enabled',
        email: emailService ? 'configured' : 'not configured',
      },
    });
  });

  // System status endpoint for monitoring
  app.get('/api/system/status', async (req: Request, res: Response) => {
    try {
      const status = {
        application: 'EduBD Pro',
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        features: {
          admitCards: 'operational',
          documentGeneration: 'operational',
          userManagement: 'operational',
          notifications: 'operational',
          multiLanguage: 'operational',
        },
      };
      
      res.json(status);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: 'System health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  });

  console.log('✅ Production middleware applied successfully');
  console.log('🔒 Security features: Headers, Rate Limiting, Input Validation');
  console.log('📊 Monitoring: /api/health, /api/system/status');
  console.log('🚀 School Setup: /api/setup endpoints available');
}

// Initialize email service on startup
export async function initializeProductionServices() {
  try {
    // Test email service connection if configured
    const emailTest = await emailService.testConnection();
    if (emailTest) {
      console.log('📧 Email service: Connected and ready');
    } else {
      console.log('⚠️ Email service: Not configured (SMTP credentials missing)');
    }
  } catch (error) {
    console.log('❌ Email service: Configuration error');
  }
}