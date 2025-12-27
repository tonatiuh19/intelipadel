-- Migration: Add index for events courts_used field
-- This ensures efficient querying when checking court availability

-- Verify events table has courts_used column (it should already exist)
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS courts_used JSON DEFAULT NULL;

-- Add indexes for events table (drop first if they exist to avoid errors)
-- Add index on event_date and status for faster availability queries
ALTER TABLE events ADD INDEX idx_events_date_status (event_date, status);

-- Add index on club_id for admin filtering
ALTER TABLE events ADD INDEX idx_events_club_id (club_id);

-- Add indexes for event_participants table
ALTER TABLE event_participants ADD INDEX idx_event_participants_event_id (event_id);
ALTER TABLE event_participants ADD INDEX idx_event_participants_user_id (user_id);
ALTER TABLE event_participants ADD INDEX idx_event_participants_status (payment_status, status);
