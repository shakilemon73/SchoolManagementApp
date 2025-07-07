-- Manual Credit Management Commands for Supabase
-- Run these commands in Supabase Dashboard > SQL Editor

-- 1. View all users and their current credits
SELECT 
  id,
  username,
  name,
  email,
  credits,
  role,
  is_active,
  created_at
FROM app_users
ORDER BY credits DESC;

-- 2. Add credits to a specific user by email
UPDATE app_users 
SET 
  credits = credits + 100,  -- Add 100 credits
  updated_at = NOW()
WHERE email = 'user@example.com';  -- Replace with actual email

-- 3. Add credits to a specific user by username
UPDATE app_users 
SET 
  credits = credits + 50,   -- Add 50 credits
  updated_at = NOW()
WHERE username = 'testuser';  -- Replace with actual username

-- 4. Set specific credit amount for a user
UPDATE app_users 
SET 
  credits = 500,            -- Set to exactly 500 credits
  updated_at = NOW()
WHERE id = 1;               -- Replace with actual user ID

-- 5. Add credits to all active users (bulk operation)
UPDATE app_users 
SET 
  credits = credits + 25,   -- Add 25 credits to everyone
  updated_at = NOW()
WHERE is_active = true;

-- 6. Create a credit transaction record (for tracking)
INSERT INTO credit_transactions (
  user_id,
  type,
  credits,
  amount,
  payment_method,
  status,
  description,
  created_at
) VALUES (
  1,                        -- Replace with user ID
  'manual_addition',
  100,                      -- Credits added
  '0.00',                   -- No payment
  'manual',
  'completed',
  'Manual credit addition by admin',
  NOW()
);

-- 7. View credit transaction history for a user
SELECT 
  ct.*,
  u.username,
  u.name
FROM credit_transactions ct
JOIN app_users u ON ct.user_id = u.id
WHERE u.email = 'user@example.com'  -- Replace with actual email
ORDER BY ct.created_at DESC;

-- 8. Check total credits distributed
SELECT 
  SUM(credits) as total_credits_in_system,
  COUNT(*) as total_users,
  AVG(credits) as average_credits_per_user
FROM app_users 
WHERE is_active = true;

-- 9. Find users with low credits (less than 10)
SELECT 
  id,
  username,
  name,
  email,
  credits
FROM app_users
WHERE credits < 10 AND is_active = true
ORDER BY credits ASC;

-- 10. Reset credits for testing (DANGER - use carefully)
-- UPDATE app_users SET credits = 0 WHERE role = 'user';