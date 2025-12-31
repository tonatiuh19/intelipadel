-- Add default_booking_duration column to clubs table
-- This stores the default duration for bookings in minutes (60, 90, or 120)

ALTER TABLE `clubs` 
ADD COLUMN `default_booking_duration` INT NOT NULL DEFAULT 60 
COMMENT 'Default booking duration in minutes (60, 90, or 120)' 
AFTER `price_per_hour`;
