-- Migration: Add club_id to users table for multi-tenancy support
-- This allows the same email to exist for different clubs
-- Date: 2025-12-29

-- Step 1: Add club_id column to users table
ALTER TABLE `users` 
ADD COLUMN `club_id` INT(11) DEFAULT NULL AFTER `id`,
ADD INDEX `idx_users_club_id` (`club_id`);

-- Step 2: Add foreign key constraint to clubs table
ALTER TABLE `users`
ADD CONSTRAINT `fk_users_club_id` 
FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Step 3: Update existing users to have a default club_id
-- This assigns club_id = 1 to existing users for backward compatibility
-- You may want to customize this based on your actual data
UPDATE `users` SET `club_id` = 1 WHERE `club_id` IS NULL;

-- Step 4: Drop the old unique constraint on email (if exists)
-- Check if the constraint exists first
SET @constraint_name = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users' 
  AND CONSTRAINT_TYPE = 'UNIQUE'
  AND CONSTRAINT_NAME LIKE '%email%'
  LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
  CONCAT('ALTER TABLE `users` DROP INDEX `', @constraint_name, '`'),
  'SELECT "No email constraint to drop"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Add new composite unique constraint on (email, club_id)
-- This allows the same email to be used in different clubs
ALTER TABLE `users`
ADD UNIQUE KEY `unique_email_per_club` (`email`, `club_id`);

-- Step 6: Add comment to document the multi-tenancy approach
ALTER TABLE `users` 
COMMENT = 'Users table with club-based multi-tenancy. Same email can exist for different clubs.';
