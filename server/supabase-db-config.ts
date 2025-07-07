// Re-export shared database connection to avoid duplicate connections
export { db as supabaseDb } from '@db/index';
export { db } from '@db/index';
export { db as pool } from '@db/index';