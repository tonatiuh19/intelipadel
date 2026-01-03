-- Migration: Add constraint to ensure booking benefits are mutually exclusive
-- Description: Ensures subscriptions can have EITHER discount OR credits, not both
-- Date: 2025-12-30

-- Add CHECK constraint to ensure only one booking benefit type is set
ALTER TABLE `club_subscriptions`
ADD CONSTRAINT `chk_booking_benefit_exclusive`
  CHECK (
    (booking_discount_percent IS NOT NULL AND booking_credits_monthly IS NULL) OR
    (booking_discount_percent IS NULL AND booking_credits_monthly IS NOT NULL) OR
    (booking_discount_percent IS NULL AND booking_credits_monthly IS NULL)
  );

-- Update any existing subscriptions that have both set (keep discount, clear credits)
UPDATE `club_subscriptions`
SET booking_credits_monthly = NULL
WHERE booking_discount_percent IS NOT NULL AND booking_credits_monthly IS NOT NULL;
