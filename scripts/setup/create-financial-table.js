import postgres from 'postgres';

// Use the same Supabase connection
const databaseUrl = "postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const client = postgres(databaseUrl, {
  prepare: false,
  fetch_types: false,
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
  debug: false,
  onnotice: () => {},
  onparameter: () => {},
  transform: { undefined: null }
});

async function createFinancialTable() {
  try {
    console.log('Creating financial_transactions table...');
    
    // Create the table using raw SQL
    await client`
      CREATE TABLE IF NOT EXISTS financial_transactions (
        id SERIAL PRIMARY KEY,
        transaction_type TEXT NOT NULL,
        category TEXT NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        payment_method TEXT NOT NULL,
        reference_number TEXT,
        school_id INTEGER NOT NULL DEFAULT 1,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    console.log('✓ financial_transactions table created');
    
    // Insert some sample data
    await client`
      INSERT INTO financial_transactions (transaction_type, category, amount, date, description, payment_method, school_id)
      VALUES 
        ('income', 'fee', 5000.00, '2024-01-15', 'Student admission fee', 'bank_transfer', 1),
        ('expense', 'salary', 25000.00, '2024-01-01', 'Teacher salary - January', 'bank_transfer', 1),
        ('income', 'fee', 3000.00, '2024-01-20', 'Monthly tuition fee', 'cash', 1),
        ('expense', 'utility', 1500.00, '2024-01-10', 'Electricity bill', 'bank_transfer', 1),
        ('income', 'fee', 2500.00, '2024-01-25', 'Book fees', 'bkash', 1)
      ON CONFLICT DO NOTHING
    `;
    
    console.log('✓ Sample financial data inserted');
    
    // Verify the data
    const result = await client`SELECT COUNT(*) as count FROM financial_transactions`;
    console.log(`✓ Total transactions: ${result[0].count}`);
    
    await client.end();
    console.log('✓ Financial table setup completed');
    
  } catch (error) {
    console.error('❌ Error creating financial table:', error);
    await client.end();
    process.exit(1);
  }
}

createFinancialTable();