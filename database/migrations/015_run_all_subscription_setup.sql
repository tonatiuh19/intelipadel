-- InteliPadel Subscription System Setup
-- Run this file to set up all subscription-related tables and updates

-- 1. Create payment_methods table (if not exists)
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
  brand VARCHAR(50),
  last4 VARCHAR(4),
  exp_month INT,
  exp_year INT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_default (is_default)
);

-- 2. Add has_subscriptions column to clubs table (if not exists)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clubs' AND COLUMN_NAME = 'has_subscriptions');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE clubs ADD COLUMN has_subscriptions BOOLEAN DEFAULT FALSE', 
  'SELECT "Column has_subscriptions already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Update has_subscriptions flag for clubs that have active subscriptions
UPDATE clubs c
SET has_subscriptions = TRUE
WHERE EXISTS (
  SELECT 1 FROM club_subscriptions cs
  WHERE cs.club_id = c.id AND cs.is_active = TRUE
);

-- 4. Add stripe_customer_id to users table if not exists
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'stripe_customer_id');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255) UNIQUE', 
  'SELECT "Column stripe_customer_id already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Create indexes for better performance
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_subscriptions' AND INDEX_NAME = 'idx_user_subscriptions_user_id');
SET @sql = IF(@idx_exists = 0, 
  'CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id)', 
  'SELECT "Index idx_user_subscriptions_user_id already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_subscriptions' AND INDEX_NAME = 'idx_user_subscriptions_status');
SET @sql = IF(@idx_exists = 0, 
  'CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status)', 
  'SELECT "Index idx_user_subscriptions_status already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'club_subscriptions' AND INDEX_NAME = 'idx_club_subscriptions_club_id');
SET @sql = IF(@idx_exists = 0, 
  'CREATE INDEX idx_club_subscriptions_club_id ON club_subscriptions(club_id)', 
  'SELECT "Index idx_club_subscriptions_club_id already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'club_subscriptions' AND INDEX_NAME = 'idx_club_subscriptions_active');
SET @sql = IF(@idx_exists = 0, 
  'CREATE INDEX idx_club_subscriptions_active ON club_subscriptions(is_active)', 
  'SELECT "Index idx_club_subscriptions_active already exists" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify setup
SELECT 'Setup complete! Payment methods table created, clubs updated.' AS status;
