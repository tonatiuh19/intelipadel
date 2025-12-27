-- Migration: Add club logo field and ensure club-admin restrictions
-- Created: 2025-01-XX
-- Description: Adds logo_url to clubs table and ensures proper indexing for club-specific admin access

-- NOTE: Run these queries first to check what already exists:
-- SHOW INDEX FROM `clubs` WHERE Key_name = 'logo_url';
-- SHOW INDEX FROM `admins` WHERE Key_name = 'idx_admins_club_id';
-- SHOW INDEX FROM `bookings` WHERE Key_name = 'idx_bookings_club_id';
-- SHOW INDEX FROM `courts` WHERE Key_name = 'idx_courts_club_id';
-- SHOW INDEX FROM `blocked_court_slots` WHERE Key_name = 'idx_blocked_slots_club_id';

-- Add logo_url column to clubs table (separate from image_url)
-- Skip if column already exists
SET @dbname = DATABASE();
SET @tablename = 'clubs';
SET @columnname = 'logo_url';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `image_url`;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index on admins.club_id for faster filtering
SET @tablename = 'admins';
SET @indexname = 'idx_admins_club_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1', -- Index exists, do nothing
  CONCAT('ALTER TABLE `', @tablename, '` ADD INDEX `', @indexname, '` (`club_id`);')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index on bookings.club_id
SET @tablename = 'bookings';
SET @indexname = 'idx_bookings_club_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD INDEX `', @indexname, '` (`club_id`);')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index on courts.club_id
SET @tablename = 'courts';
SET @indexname = 'idx_courts_club_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD INDEX `', @indexname, '` (`club_id`);')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index on blocked_slots.club_id
SET @tablename = 'blocked_slots';
SET @indexname = 'idx_blocked_slots_club_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD INDEX `', @indexname, '` (`club_id`);')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Update sample data: Add logo URLs for existing clubs
UPDATE `clubs` 
SET `logo_url` = 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=200&h=200&fit=crop'
WHERE `id` = 1 AND `logo_url` IS NULL;

UPDATE `clubs` 
SET `logo_url` = 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&h=200&fit=crop'
WHERE `id` = 2 AND `logo_url` IS NULL;

UPDATE `clubs` 
SET `logo_url` = 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=200&h=200&fit=crop'
WHERE `id` = 3 AND `logo_url` IS NULL;

UPDATE `clubs` 
SET `logo_url` = 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=200&h=200&fit=crop'
WHERE `id` = 4 AND `logo_url` IS NULL;
