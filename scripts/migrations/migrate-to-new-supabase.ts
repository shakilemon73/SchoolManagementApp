import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';

// Current Supabase configuration (from your existing .env)
const CURRENT_SUPABASE_URL = process.env.SUPABASE_URL!;
const CURRENT_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const CURRENT_DATABASE_URL = process.env.DATABASE_URL!;

// New Supabase configuration (you'll need to provide these)
const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL!;
const NEW_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_KEY!;
const NEW_DATABASE_URL = process.env.NEW_DATABASE_URL!;

async function migrateToNewSupabase() {
  console.log('🔄 Starting migration to new Supabase account...');

  try {
    // Connect to current database
    console.log('📡 Connecting to current database...');
    const currentClient = postgres(CURRENT_DATABASE_URL);
    const currentDb = drizzle(currentClient, { schema });

    // Connect to new database
    console.log('📡 Connecting to new database...');
    const newClient = postgres(NEW_DATABASE_URL);
    const newDb = drizzle(newClient, { schema });

    // Create Supabase clients for additional operations
    const currentSupabase = createClient(CURRENT_SUPABASE_URL, CURRENT_SERVICE_KEY);
    const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SERVICE_KEY);

    // Step 1: Migrate core data tables
    console.log('📋 Migrating users...');
    const users = await currentDb.select().from(schema.users);
    if (users.length > 0) {
      await newDb.insert(schema.users).values(users).onConflictDoNothing();
      console.log(`✓ Migrated ${users.length} users`);
    }

    console.log('📋 Migrating schools...');
    const schools = await currentDb.select().from(schema.schools);
    if (schools.length > 0) {
      await newDb.insert(schema.schools).values(schools).onConflictDoNothing();
      console.log(`✓ Migrated ${schools.length} schools`);
    }

    console.log('📋 Migrating students...');
    const students = await currentDb.select().from(schema.students);
    if (students.length > 0) {
      await newDb.insert(schema.students).values(students).onConflictDoNothing();
      console.log(`✓ Migrated ${students.length} students`);
    }

    console.log('📋 Migrating library books...');
    const libraryBooks = await currentDb.select().from(schema.libraryBooks);
    if (libraryBooks.length > 0) {
      await newDb.insert(schema.libraryBooks).values(libraryBooks).onConflictDoNothing();
      console.log(`✓ Migrated ${libraryBooks.length} library books`);
    }

    // Step 2: Migrate additional tables if they exist
    const tables = [
      'documentTemplates',
      'generatedDocuments', 
      'admitCards',
      'teachers',
      'parents',
      'classes',
      'subjects',
      'examResults',
      'notifications',
      'creditPackages',
      'purchases',
      'calendarEvents',
      'classRoutines'
    ];

    for (const tableName of tables) {
      try {
        if (schema[tableName]) {
          console.log(`📋 Migrating ${tableName}...`);
          const tableData = await currentDb.select().from(schema[tableName]);
          if (tableData.length > 0) {
            await newDb.insert(schema[tableName]).values(tableData).onConflictDoNothing();
            console.log(`✓ Migrated ${tableData.length} ${tableName} records`);
          }
        }
      } catch (error) {
        console.log(`⚠ Could not migrate ${tableName}:`, error.message);
      }
    }

    // Step 3: Setup storage buckets in new Supabase
    console.log('📁 Setting up storage buckets in new Supabase...');
    const buckets = [
      { name: 'school-files', config: { public: true, allowedMimeTypes: ['image/*', 'application/pdf'] } },
      { name: 'student-photos', config: { public: true, allowedMimeTypes: ['image/*'] } },
      { name: 'certificates', config: { public: false, allowedMimeTypes: ['application/pdf', 'image/*'] } },
      { name: 'documents', config: { public: false, allowedMimeTypes: ['application/pdf', 'application/msword'] } }
    ];

    for (const bucket of buckets) {
      const { error } = await newSupabase.storage.createBucket(bucket.name, bucket.config);
      if (error && !error.message.includes('already exists')) {
        console.log(`Could not create bucket ${bucket.name}:`, error.message);
      } else {
        console.log(`✓ Bucket ${bucket.name} ready`);
      }
    }

    // Close connections
    await currentClient.end();
    await newClient.end();

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with the new Supabase credentials');
    console.log('2. Run "npm run db:push" to ensure schema is up to date');
    console.log('3. Test your application with the new database');
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Helper function to generate new .env content
function generateNewEnvFile(newSupabaseUrl: string, newAnonKey: string, newServiceKey: string, newDatabaseUrl: string) {
  return `DATABASE_URL=${newDatabaseUrl}
SUPABASE_URL=${newSupabaseUrl}
SUPABASE_ANON_KEY=${newAnonKey}
SUPABASE_SERVICE_KEY=${newServiceKey}

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Environment
NODE_ENV=development
VITE_SUPABASE_URL=${newSupabaseUrl}
VITE_SUPABASE_ANON_KEY=${newAnonKey}
`;
}

// Run migration if called directly
if (require.main === module) {
  migrateToNewSupabase().catch(console.error);
}

export { migrateToNewSupabase, generateNewEnvFile };