-- Migration: Add manual payment tracking to bookings table
-- Created: 2025-12-27

-- Check if payment_method column exists, add if not
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'bookings' 
  AND COLUMN_NAME = 'payment_method'
);

SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(20) DEFAULT ''stripe'' COMMENT ''Payment method: stripe, manual''',
  'SELECT ''Column payment_method already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if created_by_admin_id column exists, add if not
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'bookings' 
  AND COLUMN_NAME = 'created_by_admin_id'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN created_by_admin_id INT DEFAULT NULL COMMENT ''Admin ID if booking was created manually''',
  'SELECT ''Column created_by_admin_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for payment_method if it doesn't exist
SET @index_exists = (
  SELECT COUNT(*) 
  FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'bookings' 
  AND INDEX_NAME = 'idx_payment_method'
);

SET @sql = IF(@index_exists = 0,
  'ALTER TABLE bookings ADD INDEX idx_payment_method (payment_method)',
  'SELECT ''Index idx_payment_method already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint if it doesn't exist
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'bookings' 
  AND CONSTRAINT_NAME = 'fk_bookings_created_by_admin'
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE bookings ADD CONSTRAINT fk_bookings_created_by_admin FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL',
  'SELECT ''Foreign key fk_bookings_created_by_admin already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing bookings to have 'stripe' as payment method
UPDATE bookings
SET payment_method = 'stripe'
WHERE payment_method IS NULL OR payment_method = '';
