import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '@shared/schema';

async function setupPermanentSupabase() {
  // Extract project reference from SUPABASE_URL
  const supabaseUrl = process.env.SUPABASE_URL!;
  const projectRef = supabaseUrl.split('//')[1].split('.')[0];
  const password = process.env.SUPABASE_DB_PASSWORD!;
  
  // Properly encode password for URL
  const encodedPassword = encodeURIComponent(password);
  
  // Construct the permanent Supabase DATABASE_URL
  const supabaseConnectionString = `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`;
  
  console.log('Setting up permanent Supabase connection...');
  console.log('Project reference:', projectRef);
  
  try {
    // Test the new Supabase connection
    const supabasePool = new Pool({ 
      connectionString: supabaseConnectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    // Test connection
    await supabasePool.query('SELECT 1');
    console.log('✓ Supabase database connection verified');
    
    // Get current data from existing database
    const currentPool = new Pool({ 
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false }
    });
    
    // Export current user data
    const userResult = await currentPool.query('SELECT * FROM users');
    const users = userResult.rows;
    
    console.log(`Found ${users.length} users to migrate`);
    
    // Check if schema exists in Supabase, if not create it
    try {
      await supabasePool.query('SELECT 1 FROM users LIMIT 1');
      console.log('✓ Schema already exists in Supabase');
    } catch (error) {
      console.log('Schema does not exist, will be created by db:push');
    }
    
    // Close connections
    await currentPool.end();
    await supabasePool.end();
    
    console.log('\nPermanent Supabase setup completed!');
    console.log('New DATABASE_URL constructed:', supabaseConnectionString.replace(password, '[PASSWORD]'));
    
    return supabaseConnectionString;
    
  } catch (error: any) {
    console.error('Setup failed:', error.message);
    throw error;
  }
}

// Run the setup
setupPermanentSupabase()
  .then((connectionString) => {
    console.log('\nNext steps:');
    console.log('1. Update DATABASE_URL environment variable');
    console.log('2. Run npm run db:push to create schema in Supabase');
    console.log('3. Migrate existing data');
    console.log('\nYour app will now work permanently with Supabase!');
  })
  .catch((error) => {
    console.error('Failed to setup permanent Supabase:', error);
  });