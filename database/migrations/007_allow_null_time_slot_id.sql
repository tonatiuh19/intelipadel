-- Migration: Allow NULL time_slot_id for manual bookings
-- This allows admins to create manual bookings without needing a time_slot record

-- Check if the column needs to be modified (if it's currently NOT NULL)
SELECT 
  CASE 
    WHEN IS_NULLABLE = 'NO' THEN 'Column needs update'
    ELSE 'Column already allows NULL'
  END as status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'bookings' 
  AND COLUMN_NAME = 'time_slot_id';

-- Modify time_slot_id to allow NULL values
ALTER TABLE bookings 
MODIFY COLUMN time_slot_id INT(11) NULL;

-- Update foreign key constraint to allow NULL
ALTER TABLE bookings 
DROP FOREIGN KEY bookings_ibfk_4;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_ibfk_4 
FOREIGN KEY (time_slot_id) 
REFERENCES time_slots(id) 
ON DELETE CASCADE;
