-- Create credit balance and related tables in Supabase
-- This ensures proper credit balance tracking is available

-- 1. Ensure app_users table has credits column
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0 NOT NULL;

-- 2. Create credit_packages table
CREATE TABLE IF NOT EXISTS credit_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create credit_transactions table for tracking all credit movements
CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  package_id INTEGER REFERENCES credit_packages(id),
  type TEXT NOT NULL, -- purchase, usage, refund, manual_addition
  credits INTEGER NOT NULL,
  amount TEXT DEFAULT '0.00',
  description TEXT,
  reference TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  payment_number TEXT,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create credit_usage_logs table for detailed usage tracking
CREATE TABLE IF NOT EXISTS credit_usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  feature TEXT NOT NULL,
  credits INTEGER NOT NULL,
  description TEXT,
  document_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 5. Insert default credit packages
INSERT INTO credit_packages (name, description, credits, price, is_active) VALUES 
('Free Monthly', 'Free monthly credits', 25, 0.00, true),
('Basic', 'Basic package with 50 credits', 50, 199.00, true),
('Standard', 'Standard package with 100 credits', 100, 349.00, true),
('Premium', 'Premium package with 250 credits', 250, 799.00, true),
('Ultimate', 'Ultimate package with 500 credits', 500, 1499.00, true)
ON CONFLICT DO NOTHING;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_user_id ON credit_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_created_at ON credit_usage_logs(created_at);

-- 7. Create a view for easy credit balance checking
CREATE OR REPLACE VIEW user_credit_balance AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.name,
  COALESCE(u.credits, 0) as current_credits,
  COALESCE(total_purchased.purchased_credits, 0) as total_purchased_credits,
  COALESCE(total_used.used_credits, 0) as total_used_credits,
  COALESCE(recent_activity.last_transaction_date, u.created_at) as last_activity,
  u.created_at as account_created,
  u.updated_at as last_updated
FROM app_users u
LEFT JOIN (
  SELECT 
    user_id,
    SUM(credits) as purchased_credits
  FROM credit_transactions 
  WHERE type IN ('purchase', 'manual_addition') AND status = 'completed'
  GROUP BY user_id
) total_purchased ON u.id = total_purchased.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(credits) as used_credits
  FROM credit_usage_logs
  GROUP BY user_id
) total_used ON u.id = total_used.user_id
LEFT JOIN (
  SELECT 
    user_id,
    MAX(created_at) as last_transaction_date
  FROM credit_transactions
  GROUP BY user_id
) recent_activity ON u.id = recent_activity.user_id
ORDER BY u.credits DESC;

-- 8. Show current credit balances
SELECT 
  'Credit Balance Summary' as report_type,
  COUNT(*) as total_users,
  SUM(COALESCE(credits, 0)) as total_credits_in_system,
  AVG(COALESCE(credits, 0))::INTEGER as average_credits_per_user,
  MAX(COALESCE(credits, 0)) as highest_balance,
  MIN(COALESCE(credits, 0)) as lowest_balance
FROM app_users;

-- 9. Show individual user balances
SELECT * FROM user_credit_balance LIMIT 10;