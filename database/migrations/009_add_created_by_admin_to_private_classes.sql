-- Drop foreign key constraint if exists (was added by mistake)
-- We want to track admin_id but without enforcing referential integrity
-- This allows soft tracking even if admin account is deleted

ALTER TABLE `private_classes`
DROP FOREIGN KEY IF EXISTS `fk_private_classes_created_by_admin`;

-- Ensure index exists for performance
ALTER TABLE `private_classes`
ADD INDEX IF NOT EXISTS `idx_created_by_admin` (`created_by_admin_id`);
