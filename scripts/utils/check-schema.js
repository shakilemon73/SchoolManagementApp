import postgres from 'postgres';

const client = postgres('postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres', {
  prepare: false, fetch_types: false, ssl: 'require', max: 5, idle_timeout: 20, connect_timeout: 10,
  debug: false, onnotice: () => {}, onparameter: () => {}, transform: { undefined: null }
});

async function checkSchema() {
  try {
    console.log('Checking existing tables...');
    
    const tables = await client`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('Available tables:', tables.map(t => t.table_name));
    
    if (tables.find(t => t.table_name === 'app_users')) {
      const usersSchema = await client`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'app_users' 
        ORDER BY ordinal_position
      `;
      console.log('\napp_users table structure:');
      usersSchema.forEach(col => {
        console.log(`  ${col.column_name} (${col.data_type}) - nullable: ${col.is_nullable}`);
      });
    }
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    await client.end();
  }
}

checkSchema();