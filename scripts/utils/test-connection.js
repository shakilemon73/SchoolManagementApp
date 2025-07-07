import pkg from 'pg';
const { Pool } = pkg;

async function testConnection() {
  console.log('Testing different connection formats...');
  
  const originalUrl = process.env.DATABASE_URL;
  console.log('Original URL format:', originalUrl?.substring(0, 50) + '...');
  
  // Try with different SSL configurations
  const configs = [
    {
      connectionString: originalUrl,
      ssl: { rejectUnauthorized: false }
    },
    {
      connectionString: originalUrl,
      ssl: false
    },
    {
      connectionString: originalUrl.replace('6543', '5432'),
      ssl: { rejectUnauthorized: false }
    }
  ];
  
  for (let i = 0; i < configs.length; i++) {
    console.log(`\nTrying configuration ${i + 1}...`);
    const pool = new Pool(configs[i]);
    
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✓ Success with config', i + 1, ':', result.rows[0]);
      await pool.end();
      return configs[i];
    } catch (error) {
      console.log('✗ Failed with config', i + 1, ':', error.message);
      await pool.end().catch(() => {});
    }
  }
  
  throw new Error('All connection attempts failed');
}

testConnection().catch(console.error);