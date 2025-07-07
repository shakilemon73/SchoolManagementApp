import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiting for API endpoints
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limit
export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limit for authentication endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 login attempts per windowMs
  'Too many login attempts from this IP, please try again later.'
);

// Strict rate limit for document generation
export const documentRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 document generations per minute
  'Too many document generation requests, please try again later.'
);

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize common XSS attempts
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Enhanced authentication middleware with session security
export const enhancedAuth = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  
  if (!session?.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Check session expiry (24 hours)
  const sessionAge = Date.now() - (session.lastActivity || session.user.loginTime);
  if (sessionAge > 24 * 60 * 60 * 1000) {
    req.session.destroy(() => {});
    return res.status(401).json({ 
      error: 'Session expired',
      code: 'SESSION_EXPIRED'
    });
  }

  // Update last activity
  session.lastActivity = Date.now();
  
  next();
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as any;
    const userRole = session?.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: userRole
      });
    }

    next();
  };
};

// School isolation middleware - ensures users only access their school's data
export const schoolIsolation = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  const userSchoolId = session?.user?.schoolId;

  if (!userSchoolId) {
    return res.status(403).json({ 
      error: 'School access required',
      code: 'SCHOOL_ACCESS_REQUIRED'
    });
  }

  // Add schoolId to request for use in queries
  (req as any).userSchoolId = userSchoolId;
  
  next();
};

// Password strength validation
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Request logging middleware - optimized for production
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Skip logging for static assets and common development files
  const skipLogging = url.includes('.js') || 
                     url.includes('.css') || 
                     url.includes('.tsx') || 
                     url.includes('.ts') || 
                     url.includes('.map') || 
                     url.includes('favicon') ||
                     url.includes('src/') ||
                     url.includes('node_modules') ||
                     url.includes('assets/');
  
  if (!skipLogging) {
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      
      // Only log API requests and pages, not static assets
      if (url.startsWith('/api') || statusCode >= 400) {
        console.log(`${method} ${url} ${statusCode} in ${duration}ms`);
      }
      
      // Log security events
      if (statusCode === 401 || statusCode === 403) {
        console.warn(`Security: ${method} ${url} ${statusCode} from ${ip}`);
      }
    });
  }
  
  next();
};