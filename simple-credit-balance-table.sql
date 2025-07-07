-- Simple credit balance table creation (handles missing columns gracefully)
-- Execute this in Supabase SQL Editor

-- Step 1: Ensure app_users has credits column
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0 NOT NULL;

-- Step 2: Create credit_balance table for easy viewing
CREATE TABLE IF NOT EXISTS credit_balance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT,
  name TEXT,
  current_credits INTEGER DEFAULT 0 NOT NULL,
  total_purchased INTEGER DEFAULT 0 NOT NULL,
  total_used INTEGER DEFAULT 0 NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_credit_balance_user_id ON credit_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_balance_credits ON credit_balance(current_credits);

-- Step 4: Populate credit_balance table with current user data
INSERT INTO credit_balance (
  user_id, 
  username, 
  email, 
  name, 
  current_credits, 
  last_updated
)
SELECT 
  u.id,
  u.username,
  COALESCE(u.email, u.username || '@school.com'),
  COALESCE(u.name, u.username),
  COALESCE(u.credits, 0),
  NOW()
FROM app_users u
ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  current_credits = EXCLUDED.current_credits,
  last_updated = NOW();

-- Step 5: Create function to refresh credit balance data
CREATE OR REPLACE FUNCTION refresh_credit_balance()
RETURNS void AS $$
BEGIN
  -- Simple refresh from app_users table
  INSERT INTO credit_balance (
    user_id, 
    username, 
    email, 
    name, 
    current_credits, 
    last_updated
  )
  SELECT 
    u.id,
    u.username,
    COALESCE(u.email, u.username || '@school.com'),
    COALESCE(u.name, u.username),
    COALESCE(u.credits, 0),
    NOW()
  FROM app_users u
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    current_credits = EXCLUDED.current_credits,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for auto-updates
CREATE OR REPLACE FUNCTION update_credit_balance_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credit_balance (
    user_id, 
    username, 
    email, 
    name, 
    current_credits, 
    last_updated
  )
  VALUES (
    NEW.id,
    NEW.username,
    COALESCE(NEW.email, NEW.username || '@school.com'),
    COALESCE(NEW.name, NEW.username),
    COALESCE(NEW.credits, 0),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    current_credits = EXCLUDED.current_credits,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS credit_balance_update_trigger ON app_users;
CREATE TRIGGER credit_balance_update_trigger
  AFTER INSERT OR UPDATE OF credits ON app_users
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_balance_trigger();

-- Step 7: Show results
SELECT 'Credit Balance Table Setup Complete' as status;

-- Verify table was created
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'credit_balance';

-- Show table structure
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_balance' 
ORDER BY ordinal_position;

-- Show current data
SELECT 
  COUNT(*) as total_records,
  SUM(current_credits) as total_credits,
  AVG(current_credits)::INTEGER as average_credits,
  MAX(current_credits) as highest_balance,
  MIN(current_credits) as lowest_balance
FROM credit_balance;

-- Show all user balances
SELECT 
  user_id,
  username,
  email,
  current_credits,
  last_updated
FROM credit_balance 
ORDER BY current_credits DESC;