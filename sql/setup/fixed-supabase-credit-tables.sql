-- Fixed Credit Tables Setup for Supabase
-- Execute this script in Supabase SQL Editor

-- Step 1: Ensure app_users table has credits column
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0 NOT NULL;

-- Step 2: Create credit_packages table
DROP TABLE IF EXISTS credit_packages CASCADE;
CREATE TABLE credit_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  credits INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Step 3: Create credit_transactions table
DROP TABLE IF EXISTS credit_transactions CASCADE;
CREATE TABLE credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  package_id INTEGER REFERENCES credit_packages(id),
  type TEXT NOT NULL DEFAULT 'purchase',
  credits INTEGER NOT NULL,
  amount TEXT DEFAULT '0.00',
  description TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  payment_number TEXT,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Step 4: Create credit_usage_logs table
DROP TABLE IF EXISTS credit_usage_logs CASCADE;
CREATE TABLE credit_usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  feature TEXT NOT NULL,
  credits INTEGER NOT NULL,
  description TEXT,
  document_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Step 5: Insert default credit packages
INSERT INTO credit_packages (name, description, credits, price, is_active) VALUES 
('Free Monthly', 'Free monthly credits', 25, 0.00, true),
('Basic', 'Basic package with 50 credits', 50, 199.00, true),
('Standard', 'Standard package with 100 credits', 100, 349.00, true),
('Premium', 'Premium package with 250 credits', 250, 799.00, true),
('Ultimate', 'Ultimate package with 500 credits', 500, 1499.00, true);

-- Step 6: Create performance indexes
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_usage_logs_user_id ON credit_usage_logs(user_id);
CREATE INDEX idx_credit_usage_logs_created_at ON credit_usage_logs(created_at);

-- Step 7: Create user credit balance view (now that tables exist)
CREATE OR REPLACE VIEW user_credit_balance AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.name,
  COALESCE(u.credits, 0) as current_credits,
  COALESCE(purchased.total_purchased, 0) as total_purchased,
  COALESCE(used.total_used, 0) as total_used,
  u.created_at,
  u.updated_at
FROM app_users u
LEFT JOIN (
  SELECT 
    user_id, 
    SUM(credits) as total_purchased
  FROM credit_transactions 
  WHERE type IN ('purchase', 'manual_addition') 
  AND status = 'completed'
  GROUP BY user_id
) purchased ON u.id = purchased.user_id
LEFT JOIN (
  SELECT 
    user_id, 
    SUM(credits) as total_used
  FROM credit_usage_logs
  GROUP BY user_id
) used ON u.id = used.user_id
ORDER BY u.credits DESC;

-- Step 8: Verification queries
SELECT 'Credit System Setup Complete' as message;

-- Check table existence
SELECT 
  COUNT(CASE WHEN table_name = 'app_users' THEN 1 END) > 0 as app_users_exists,
  COUNT(CASE WHEN table_name = 'credit_packages' THEN 1 END) > 0 as credit_packages_exists,
  COUNT(CASE WHEN table_name = 'credit_transactions' THEN 1 END) > 0 as credit_transactions_exists,
  COUNT(CASE WHEN table_name = 'credit_usage_logs' THEN 1 END) > 0 as credit_usage_logs_exists
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Show credit packages
SELECT 'Available Credit Packages:' as info;
SELECT id, name, credits, price, is_active FROM credit_packages ORDER BY price;

-- Show user credit summary
SELECT 'User Credit Summary:' as info;
SELECT 
  COUNT(*) as total_users,
  SUM(COALESCE(credits, 0)) as total_credits_in_system,
  ROUND(AVG(COALESCE(credits, 0))) as average_credits_per_user,
  MAX(COALESCE(credits, 0)) as highest_balance,
  MIN(COALESCE(credits, 0)) as lowest_balance
FROM app_users;

-- Show current user balances
SELECT 'Current User Balances:' as info;
SELECT id, username, email, current_credits 
FROM user_credit_balance 
ORDER BY current_credits DESC 
LIMIT 10;