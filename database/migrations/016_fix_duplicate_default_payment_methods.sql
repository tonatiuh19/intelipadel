-- Fix duplicate default payment methods
-- This migration ensures only one payment method per user is marked as default

-- Step 1: Unset all defaults first
UPDATE payment_methods
SET is_default = 0
WHERE is_default = 1;

-- Step 2: Set the most recent payment method (highest ID) as default for each user
UPDATE payment_methods pm
SET pm.is_default = 1
WHERE pm.id IN (
  SELECT max_id FROM (
    SELECT MAX(id) as max_id
    FROM payment_methods
    GROUP BY user_id
  ) AS subquery
);

-- Verify: This query should return 0 rows (no users with multiple defaults)
-- Uncomment to check after running:
-- SELECT user_id, COUNT(*) as default_count
-- FROM payment_methods
-- WHERE is_default = 1
-- GROUP BY user_id
-- HAVING COUNT(*) > 1;
