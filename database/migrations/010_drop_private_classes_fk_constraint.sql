-- Drop the foreign key constraint on created_by_admin_id
-- This allows inserting records even if the admin ID doesn't exist in admins table
-- The column remains for audit tracking but without referential integrity

ALTER TABLE `private_classes`
DROP FOREIGN KEY `fk_private_classes_created_by_admin`;
