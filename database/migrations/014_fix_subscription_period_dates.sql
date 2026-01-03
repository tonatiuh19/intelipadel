-- Fix subscription records where current_period_end equals current_period_start
-- Set current_period_end to be 1 month after current_period_start

UPDATE user_subscriptions
SET current_period_end = DATE_ADD(current_period_start, INTERVAL 1 MONTH)
WHERE current_period_end = current_period_start
  AND status = 'active';
