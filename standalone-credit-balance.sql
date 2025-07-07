-- Standalone Credit Balance Table
-- This creates an independent table for managing user credit balances

-- Create the main credit balance table
CREATE TABLE credit_balance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  current_credits INTEGER DEFAULT 0 NOT NULL,
  bonus_credits INTEGER DEFAULT 0 NOT NULL,
  used_credits INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'active',
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX idx_credit_balance_user_id ON credit_balance(user_id);

-- Create indexes for common queries
CREATE INDEX idx_credit_balance_credits ON credit_balance(current_credits);
CREATE INDEX idx_credit_balance_status ON credit_balance(status);
CREATE INDEX idx_credit_balance_updated ON credit_balance(updated_at);

-- Insert sample data for demonstration
INSERT INTO credit_balance (user_id, username, email, full_name, current_credits, status) VALUES
(1, 'admin', 'admin@school.com', 'System Administrator', 1000, 'active'),
(2, 'teacher1', 'teacher1@school.com', 'Main Teacher', 500, 'active'),
(3, 'user1', 'user1@school.com', 'Test User', 250, 'active');

-- Create function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id INTEGER,
  p_username TEXT,
  p_email TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_credits INTEGER DEFAULT 0
) RETURNS void AS $$
BEGIN
  INSERT INTO credit_balance (
    user_id, 
    username, 
    email, 
    full_name, 
    current_credits, 
    updated_at
  ) VALUES (
    p_user_id,
    p_username,
    COALESCE(p_email, p_username || '@school.com'),
    COALESCE(p_full_name, p_username),
    p_credits,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    current_credits = credit_balance.current_credits + p_credits,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to use credits
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id INTEGER,
  p_credits INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT current_credits INTO current_balance 
  FROM credit_balance 
  WHERE user_id = p_user_id;
  
  -- Check if user exists and has enough credits
  IF current_balance IS NULL THEN
    RETURN FALSE; -- User not found
  END IF;
  
  IF current_balance < p_credits THEN
    RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Deduct credits
  UPDATE credit_balance 
  SET 
    current_credits = current_credits - p_credits,
    used_credits = used_credits + p_credits,
    last_activity = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE; -- Success
END;
$$ LANGUAGE plpgsql;

-- Create function to get user balance
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id INTEGER)
RETURNS TABLE(
  user_id INTEGER,
  username TEXT,
  email TEXT,
  current_credits INTEGER,
  used_credits INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.user_id,
    cb.username,
    cb.email,
    cb.current_credits,
    cb.used_credits,
    cb.status
  FROM credit_balance cb
  WHERE cb.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Show table creation success
SELECT 'Credit Balance Table Created Successfully' as message;

-- Show table structure
\d credit_balance;

-- Show current balances
SELECT 
  'Current Balances:' as info,
  COUNT(*) as total_users,
  SUM(current_credits) as total_credits,
  AVG(current_credits)::INTEGER as avg_credits
FROM credit_balance;

-- Show all users
SELECT 
  user_id,
  username,
  email,
  current_credits,
  used_credits,
  status,
  last_activity
FROM credit_balance 
ORDER BY current_credits DESC;