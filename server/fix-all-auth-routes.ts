import type { Express } from "express";
import { unifiedAuthMiddleware, optionalAuthMiddleware, requireRole } from "./unified-auth-middleware";

export function applyUnifiedAuthToAllRoutes(app: Express) {
  // Remove all existing authentication middleware and replace with unified system
  
  // Calendar routes - require authentication
  app.all('/api/calendar/*', unifiedAuthMiddleware);
  
  // Dashboard routes - require authentication  
  app.all('/api/dashboard/*', unifiedAuthMiddleware);
  app.all('/api/supabase/dashboard/*', unifiedAuthMiddleware);
  
  // Student management routes - require authentication
  app.all('/api/students/*', unifiedAuthMiddleware);
  
  // Teacher management routes - require authentication
  app.all('/api/teachers/*', unifiedAuthMiddleware);
  
  // Admin routes - require admin role
  app.all('/api/admin/*', unifiedAuthMiddleware, requireRole(['admin', 'super_admin']));
  
  // Library routes - completely public, no authentication required
  // Note: Library routes are intentionally excluded from authentication
  
  // Inventory routes - completely public, no authentication required
  // Note: Inventory routes are intentionally excluded from authentication
  
  // Transport routes - require authentication
  app.all('/api/transport/*', unifiedAuthMiddleware);
  
  // Financial routes - require authentication
  app.all('/api/finance/*', unifiedAuthMiddleware);
  app.all('/api/financial/*', unifiedAuthMiddleware);
  
  // Document generation routes - mixed authentication
  // Admit card templates are public for viewing, but generation requires auth
  // NOTE: More specific routes must come BEFORE general routes in Express
  app.all('/api/admit-cards/*', (req, res, next) => {
    // Templates endpoints are public, others require auth
    if (req.path.includes('/templates')) {
      return optionalAuthMiddleware(req, res, next);
    } else {
      return unifiedAuthMiddleware(req, res, next);
    }
  });
  app.all('/api/id-cards/*', unifiedAuthMiddleware);
  app.all('/api/documents/*', optionalAuthMiddleware); // Some document templates are public
  
  // Class routine routes - require authentication
  app.all('/api/class-routines/*', unifiedAuthMiddleware);
  
  // Staff management routes - require authentication
  app.all('/api/staff/*', unifiedAuthMiddleware);
  
  // Parent portal routes - require authentication
  app.all('/api/parents/*', unifiedAuthMiddleware);
  
  // Credit system routes - require authentication
  app.all('/api/credits/*', unifiedAuthMiddleware);
  
  // Payment routes - require authentication
  app.all('/api/payments/*', unifiedAuthMiddleware);
  app.all('/api/sslcommerz/*', unifiedAuthMiddleware);
  
  // Settings routes - require admin role
  app.all('/api/settings/*', unifiedAuthMiddleware, requireRole(['admin', 'super_admin']));
  app.all('/api/school-settings/*', unifiedAuthMiddleware, requireRole(['admin', 'super_admin']));
  app.all('/api/academic-years/*', unifiedAuthMiddleware, requireRole(['admin', 'super_admin']));
  
  // Template routes - require authentication
  app.all('/api/templates/*', unifiedAuthMiddleware);
  app.all('/api/document-templates/*', unifiedAuthMiddleware);
  
  // Notification routes - require authentication
  app.all('/api/notifications/*', unifiedAuthMiddleware);
  
  // Video conference routes - require authentication
  app.all('/api/video-conference/*', unifiedAuthMiddleware);
  
  // Portal routes - require authentication with role-based access
  app.all('/api/student/*', unifiedAuthMiddleware, requireRole(['student', 'teacher', 'admin', 'super_admin']));
  app.all('/api/teacher/*', unifiedAuthMiddleware, requireRole(['teacher', 'admin', 'super_admin']));
  app.all('/api/parent/*', unifiedAuthMiddleware, requireRole(['parent', 'admin', 'super_admin']));
  
  // Developer portal routes - require admin role
  app.all('/api/developer/*', unifiedAuthMiddleware, requireRole(['super_admin']));
  
  // Super admin routes - require super admin role
  app.all('/api/super-admin/*', unifiedAuthMiddleware, requireRole(['super_admin']));
  
  // User profile routes - require authentication
  app.all('/api/profile/*', unifiedAuthMiddleware);
  app.all('/api/user', unifiedAuthMiddleware);
  
  // Public routes that don't need authentication (explicitly allow)
  const publicRoutes = [
    '/api/auth/*',
    '/api/public/*',
    '/api/library/*', // Library routes are completely public
    '/test-*',
    '/api/documents/templates', // Public document templates
    '/api/supabase/create-test-user'
  ];
  
  // Apply optional auth to public routes EXCEPT library routes (they can work with or without auth)
  publicRoutes.forEach(route => {
    if (!route.includes('library')) {
      app.all(route, optionalAuthMiddleware);
    }
  });
}