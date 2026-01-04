-- Add color customization columns to clubs table
ALTER TABLE `clubs`
ADD COLUMN `primary_color` VARCHAR(7) DEFAULT '#ea580c' COMMENT 'Primary brand color (hex)',
ADD COLUMN `secondary_color` VARCHAR(7) DEFAULT '#fb923c' COMMENT 'Secondary brand color (hex)',
ADD COLUMN `accent_color` VARCHAR(7) DEFAULT '#fed7aa' COMMENT 'Accent color for highlights (hex)',
ADD COLUMN `text_color` VARCHAR(7) DEFAULT '#1f2937' COMMENT 'Text color (hex)',
ADD COLUMN `background_color` VARCHAR(7) DEFAULT '#ffffff' COMMENT 'Background color (hex)';
