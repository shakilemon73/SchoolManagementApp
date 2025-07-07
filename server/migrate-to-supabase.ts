import { Pool } from 'pg';
import { supabase } from '@shared/supabase';

// Migration script to transfer data from current database to Supabase
export async function migrateToSupabase() {
  try {
    console.log('Starting migration to Supabase...');

    // Get current database connection
    const currentPool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Test Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Supabase connection failed:', testError.message);
      return false;
    }

    console.log('✓ Supabase connection verified');

    // Export current user data
    const userQuery = await currentPool.query('SELECT * FROM users');
    const users = userQuery.rows;

    console.log(`Found ${users.length} users to migrate`);

    // Migrate users to Supabase
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          username: user.username,
          password: user.password,
          full_name: user.full_name,
          role: user.role,
          email: user.email,
          phone: user.phone,
          language: user.language,
          created_at: user.createdat,
          updated_at: user.updatedat
        });

      if (error) {
        console.error(`Failed to migrate user ${user.username}:`, error.message);
      } else {
        console.log(`✓ Migrated user: ${user.username}`);
      }
    }

    // Export and migrate other critical tables
    const tablesToMigrate = ['students', 'teachers', 'classes', 'notifications'];

    for (const tableName of tablesToMigrate) {
      try {
        const result = await currentPool.query(`SELECT * FROM ${tableName}`);
        const rows = result.rows;

        if (rows.length > 0) {
          const { error } = await supabase
            .from(tableName)
            .upsert(rows);

          if (error) {
            console.error(`Failed to migrate ${tableName}:`, error.message);
          } else {
            console.log(`✓ Migrated ${rows.length} records from ${tableName}`);
          }
        }
      } catch (error: any) {
        console.log(`Table ${tableName} might not exist or has no data:`, error.message);
      }
    }

    await currentPool.end();
    console.log('✓ Migration completed successfully');
    return true;

  } catch (error: any) {
    console.error('Migration failed:', error.message);
    return false;
  }
}

// Export current database structure for documentation
export async function exportDatabaseStructure() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const structureQuery = `
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `;

  const result = await pool.query(structureQuery);
  await pool.end();
  
  return result.rows;
}