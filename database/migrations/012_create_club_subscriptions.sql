-- Migration: Create club subscriptions table
-- Description: Enables clubs to create monthly subscription plans with various benefits
-- Date: 2025-12-30

CREATE TABLE IF NOT EXISTS `club_subscriptions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `club_id` INT(11) NOT NULL,
  `name` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Subscription plan name',
  `description` TEXT COLLATE utf8mb4_unicode_ci COMMENT 'Detailed description of the plan',
  `price_monthly` DECIMAL(10,2) NOT NULL COMMENT 'Monthly price in local currency',
  `currency` VARCHAR(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD' COMMENT 'Currency code (USD, EUR, etc.)',
  `stripe_product_id` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe product ID',
  `stripe_price_id` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe price ID',
  
  -- Booking benefits
  `booking_discount_percent` DECIMAL(5,2) DEFAULT NULL COMMENT 'Discount percentage on bookings (0-100)',
  `booking_credits_monthly` INT(11) DEFAULT NULL COMMENT 'Number of booking credits per month',
  
  -- Additional service discounts
  `bar_discount_percent` DECIMAL(5,2) DEFAULT NULL COMMENT 'Discount percentage on bar/restaurant (0-100)',
  `merch_discount_percent` DECIMAL(5,2) DEFAULT NULL COMMENT 'Discount percentage on merchandise/store (0-100)',
  `event_discount_percent` DECIMAL(5,2) DEFAULT NULL COMMENT 'Discount percentage on events (0-100)',
  `class_discount_percent` DECIMAL(5,2) DEFAULT NULL COMMENT 'Discount percentage on classes (0-100)',
  
  -- Custom extras
  `extras` JSON DEFAULT NULL COMMENT 'Array of custom benefits managed locally by the club',
  
  -- Status and metadata
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Whether the subscription is currently active',
  `display_order` INT(11) DEFAULT 0 COMMENT 'Order for displaying subscriptions',
  `max_subscribers` INT(11) DEFAULT NULL COMMENT 'Maximum number of subscribers (NULL = unlimited)',
  `current_subscribers` INT(11) DEFAULT 0 COMMENT 'Current number of active subscribers',
  
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_club_id` (`club_id`),
  KEY `idx_stripe_product_id` (`stripe_product_id`),
  KEY `idx_is_active` (`is_active`),
  
  CONSTRAINT `fk_club_subscriptions_club` 
    FOREIGN KEY (`club_id`) 
    REFERENCES `clubs` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create table for tracking user subscriptions
CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `subscription_id` INT(11) NOT NULL,
  `stripe_subscription_id` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe subscription ID',
  `status` ENUM('active', 'past_due', 'cancelled', 'paused') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  
  -- Credits tracking
  `credits_remaining` INT(11) DEFAULT 0 COMMENT 'Remaining booking credits for current period',
  `credits_reset_date` DATE DEFAULT NULL COMMENT 'Date when credits will reset',
  
  -- Subscription period
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `current_period_start` DATETIME DEFAULT NULL COMMENT 'Stripe subscription period start',
  `current_period_end` DATETIME DEFAULT NULL COMMENT 'Stripe subscription period end',
  `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
  
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_subscription_id` (`subscription_id`),
  KEY `idx_stripe_subscription_id` (`stripe_subscription_id`),
  KEY `idx_status` (`status`),
  
  CONSTRAINT `fk_user_subscriptions_user` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT `fk_user_subscriptions_subscription` 
    FOREIGN KEY (`subscription_id`) 
    REFERENCES `club_subscriptions` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index to clubs table to quickly check if club has subscriptions
-- Check if column exists before adding
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clubs' AND COLUMN_NAME = 'has_subscriptions');

SET @query = IF(@col_exists = 0,
  'ALTER TABLE `clubs` ADD COLUMN `has_subscriptions` TINYINT(1) DEFAULT 0 COMMENT ''Quick lookup if club offers subscriptions''',
  'SELECT ''Column has_subscriptions already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create trigger to update has_subscriptions flag
DELIMITER //

CREATE TRIGGER `update_club_has_subscriptions_insert`
AFTER INSERT ON `club_subscriptions`
FOR EACH ROW
BEGIN
  UPDATE `clubs` 
  SET `has_subscriptions` = 1 
  WHERE `id` = NEW.club_id;
END//

CREATE TRIGGER `update_club_has_subscriptions_delete`
AFTER DELETE ON `club_subscriptions`
FOR EACH ROW
BEGIN
  DECLARE sub_count INT;
  SELECT COUNT(*) INTO sub_count 
  FROM `club_subscriptions` 
  WHERE `club_id` = OLD.club_id AND `is_active` = 1;
  
  IF sub_count = 0 THEN
    UPDATE `clubs` 
    SET `has_subscriptions` = 0 
    WHERE `id` = OLD.club_id;
  END IF;
END//

CREATE TRIGGER `update_club_has_subscriptions_update`
AFTER UPDATE ON `club_subscriptions`
FOR EACH ROW
BEGIN
  DECLARE sub_count INT;
  SELECT COUNT(*) INTO sub_count 
  FROM `club_subscriptions` 
  WHERE `club_id` = NEW.club_id AND `is_active` = 1;
  
  IF sub_count > 0 THEN
    UPDATE `clubs` 
    SET `has_subscriptions` = 1 
    WHERE `id` = NEW.club_id;
  ELSE
    UPDATE `clubs` 
    SET `has_subscriptions` = 0 
    WHERE `id` = NEW.club_id;
  END IF;
END//

DELIMITER ;

-- Update current clubs to set has_subscriptions based on existing subscriptions
UPDATE `clubs` c
SET `has_subscriptions` = (
  SELECT COUNT(*) > 0
  FROM `club_subscriptions` cs
  WHERE cs.club_id = c.id AND cs.is_active = 1
);
