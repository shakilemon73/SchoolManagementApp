-- Create functions for credit operations in Supabase

-- Function to increment user credits
CREATE OR REPLACE FUNCTION increment_user_credits(user_id integer, credits_to_add integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users 
  SET credits = credits + credits_to_add,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Function to decrement user credits
CREATE OR REPLACE FUNCTION decrement_user_credits(user_id integer, credits_to_deduct integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users 
  SET credits = credits - credits_to_deduct,
      updated_at = NOW()
  WHERE id = user_id
  AND credits >= credits_to_deduct;
END;
$$;

-- Function to get user credit balance
CREATE OR REPLACE FUNCTION get_user_credits(user_id integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  user_credits integer;
BEGIN
  SELECT credits INTO user_credits
  FROM users
  WHERE id = user_id;
  
  RETURN COALESCE(user_credits, 0);
END;
$$;

-- Function to check if user has sufficient credits
CREATE OR REPLACE FUNCTION check_sufficient_credits(user_id integer, required_credits integer)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  user_credits integer;
BEGIN
  SELECT credits INTO user_credits
  FROM users
  WHERE id = user_id;
  
  RETURN COALESCE(user_credits, 0) >= required_credits;
END;
$$;

-- Function to process credit transaction
CREATE OR REPLACE FUNCTION process_credit_transaction(
  p_user_id integer,
  p_package_id integer,
  p_type text,
  p_credits integer,
  p_amount decimal,
  p_payment_method text,
  p_description text
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  transaction_id integer;
  result json;
BEGIN
  -- Insert transaction record
  INSERT INTO credit_transactions (
    user_id, package_id, type, credits, amount, 
    payment_method, status, description, created_at
  )
  VALUES (
    p_user_id, p_package_id, p_type, p_credits, p_amount,
    p_payment_method, 'completed', p_description, NOW()
  )
  RETURNING id INTO transaction_id;
  
  -- Update user credits if purchase
  IF p_type = 'purchase' THEN
    PERFORM increment_user_credits(p_user_id, p_credits);
  END IF;
  
  -- Return transaction details
  SELECT json_build_object(
    'id', transaction_id,
    'user_id', p_user_id,
    'credits', p_credits,
    'type', p_type,
    'status', 'completed',
    'message', 'Transaction processed successfully'
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to log credit usage
CREATE OR REPLACE FUNCTION log_credit_usage(
  p_user_id integer,
  p_feature text,
  p_credits integer,
  p_description text,
  p_document_id integer DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  usage_id integer;
  user_credits integer;
  result json;
BEGIN
  -- Check if user has sufficient credits
  SELECT credits INTO user_credits FROM users WHERE id = p_user_id;
  
  IF user_credits < p_credits THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'required', p_credits,
      'available', user_credits
    );
  END IF;
  
  -- Insert usage log
  INSERT INTO credit_usage_logs (
    user_id, feature, credits, description, document_id, created_at
  )
  VALUES (
    p_user_id, p_feature, p_credits, p_description, p_document_id, NOW()
  )
  RETURNING id INTO usage_id;
  
  -- Deduct credits
  PERFORM decrement_user_credits(p_user_id, p_credits);
  
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'usage_id', usage_id,
    'credits_used', p_credits,
    'remaining_credits', user_credits - p_credits,
    'message', 'Credits used successfully'
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get credit statistics
CREATE OR REPLACE FUNCTION get_credit_stats(p_user_id integer)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  current_balance integer;
  total_purchased integer;
  total_used integer;
  month_usage integer;
  result json;
BEGIN
  -- Get current balance
  SELECT credits INTO current_balance FROM users WHERE id = p_user_id;
  
  -- Get total purchased
  SELECT COALESCE(SUM(credits), 0) INTO total_purchased
  FROM credit_transactions
  WHERE user_id = p_user_id AND type = 'purchase' AND status = 'completed';
  
  -- Get total used
  SELECT COALESCE(SUM(credits), 0) INTO total_used
  FROM credit_usage_logs
  WHERE user_id = p_user_id;
  
  -- Get this month's usage
  SELECT COALESCE(SUM(credits), 0) INTO month_usage
  FROM credit_usage_logs
  WHERE user_id = p_user_id
  AND created_at >= date_trunc('month', CURRENT_DATE);
  
  -- Build result
  SELECT json_build_object(
    'current_balance', COALESCE(current_balance, 0),
    'total_purchased', total_purchased,
    'total_used', total_used,
    'this_month_usage', month_usage,
    'efficiency', CASE 
      WHEN total_purchased > 0 THEN ROUND((total_used::decimal / total_purchased) * 100, 2)
      ELSE 0
    END
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Trigger to update user credits on transaction insert
CREATE OR REPLACE FUNCTION update_credits_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.type = 'purchase' AND NEW.status = 'completed' THEN
    UPDATE users 
    SET credits = credits + NEW.credits,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_credits_on_transaction ON credit_transactions;
CREATE TRIGGER trigger_update_credits_on_transaction
  AFTER INSERT ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_on_transaction();

-- Function to get document costs with real-time data
CREATE OR REPLACE FUNCTION get_document_costs()
RETURNS TABLE (
  id integer,
  name text,
  name_bn text,
  required_credits integer,
  category text,
  description text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dt.id,
    dt.name,
    dt.name_bn,
    dt.required_credits,
    dt.category,
    dt.description
  FROM document_templates dt
  WHERE dt.is_active = true
  ORDER BY dt.required_credits ASC;
END;
$$;