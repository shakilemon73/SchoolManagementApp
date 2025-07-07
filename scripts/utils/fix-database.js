import pkg from 'pg';
const { Pool } = pkg;
import bcryptjs from 'bcryptjs';

async function fixDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  console.log('Testing database connection...');
  
  // Create a simple pool with SSL settings
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful:', result.rows[0]);

    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL,
        email TEXT,
        phone TEXT,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Users table created/verified');

    // Create sessions table for authentication
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      ) WITH (OIDS=FALSE);
    `);
    
    // Add primary key if it doesn't exist
    try {
      await pool.query(`ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid);`);
    } catch (e) {
      // Primary key might already exist
    }
    
    // Add index if it doesn't exist
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);`);
    } catch (e) {
      // Index might already exist
    }
    
    console.log('✓ Session table created/verified');

    // Insert default admin user
    const adminCheck = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (username, password, full_name, role, email)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', hashedPassword, 'System Administrator', 'admin', 'admin@school.com']);
      console.log('✓ Default admin user created (username: admin, password: admin123)');
    } else {
      console.log('✓ Admin user already exists');
    }

    await pool.end();
    console.log('✓ Database setup completed successfully');
    
  } catch (error) {
    console.error('Database setup failed:', error.message);
    throw error;
  }
}

fixDatabase().catch(console.error);