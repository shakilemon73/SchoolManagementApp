// Migration utilities to help transition from Express API to direct Supabase calls
import { supabase } from './supabase';

// Helper to gradually migrate API calls to Supabase
export const migrateApiCall = async <T>(
  supabaseOperation: () => Promise<T>,
  fallbackApiCall: () => Promise<T>,
  migrationEnabled: boolean = true
): Promise<T> => {
  if (!migrationEnabled) {
    return fallbackApiCall();
  }

  try {
    return await supabaseOperation();
  } catch (error) {
    console.warn('Supabase operation failed, falling back to API:', error);
    return fallbackApiCall();
  }
};

// Track migration progress
export const migrationTracker = {
  completedMigrations: new Set<string>(),
  
  markCompleted: (apiEndpoint: string) => {
    migrationTracker.completedMigrations.add(apiEndpoint);
    console.log(`✅ Migrated: ${apiEndpoint} -> Direct Supabase`);
  },
  
  getProgress: () => {
    const total = 25; // Estimated total API endpoints to migrate
    const completed = migrationTracker.completedMigrations.size;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
      remaining: total - completed
    };
  },
  
  listCompleted: () => Array.from(migrationTracker.completedMigrations),
  
  logProgress: () => {
    const progress = migrationTracker.getProgress();
    console.log(`🚀 Migration Progress: ${progress.completed}/${progress.total} (${progress.percentage}%)`);
    console.log(`📝 Completed migrations:`, progress.listCompleted);
  }
};

// Initialize migration tracking for completed endpoints
migrationTracker.markCompleted('/api/students');
migrationTracker.markCompleted('/api/teachers');
migrationTracker.markCompleted('/api/library/books');
migrationTracker.markCompleted('/api/inventory/items');
migrationTracker.markCompleted('/api/dashboard/stats');
migrationTracker.markCompleted('/api/notifications');
migrationTracker.markCompleted('/api/calendar/events');

// Express server elimination progress
export const expressEliminationTracker = {
  totalRoutes: 80, // Estimated from server files
  migratedRoutes: 7, // Current count of migrated routes
  
  getProgress: () => {
    const percentage = Math.round((expressEliminationTracker.migratedRoutes / expressEliminationTracker.totalRoutes) * 100);
    return {
      migrated: expressEliminationTracker.migratedRoutes,
      total: expressEliminationTracker.totalRoutes,
      percentage,
      remaining: expressEliminationTracker.totalRoutes - expressEliminationTracker.migratedRoutes
    };
  },
  
  increment: () => {
    expressEliminationTracker.migratedRoutes++;
    const progress = expressEliminationTracker.getProgress();
    console.log(`🎯 Express Elimination: ${progress.migrated}/${progress.total} routes (${progress.percentage}%)`);
  }
};

// Log initial migration status
console.log('🔄 Migration Status:');
migrationTracker.logProgress();
console.log(`🎯 Express Elimination: ${expressEliminationTracker.getProgress().percentage}% complete`);