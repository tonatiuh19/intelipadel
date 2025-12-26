-- Migration: Add stripe_payment_intent_id to bookings table
-- Date: 2025-12-26
-- Description: Links bookings with Stripe payment intents for payment tracking

ALTER TABLE `bookings`
ADD COLUMN `stripe_payment_intent_id` VARCHAR(255) NULL AFTER `payment_method`,
ADD INDEX `idx_stripe_payment_intent` (`stripe_payment_intent_id`);

-- Add comment to the column
ALTER TABLE `bookings`
MODIFY COLUMN `stripe_payment_intent_id` VARCHAR(255) NULL COMMENT 'Stripe payment intent ID for this booking';
