-- Migration: Add invoice/factura tracking to bookings table
-- Date: 2025-12-26
-- Description: Adds columns for tracking invoice requests and delivery

ALTER TABLE `bookings`
ADD COLUMN `factura_requested` TINYINT(1) DEFAULT 0 COMMENT 'Whether user has requested an invoice' AFTER `notes`,
ADD COLUMN `factura_requested_at` TIMESTAMP NULL COMMENT 'When the invoice was requested' AFTER `factura_requested`,
ADD COLUMN `factura_sent_at` TIMESTAMP NULL COMMENT 'When the invoice was sent to user' AFTER `factura_requested_at`,
ADD INDEX `idx_factura_requested` (`factura_requested`);
