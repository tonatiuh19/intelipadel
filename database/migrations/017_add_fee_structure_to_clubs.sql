-- Update fee structure configuration to clubs table
-- This defines how InteliPadel's service fee (non-refundable) is charged
-- Default changed to 'club_absorbs_fee' - club absorbs the service fee by default

ALTER TABLE `clubs` 
MODIFY COLUMN `fee_structure` ENUM('user_pays_fee', 'shared_fee', 'club_absorbs_fee') 
NOT NULL DEFAULT 'club_absorbs_fee' 
COMMENT 'Fee structure: user_pays_fee = user pays full fee on top, shared_fee = 50/50 split, club_absorbs_fee = club pays fee from booking amount (DEFAULT)';

-- Update service fee percentage (default 8%)
ALTER TABLE `clubs` 
MODIFY COLUMN `service_fee_percentage` DECIMAL(5,2) 
NOT NULL DEFAULT 8.00 
COMMENT 'Service fee percentage charged by InteliPadel (e.g., 8.00 for 8%)';

-- Update timestamp for when terms were last accepted after fee structure change
ALTER TABLE `clubs` 
MODIFY COLUMN `fee_terms_accepted_at` TIMESTAMP NULL DEFAULT NULL 
COMMENT 'When admin last accepted terms after changing fee structure';
