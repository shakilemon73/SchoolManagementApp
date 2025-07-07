-- One-time credit addition script
-- Add 2000 credits to all users in app_users table

UPDATE app_users 
SET credits = COALESCE(credits, 0) + 2000,
    updated_at = NOW()
WHERE id IS NOT NULL;

-- Insert transaction records for tracking
INSERT INTO credit_transactions (user_id, type, credits, amount, payment_method, status, description, created_at)
SELECT id, 'manual_addition', 2000, '0.00', 'manual', 'completed', 'One-time 2000 credit bonus', NOW()
FROM app_users 
WHERE id IS NOT NULL;

-- Display results
SELECT 
    username,
    email,
    credits,
    'Updated with 2000 bonus credits' as status
FROM app_users
ORDER BY credits DESC;