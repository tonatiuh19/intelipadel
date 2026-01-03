-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 03, 2026 at 05:01 PM
-- Server version: 5.7.23-23
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alanchat_intelipadel`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('super_admin','club_admin') COLLATE utf8mb4_unicode_ci DEFAULT 'club_admin',
  `club_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `name`, `phone`, `role`, `club_id`, `is_active`, `created_at`, `updated_at`, `last_login_at`) VALUES
(1, 'axgoomez@gmail.com', 'Felix Gomez', NULL, 'super_admin', 1, 1, '2025-12-22 22:29:49', '2026-01-03 02:59:42', '2026-01-03 02:59:42');

-- --------------------------------------------------------

--
-- Table structure for table `admin_sessions`
--

CREATE TABLE `admin_sessions` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `session_token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_sessions`
--

INSERT INTO `admin_sessions` (`id`, `admin_id`, `session_token`, `expires_at`, `created_at`, `last_activity_at`, `ip_address`, `user_agent`) VALUES
(1, 1, '6404c666b78b68bc399e21cbe8496ca4fe8e883de70f40620de1f5f4f5ef0791', '2026-01-03 22:59:33', '2025-12-26 21:52:50', '2026-01-03 22:59:33', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(2, 1, '2dc28ed3e9c2a7ec0e6aa71af0095a677e1f54b8fcb9449fc07750c164cc9a3f', '2025-12-26 22:01:26', '2025-12-26 22:01:25', '2025-12-26 22:01:26', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(3, 1, '4ef8174216bf77b586b0015d273d7442a3065e340e7c543fd4934c2b937f1a5d', '2025-12-26 22:09:28', '2025-12-26 22:09:27', '2025-12-26 22:09:28', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(4, 1, '06e26c9f8dde368e65faa84a76e67939afd6501870718b525bbe512fec4721f8', '2025-12-26 22:12:13', '2025-12-26 22:12:12', '2025-12-26 22:12:13', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(5, 1, '6516c6b11afcc43045aad468909ce31ca94495d2a8172664ef56100465d1e181', '2025-12-26 22:14:29', '2025-12-26 22:14:28', '2025-12-26 22:14:29', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(6, 1, '3feb41d7723eb0504ea5340ad7d9197f05cbb013db3fc835221dcb16e10077b8', '2025-12-26 22:16:52', '2025-12-26 22:16:51', '2025-12-26 22:16:52', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(7, 1, '6f7192b949720e5799efad896445e6e97128fea48c60e787901750d83841323e', '2025-12-26 22:22:44', '2025-12-26 22:22:38', '2025-12-26 22:22:44', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(8, 1, '6890630018f87d583d43ed8b0f253199177b1d729419e4b4cf876064e754fd7e', '2025-12-26 22:27:53', '2025-12-26 22:27:45', '2025-12-26 22:27:53', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(9, 1, 'aaf8b83c3b351eed19284bd6597eeb39c1f41192d00cb42419cd1f0c90278ae9', '2025-12-26 22:29:47', '2025-12-26 22:29:46', '2025-12-26 22:29:47', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(12, 1, '8e0a234fbd8908988809aaef9b2c34175aa84af1d001cb8c423ba900f5d12718', '2026-01-03 18:30:04', '2025-12-27 19:30:03', '2025-12-27 19:30:03', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(15, 1, '5da56bd6d9146eebafa6105dd8221bf26de8eb27a2586b7a4e2c9bfa7af88d9c', '2026-01-05 23:57:58', '2025-12-29 23:57:58', '2025-12-29 23:57:58', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(16, 1, 'a8621fd917c195486257aa7498f164e2c315725c892eccad2f562aa8a2eed3e9', '2026-01-10 02:59:42', '2026-01-03 02:59:42', '2026-01-03 02:59:42', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36');

-- --------------------------------------------------------

--
-- Table structure for table `auth_codes`
--

CREATE TABLE `auth_codes` (
  `id` int(11) NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blocked_slots`
--

CREATE TABLE `blocked_slots` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `court_id` int(11) DEFAULT NULL,
  `block_type` enum('maintenance','holiday','event','private_event','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `block_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_all_day` tinyint(1) DEFAULT '0',
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by_admin_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blocked_slots`
--

INSERT INTO `blocked_slots` (`id`, `club_id`, `court_id`, `block_type`, `block_date`, `start_time`, `end_time`, `is_all_day`, `reason`, `notes`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 'maintenance', '2026-02-25', '09:00:00', '13:00:00', 0, 'Court resurfacing', NULL, NULL, '2025-12-22 22:29:49', '2025-12-26 19:09:22'),
(2, 1, NULL, 'holiday', '2026-01-01', NULL, NULL, 1, 'New Year - Club Closed', NULL, NULL, '2025-12-22 22:29:49', '2025-12-26 18:52:27');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `booking_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `court_id` int(11) NOT NULL,
  `time_slot_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled','no_show') COLLATE utf8mb4_unicode_ci DEFAULT 'confirmed',
  `payment_status` enum('pending','paid','refunded','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_payment_intent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe payment intent ID for this booking',
  `booking_type` enum('single','recurring') COLLATE utf8mb4_unicode_ci DEFAULT 'single',
  `is_recurring` tinyint(1) DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `factura_requested` tinyint(1) DEFAULT '0' COMMENT 'Whether user has requested an invoice',
  `factura_requested_at` timestamp NULL DEFAULT NULL COMMENT 'When the invoice was requested',
  `factura_sent_at` timestamp NULL DEFAULT NULL COMMENT 'When the invoice was sent to user',
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_admin_id` int(11) DEFAULT NULL COMMENT 'Admin ID if booking was created manually'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_number`, `user_id`, `club_id`, `court_id`, `time_slot_id`, `booking_date`, `start_time`, `end_time`, `duration_minutes`, `total_price`, `status`, `payment_status`, `payment_method`, `stripe_payment_intent_id`, `booking_type`, `is_recurring`, `notes`, `factura_requested`, `factura_requested_at`, `factura_sent_at`, `cancellation_reason`, `cancelled_at`, `confirmed_at`, `created_at`, `updated_at`, `created_by_admin_id`) VALUES
(20, 'BK1767415796767919', 2, 1, 13, 18, '2026-01-18', '18:30:00', '19:30:00', 90, 506.00, 'confirmed', 'paid', 'card', 'pi_3SlMmeCDsJ3n85lg1qCzfNp1', 'single', 0, NULL, 0, NULL, NULL, NULL, NULL, '2026-01-03 04:49:57', '2026-01-03 04:49:57', '2026-01-03 04:49:57', NULL),
(21, 'BK1767477538013394', 2, 1, 13, 19, '2026-01-14', '11:00:00', '12:00:00', 90, 266.80, 'confirmed', 'paid', 'card', 'pi_3SlcqJCDsJ3n85lg1mPr7pvc', 'single', 0, NULL, 0, NULL, NULL, NULL, NULL, '2026-01-03 21:58:58', '2026-01-03 21:58:58', '2026-01-03 21:58:58', NULL),
(23, 'BK1767481139517438', 6, 1, 5, 21, '2026-01-23', '18:30:00', '19:30:00', 90, 638.00, 'confirmed', 'paid', 'card', 'pi_3SldmTCDsJ3n85lg00QXI9P3', 'single', 0, NULL, 0, NULL, NULL, NULL, NULL, '2026-01-03 22:58:59', '2026-01-03 22:58:59', '2026-01-03 22:58:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `clubs`
--

CREATE TABLE `clubs` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'España',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gallery` json DEFAULT NULL,
  `amenities` json DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `review_count` int(11) DEFAULT '0',
  `price_per_hour` decimal(10,2) NOT NULL,
  `default_booking_duration` int(11) NOT NULL DEFAULT '60' COMMENT 'Default booking duration in minutes (60, 90, or 120)',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'EUR',
  `is_active` tinyint(1) DEFAULT '1',
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `has_subscriptions` tinyint(1) DEFAULT '0' COMMENT 'Quick lookup if club offers subscriptions',
  `fee_structure` enum('user_pays_fee','shared_fee','club_absorbs_fee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'club_absorbs_fee' COMMENT 'Fee structure: user_pays_fee = user pays full fee on top, shared_fee = 50/50 split, club_absorbs_fee = club pays fee from booking amount (DEFAULT)',
  `service_fee_percentage` decimal(5,2) NOT NULL DEFAULT '8.00' COMMENT 'Service fee percentage charged by InteliPadel (e.g., 8.00 for 8%)',
  `fee_terms_accepted_at` timestamp NULL DEFAULT NULL COMMENT 'When admin last accepted terms after changing fee structure'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clubs`
--

INSERT INTO `clubs` (`id`, `name`, `slug`, `description`, `address`, `city`, `state`, `postal_code`, `country`, `latitude`, `longitude`, `phone`, `email`, `website`, `image_url`, `logo_url`, `gallery`, `amenities`, `rating`, `review_count`, `price_per_hour`, `default_booking_duration`, `currency`, `is_active`, `featured`, `created_at`, `updated_at`, `has_subscriptions`, `fee_structure`, `service_fee_percentage`, `fee_terms_accepted_at`) VALUES
(1, 'Club Elite Padel', 'club-elite-padel', 'Premier padel club in Madrid with state-of-the-art facilities', 'Calle del Deporte 45', 'Madrid', 'Madrid', '28001', 'España', NULL, NULL, '+34 912 345 678', 'info@elitepadel.es', NULL, 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800', 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=200&h=200&fit=crop', NULL, '[\"parking\", \"lockers\", \"showers\", \"pro_shop\", \"cafe\"]', 4.80, 234, 550.00, 90, 'MXN', 1, 0, '2025-12-22 22:29:49', '2026-01-03 20:46:41', 1, 'club_absorbs_fee', 8.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `club_cancellation_policy`
--

CREATE TABLE `club_cancellation_policy` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `version` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Cancellation policy content in HTML or markdown',
  `hours_before_cancellation` int(11) DEFAULT '24' COMMENT 'Minimum hours before booking to cancel',
  `refund_percentage` decimal(5,2) DEFAULT '100.00' COMMENT 'Percentage of refund if cancelled in time',
  `effective_date` date NOT NULL COMMENT 'Date when this policy becomes effective',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Whether this version is currently active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_cancellation_policy`
--

INSERT INTO `club_cancellation_policy` (`id`, `club_id`, `version`, `content`, `hours_before_cancellation`, `refund_percentage`, `effective_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, '1.0', '<h2>Política de Cancelación de Pádel Club Premium123</h2><h3>Cancelaciones con Reembolso Completo</h3><p>Recibirá un reembolso del 100% si cancela con al menos 24 horas de anticipación.</p><h3>Cancelaciones Tardías</h3><p>Cancelaciones con menos de 24 horas no son elegibles para reembolso.</p><h3>Proceso de Reembolso</h3><p>Los reembolsos se procesan en 5-7 días hábiles a su método de pago original.</p>', 24, 100.00, '2025-12-26', 1, '2025-12-26 20:49:30', '2025-12-31 00:28:38');

-- --------------------------------------------------------

--
-- Table structure for table `club_privacy_policy`
--

CREATE TABLE `club_privacy_policy` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `version` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Privacy policy content in HTML or markdown',
  `effective_date` date NOT NULL COMMENT 'Date when this policy becomes effective',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Whether this version is currently active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_privacy_policy`
--

INSERT INTO `club_privacy_policy` (`id`, `club_id`, `version`, `content`, `effective_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, '1.0', '<h2>Política de Privacidad de Pádel Club Premium123</h2><h3>Recopilación de Datos</h3><p>Recopilamos la siguiente información personal:</p><ul><li>Nombre y apellidos</li><li>Correo electrónico</li><li>Número de teléfono</li><li>Información de pago (procesada de forma segura por Stripe)</li></ul><h3>Uso de la Información</h3><p>Utilizamos su información para:</p><ul><li>Procesar sus reservas</li><li>Enviar confirmaciones y recordatorios</li><li>Mejorar nuestros servicios</li><li>Comunicaciones de marketing (con su consentimiento)</li></ul><h3>Protección de Datos</h3><p>Sus datos están protegidos según la LFPDPPP mexicana. No compartimos su información con terceros sin su consentimiento.</p>', '2025-12-26', 1, '2025-12-26 20:49:30', '2025-12-31 00:25:59');

-- --------------------------------------------------------

--
-- Table structure for table `club_schedules`
--

CREATE TABLE `club_schedules` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `day_of_week` tinyint(4) NOT NULL,
  `opens_at` time NOT NULL DEFAULT '08:00:00',
  `closes_at` time NOT NULL DEFAULT '23:00:00',
  `is_closed` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_schedules`
--

INSERT INTO `club_schedules` (`id`, `club_id`, `day_of_week`, `opens_at`, `closes_at`, `is_closed`) VALUES
(1, 1, 0, '08:00:00', '23:00:00', 0),
(5, 1, 1, '08:00:00', '23:00:00', 0),
(9, 1, 2, '08:00:00', '23:00:00', 0),
(13, 1, 3, '08:00:00', '23:00:00', 0),
(17, 1, 4, '08:00:00', '23:00:00', 0),
(21, 1, 5, '08:00:00', '23:00:00', 0),
(25, 1, 6, '08:00:00', '23:00:00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `club_subscriptions`
--

CREATE TABLE `club_subscriptions` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Subscription plan name',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Detailed description of the plan',
  `price_monthly` decimal(10,2) NOT NULL COMMENT 'Monthly price in local currency',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD' COMMENT 'Currency code (USD, EUR, etc.)',
  `stripe_product_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe product ID',
  `stripe_price_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe price ID',
  `booking_discount_percent` decimal(5,2) DEFAULT NULL COMMENT 'Discount percentage on bookings (0-100)',
  `booking_credits_monthly` int(11) DEFAULT NULL COMMENT 'Number of booking credits per month',
  `bar_discount_percent` decimal(5,2) DEFAULT NULL COMMENT 'Discount percentage on bar/restaurant (0-100)',
  `merch_discount_percent` decimal(5,2) DEFAULT NULL COMMENT 'Discount percentage on merchandise/store (0-100)',
  `event_discount_percent` decimal(5,2) DEFAULT NULL COMMENT 'Discount percentage on events (0-100)',
  `class_discount_percent` decimal(5,2) DEFAULT NULL COMMENT 'Discount percentage on classes (0-100)',
  `extras` json DEFAULT NULL COMMENT 'Array of custom benefits managed locally by the club',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Whether the subscription is currently active',
  `display_order` int(11) DEFAULT '0' COMMENT 'Order for displaying subscriptions',
  `max_subscribers` int(11) DEFAULT NULL COMMENT 'Maximum number of subscribers (NULL = unlimited)',
  `current_subscribers` int(11) DEFAULT '0' COMMENT 'Current number of active subscribers',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_subscriptions`
--

INSERT INTO `club_subscriptions` (`id`, `club_id`, `name`, `description`, `price_monthly`, `currency`, `stripe_product_id`, `stripe_price_id`, `booking_discount_percent`, `booking_credits_monthly`, `bar_discount_percent`, `merch_discount_percent`, `event_discount_percent`, `class_discount_percent`, `extras`, `is_active`, `display_order`, `max_subscribers`, `current_subscribers`, `created_at`, `updated_at`) VALUES
(1, 1, 'Plan Basico', 'Plan basico con beneficios chidos', 655.00, 'MXN', 'prod_TiLrX2Y7JHzTu0', 'price_1SkvGNCDsJ3n85lggIo55LXa', 5.00, NULL, 5.00, 5.00, 3.00, NULL, '[{\"id\": \"100b2c42-c146-422b-812c-ba1cc0d51b4f\", \"description\": \"Locker\"}]', 1, 0, NULL, 0, '2026-01-01 23:19:35', '2026-01-01 23:26:39'),
(2, 1, 'Plan Intermedio', 'Plan que incluye mas beneficios que el basico', 950.00, 'MXN', 'prod_TiM2JShuFhcOMq', 'price_1SkvKFCDsJ3n85lgZpvopHtu', 8.00, NULL, 8.00, 8.00, 8.00, 2.00, '[{\"id\": \"045c705f-659c-48f3-be34-6db6c73f60db\", \"description\": \"Locker\"}, {\"id\": \"6b4c9cb7-5182-459d-83ee-cdaff99d8e12\", \"description\": \"Valet Parking\"}]', 1, 1, NULL, 1, '2026-01-01 23:30:21', '2026-01-02 06:24:17');

--
-- Triggers `club_subscriptions`
--
DELIMITER $$
CREATE TRIGGER `update_club_has_subscriptions_delete` AFTER DELETE ON `club_subscriptions` FOR EACH ROW BEGIN
  DECLARE sub_count INT;
  SELECT COUNT(*) INTO sub_count 
  FROM `club_subscriptions` 
  WHERE `club_id` = OLD.club_id AND `is_active` = 1;
  
  IF sub_count = 0 THEN
    UPDATE `clubs` 
    SET `has_subscriptions` = 0 
    WHERE `id` = OLD.club_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_club_has_subscriptions_insert` AFTER INSERT ON `club_subscriptions` FOR EACH ROW BEGIN
  UPDATE `clubs` 
  SET `has_subscriptions` = 1 
  WHERE `id` = NEW.club_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_club_has_subscriptions_update` AFTER UPDATE ON `club_subscriptions` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `club_terms_conditions`
--

CREATE TABLE `club_terms_conditions` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `version` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Terms and conditions content in HTML or markdown',
  `effective_date` date NOT NULL COMMENT 'Date when these terms become effective',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Whether this version is currently active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_terms_conditions`
--

INSERT INTO `club_terms_conditions` (`id`, `club_id`, `version`, `content`, `effective_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, '1.0', '<h2>Términos y Condiciones de Pádel Club Premium321</h2><p>Bienvenido a Pádel Club Premium. Al realizar una reserva, usted acepta los siguientes términos y condiciones:</p><h3>1. Reservas</h3><ul><li>Las reservas deben realizarse con al menos 1 hora de anticipación</li><li>El pago debe completarse al momento de la reserva</li><li>Las reservas no utilizadas no serán reembolsadas sin previo aviso</li></ul><h3>2. Cancelaciones</h3><ul><li>Cancelaciones con más de 24 horas: reembolso completo</li><li>Cancelaciones con menos de 24 horas: sin reembolso</li></ul><h3>3. Normas del Club</h3><ul><li>El uso de calzado deportivo adecuado es obligatorio</li><li>Respete los horarios de inicio y fin de su reserva</li><li>Mantenga las instalaciones limpias</li></ul>', '2025-12-26', 1, '2025-12-26 20:49:30', '2025-12-31 00:26:06');

-- --------------------------------------------------------

--
-- Table structure for table `courts`
--

CREATE TABLE `courts` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `court_type` enum('indoor','outdoor','covered') COLLATE utf8mb4_unicode_ci DEFAULT 'outdoor',
  `surface_type` enum('glass','concrete','artificial_grass') COLLATE utf8mb4_unicode_ci DEFAULT 'glass',
  `has_lighting` tinyint(1) DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courts`
--

INSERT INTO `courts` (`id`, `club_id`, `name`, `court_type`, `surface_type`, `has_lighting`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Cancha 1 \"Yeti\"', 'covered', 'glass', 1, 1, 1, '2025-12-22 22:29:49', '2025-12-27 00:39:02'),
(5, 1, 'Cancha 3 \"Nestle\"', 'outdoor', 'glass', 1, 1, 2, '2025-12-22 22:29:49', '2025-12-27 00:38:01'),
(9, 1, 'Cancha 3 \"Tesla\"', 'indoor', 'glass', 1, 1, 3, '2025-12-22 22:29:49', '2025-12-27 00:32:11'),
(13, 1, 'Cancha 4', 'indoor', 'glass', 1, 1, 4, '2025-12-22 22:29:49', '2025-12-27 00:29:17');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `event_type` enum('tournament','league','clinic','social','championship') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `max_participants` int(11) DEFAULT NULL,
  `current_participants` int(11) DEFAULT '0',
  `registration_fee` decimal(10,2) DEFAULT '0.00',
  `prize_pool` decimal(10,2) DEFAULT '0.00',
  `skill_level` enum('all','beginner','intermediate','advanced','expert') COLLATE utf8mb4_unicode_ci DEFAULT 'all',
  `status` enum('draft','open','full','in_progress','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `courts_used` json DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rules` text COLLATE utf8mb4_unicode_ci,
  `organizer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organizer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `club_id`, `event_type`, `title`, `description`, `event_date`, `start_time`, `end_time`, `max_participants`, `current_participants`, `registration_fee`, `prize_pool`, `skill_level`, `status`, `courts_used`, `image_url`, `rules`, `organizer_name`, `organizer_email`, `created_at`, `updated_at`) VALUES
(1, 1, 'tournament', 'New Year Championship 2026', 'Competitive doubles tournament for all skill levels', '2026-01-10', '09:00:00', '18:00:00', 32, 2, 50.00, 1000.00, 'all', 'open', '[1, 2, 3, 4]', NULL, NULL, NULL, NULL, '2025-12-22 22:29:49', '2026-01-03 04:13:10'),
(3, 1, 'tournament', 'Torneo de Reyes', 'El mejor torneo para partir la rosca', '2026-01-06', '15:30:00', '23:00:00', 120, 3, 320.00, 3500.00, 'intermediate', 'open', '[5, 13]', NULL, NULL, NULL, NULL, '2025-12-27 19:51:03', '2026-01-03 22:18:08'),
(4, 1, 'tournament', 'Torneo del Rey', 'Ven a vivir este gran torneo', '2026-01-17', '18:00:00', '23:00:00', 45, 2, 750.00, 35000.00, 'all', 'open', '[1, 5, 13]', NULL, NULL, NULL, NULL, '2026-01-02 20:43:13', '2026-01-03 04:48:26'),
(5, 1, 'tournament', 'Torneo de la Amistad', 'El mejor evento para ahcer amigos jugando padel', '2026-02-14', '18:00:00', '23:00:00', 80, 0, 850.00, 850000.00, 'all', 'open', '[1, 5]', NULL, NULL, NULL, NULL, '2026-01-03 22:26:20', '2026-01-03 22:26:20');

-- --------------------------------------------------------

--
-- Table structure for table `event_court_schedules`
--

CREATE TABLE `event_court_schedules` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `court_id` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_court_schedules`
--

INSERT INTO `event_court_schedules` (`id`, `event_id`, `court_id`, `start_time`, `end_time`, `notes`, `created_at`) VALUES
(3, 3, 5, '15:30:00', '23:00:00', NULL, '2025-12-27 19:54:40'),
(4, 3, 13, '15:30:00', '17:00:00', NULL, '2025-12-27 19:54:40'),
(11, 4, 5, '18:00:00', '23:00:00', NULL, '2026-01-02 21:44:11'),
(12, 4, 13, '19:00:00', '21:00:00', NULL, '2026-01-02 21:44:11'),
(13, 4, 1, '18:00:00', '23:00:00', NULL, '2026-01-02 21:44:11');

-- --------------------------------------------------------

--
-- Table structure for table `event_participants`
--

CREATE TABLE `event_participants` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` enum('pending','paid','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `team_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `partner_user_id` int(11) DEFAULT NULL,
  `status` enum('registered','confirmed','withdrawn','disqualified') COLLATE utf8mb4_unicode_ci DEFAULT 'registered',
  `notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_participants`
--

INSERT INTO `event_participants` (`id`, `event_id`, `user_id`, `registration_date`, `payment_status`, `team_name`, `partner_user_id`, `status`, `notes`) VALUES
(6, 1, 2, '2026-01-03 04:13:09', 'paid', NULL, NULL, 'confirmed', NULL),
(7, 4, 2, '2026-01-03 04:48:25', 'paid', NULL, NULL, 'confirmed', NULL),
(8, 3, 2, '2026-01-03 22:18:08', 'paid', NULL, NULL, 'confirmed', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `instructors`
--

CREATE TABLE `instructors` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `specialties` json DEFAULT NULL,
  `hourly_rate` decimal(10,2) NOT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `review_count` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `instructors`
--

INSERT INTO `instructors` (`id`, `club_id`, `name`, `email`, `phone`, `bio`, `specialties`, `hourly_rate`, `avatar_url`, `rating`, `review_count`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Carlos Rodríguez', 'carlos@elitepadel.es', '+34 612 345 678', 'Professional padel coach with 10+ years experience', '[\"advanced\", \"tactics\", \"tournament_prep\"]', 60.00, NULL, 4.90, 45, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(2, 1, 'María González', 'maria@elitepadel.es', '+34 623 456 789', 'Specialized in teaching beginners and intermediate players', '[\"beginner\", \"intermediate\", \"fitness\"]', 50.00, NULL, 4.80, 38, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49');

-- --------------------------------------------------------

--
-- Table structure for table `instructor_availability`
--

CREATE TABLE `instructor_availability` (
  `id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `day_of_week` tinyint(4) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `instructor_availability`
--

INSERT INTO `instructor_availability` (`id`, `instructor_id`, `day_of_week`, `start_time`, `end_time`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '09:00:00', '17:00:00', 1, '2025-12-30 00:15:21', '2025-12-30 00:15:21');

-- --------------------------------------------------------

--
-- Table structure for table `instructor_blocked_times`
--

CREATE TABLE `instructor_blocked_times` (
  `id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `blocked_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `reason` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `club_id` int(11) DEFAULT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'EUR',
  `status` enum('draft','sent','paid','overdue','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `items` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `paid_at` timestamp NULL DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `payment_type` enum('card','paypal','bank_transfer','cash') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `card_brand` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_last4` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_exp_month` int(11) DEFAULT NULL,
  `card_exp_year` int(11) DEFAULT NULL,
  `paypal_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_last4` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_payment_method_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paypal_billing_agreement_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `user_id`, `payment_type`, `is_default`, `card_brand`, `card_last4`, `card_exp_month`, `card_exp_year`, `paypal_email`, `bank_name`, `bank_account_last4`, `stripe_payment_method_id`, `paypal_billing_agreement_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'card', 1, 'visa', '4242', 12, 2027, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-22 22:29:49', '2026-01-02 06:39:12'),
(2, 2, 'card', 0, 'visa', '4242', 2, 2027, NULL, NULL, NULL, 'pm_1Sl1jHCDsJ3n85lgoxt9En15', NULL, 1, '2026-01-02 06:20:56', '2026-01-02 06:39:12'),
(3, 2, 'card', 0, 'visa', '4242', 10, 2027, NULL, NULL, NULL, 'pm_1Sl1kTCDsJ3n85lg7HyvBW0a', NULL, 1, '2026-01-02 06:22:11', '2026-01-02 06:39:12'),
(4, 2, 'card', 1, 'visa', '4242', 10, 2027, NULL, NULL, NULL, 'pm_1Sl1mTCDsJ3n85lgILzxGRY5', NULL, 1, '2026-01-02 06:24:15', '2026-01-02 06:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int(11) NOT NULL,
  `transaction_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `club_id` int(11) DEFAULT NULL,
  `transaction_type` enum('booking','subscription','event','private_class','refund') COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `subscription_id` int(11) DEFAULT NULL,
  `event_participant_id` int(11) DEFAULT NULL,
  `private_class_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'EUR',
  `status` enum('pending','processing','completed','failed','refunded','partially_refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method_id` int(11) DEFAULT NULL,
  `payment_provider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'stripe',
  `stripe_payment_intent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_charge_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_invoice_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_refund_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_response` json DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT '0.00',
  `refund_reason` text COLLATE utf8mb4_unicode_ci,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `failure_reason` text COLLATE utf8mb4_unicode_ci,
  `failure_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `transaction_number`, `user_id`, `club_id`, `transaction_type`, `booking_id`, `subscription_id`, `event_participant_id`, `private_class_id`, `amount`, `currency`, `status`, `payment_method_id`, `payment_provider`, `stripe_payment_intent_id`, `stripe_charge_id`, `stripe_invoice_id`, `stripe_refund_id`, `provider_transaction_id`, `provider_response`, `refund_amount`, `refund_reason`, `refunded_at`, `paid_at`, `failed_at`, `failure_reason`, `failure_code`, `metadata`, `created_at`, `updated_at`) VALUES
(69, 'EVT1767413577692134', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'completed', NULL, 'stripe', 'pi_3SlMCzCDsJ3n85lg1WXLLVJW', 'ch_3SlMCzCDsJ3n85lg11FCdN40', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2026-01-03 04:13:52', NULL, NULL, NULL, '{\"event_id\": 1, \"last_sync\": \"2026-01-02 22:13:52.000000\", \"event_date\": \"2026-01-10T06:00:00.000Z\", \"event_title\": \"New Year Championship 2026\", \"stripe_status\": \"succeeded\", \"participant_id\": 6}', '2026-01-03 04:12:57', '2026-01-03 04:13:52'),
(70, 'EVT176741417731193', 2, 1, 'event', NULL, NULL, NULL, NULL, 750.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlMMfCDsJ3n85lg0QOw2okb', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 4, \"event_date\": \"2026-01-17T06:00:00.000Z\", \"event_title\": \"Torneo del Rey\"}', '2026-01-03 04:22:57', '2026-01-03 04:22:57'),
(71, 'EVT1767414424299703', 2, 1, 'event', NULL, NULL, NULL, NULL, 750.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlMQeCDsJ3n85lg0kt5iBQX', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 4, \"event_date\": \"2026-01-17T06:00:00.000Z\", \"event_title\": \"Torneo del Rey\"}', '2026-01-03 04:27:04', '2026-01-03 04:27:04'),
(72, 'EVT1767414734320265', 2, 1, 'event', NULL, NULL, NULL, NULL, 750.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlMVeCDsJ3n85lg16DHpqL4', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 4, \"event_date\": \"2026-01-17T06:00:00.000Z\", \"event_title\": \"Torneo del Rey\"}', '2026-01-03 04:32:14', '2026-01-03 04:32:14'),
(73, 'EVT1767414978426461', 2, 1, 'event', NULL, NULL, NULL, NULL, 690.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlMZaCDsJ3n85lg0KlNrPro', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 4, \"event_date\": \"2026-01-17T06:00:00.000Z\", \"event_title\": \"Torneo del Rey\"}', '2026-01-03 04:36:18', '2026-01-03 04:36:18'),
(74, 'EVT1767415237920562', 2, 1, 'event', NULL, NULL, NULL, NULL, 690.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlMdlCDsJ3n85lg1DrBQz7X', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 4, \"event_date\": \"2026-01-17T06:00:00.000Z\", \"event_title\": \"Torneo del Rey\"}', '2026-01-03 04:40:38', '2026-01-03 04:40:38'),
(75, 'EVT1767415317804920', 2, 1, 'event', NULL, NULL, NULL, NULL, 690.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlMf3CDsJ3n85lg1fHUAh1p', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 4, \"event_date\": \"2026-01-17T06:00:00.000Z\", \"event_title\": \"Torneo del Rey\"}', '2026-01-03 04:41:58', '2026-01-03 04:41:58'),
(76, 'EVT1767415696610357', 2, 1, 'event', NULL, NULL, NULL, NULL, 690.00, 'MXN', 'completed', NULL, 'stripe', 'pi_3SlMlACDsJ3n85lg0T35It7w', 'ch_3SlMlACDsJ3n85lg081cGrC5', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2026-01-03 04:48:26', NULL, NULL, NULL, '{\"event_id\": 4, \"event_date\": \"2026-01-17T06:00:00.000Z\", \"event_title\": \"Torneo del Rey\", \"participant_id\": 7}', '2026-01-03 04:48:16', '2026-01-03 04:48:26'),
(77, 'TXN1767415788090678', 2, 1, 'booking', 20, NULL, NULL, NULL, 506.00, 'MXN', 'completed', NULL, 'stripe', 'pi_3SlMmeCDsJ3n85lg1qCzfNp1', 'ch_3SlMmeCDsJ3n85lg1bbcB35q', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2026-01-03 04:49:57', NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"19:30\", \"start_time\": \"18:30\", \"booking_date\": \"2026-01-18\", \"duration_minutes\": 90}', '2026-01-03 04:49:48', '2026-01-03 04:49:57'),
(78, 'CLS1767416211280942', 2, 1, 'private_class', NULL, NULL, NULL, 6, 88.20, 'MXN', 'completed', NULL, 'stripe', 'pi_3SlMtTCDsJ3n85lg1cFIeXtA', 'ch_3SlMtTCDsJ3n85lg1DKyVxGa', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2026-01-03 04:57:02', NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"16:30\", \"class_date\": \"2026-01-19\", \"class_type\": \"individual\", \"start_time\": \"15:30\", \"instructor_id\": 1, \"duration_minutes\": 90, \"number_of_students\": 1}', '2026-01-03 04:56:51', '2026-01-03 04:57:02'),
(79, 'TXN1767473361289536', 2, 1, 'booking', NULL, NULL, NULL, NULL, 266.80, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlblFCDsJ3n85lg0z6tcBXq', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"10:30\", \"start_time\": \"09:30\", \"booking_date\": \"2026-01-11\", \"duration_minutes\": 90}', '2026-01-03 20:49:21', '2026-01-03 20:49:21'),
(80, 'TXN176747376128272', 2, 1, 'booking', NULL, NULL, NULL, NULL, 266.80, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlbrhCDsJ3n85lg1sSAwJkj', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"9:00\", \"start_time\": \"08:00\", \"booking_date\": \"2026-01-11\", \"duration_minutes\": 90}', '2026-01-03 20:56:01', '2026-01-03 20:56:01'),
(81, 'TXN1767473984718696', 2, 1, 'booking', NULL, NULL, NULL, NULL, 266.80, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlbvICDsJ3n85lg1jLPiFAB', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 9, \"end_time\": \"10:30\", \"start_time\": \"09:30\", \"booking_date\": \"2026-01-31\", \"duration_minutes\": 90}', '2026-01-03 20:59:44', '2026-01-03 20:59:44'),
(82, 'CLS1767474083893116', 2, 1, 'private_class', NULL, NULL, NULL, NULL, 88.20, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlbwtCDsJ3n85lg0QIDA1mL', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"13:30\", \"class_date\": \"2026-01-19\", \"class_type\": \"individual\", \"start_time\": \"12:30\", \"instructor_id\": 1, \"duration_minutes\": 90, \"number_of_students\": 1}', '2026-01-03 21:01:24', '2026-01-03 21:01:24'),
(83, 'EVT1767474118305496', 2, 1, 'event', NULL, NULL, NULL, NULL, 294.40, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlbxSCDsJ3n85lg03JFoTgo', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 3, \"event_date\": \"2026-01-06T06:00:00.000Z\", \"event_title\": \"Torneo de Reyes\"}', '2026-01-03 21:01:58', '2026-01-03 21:01:58'),
(84, 'TXN1767477519630922', 2, 1, 'booking', 21, NULL, NULL, NULL, 266.80, 'MXN', 'completed', NULL, 'stripe', 'pi_3SlcqJCDsJ3n85lg1mPr7pvc', 'ch_3SlcqJCDsJ3n85lg16ZFpvdZ', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2026-01-03 21:58:58', NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"12:00\", \"start_time\": \"11:00\", \"booking_date\": \"2026-01-14\", \"duration_minutes\": 90}', '2026-01-03 21:58:39', '2026-01-03 21:58:58'),
(85, 'EVT1767477928588321', 2, 1, 'event', NULL, NULL, NULL, NULL, 294.40, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlcwuCDsJ3n85lg0CdW0OoP', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 3, \"event_date\": \"2026-01-06T06:00:00.000Z\", \"event_title\": \"Torneo de Reyes\"}', '2026-01-03 22:05:28', '2026-01-03 22:05:28'),
(86, 'CLS1767477984270717', 2, 1, 'private_class', NULL, NULL, NULL, NULL, 88.20, 'MXN', 'pending', NULL, 'stripe', 'pi_3SlcxoCDsJ3n85lg0LjifNUK', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"10:30\", \"class_date\": \"2026-01-12\", \"class_type\": \"individual\", \"start_time\": \"09:30\", \"instructor_id\": 1, \"duration_minutes\": 90, \"number_of_students\": 1}', '2026-01-03 22:06:24', '2026-01-03 22:06:24'),
(87, 'EVT1767478402092422', 2, 1, 'event', NULL, NULL, NULL, NULL, 294.40, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sld4YCDsJ3n85lg0QtSXCm2', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 3, \"event_date\": \"2026-01-06T06:00:00.000Z\", \"event_title\": \"Torneo de Reyes\"}', '2026-01-03 22:13:22', '2026-01-03 22:13:22'),
(88, 'EVT1767478534964786', 2, 1, 'event', NULL, NULL, NULL, NULL, 341.50, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sld6gCDsJ3n85lg1ECCERLt', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 3, \"event_date\": \"2026-01-06T06:00:00.000Z\", \"event_title\": \"Torneo de Reyes\"}', '2026-01-03 22:15:35', '2026-01-03 22:15:35'),
(89, 'EVT1767478681229152', 2, 1, 'event', NULL, NULL, NULL, NULL, 341.50, 'MXN', 'completed', NULL, 'stripe', 'pi_3Sld93CDsJ3n85lg0Cr1wuR0', 'ch_3Sld93CDsJ3n85lg0K65gpl7', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2026-01-03 22:18:09', NULL, NULL, NULL, '{\"event_id\": 3, \"event_date\": \"2026-01-06T06:00:00.000Z\", \"event_title\": \"Torneo de Reyes\", \"participant_id\": 8}', '2026-01-03 22:18:01', '2026-01-03 22:18:09'),
(90, 'CLS1767478715541689', 2, 1, 'private_class', NULL, NULL, NULL, 7, 102.31, 'MXN', 'completed', NULL, 'stripe', 'pi_3Sld9bCDsJ3n85lg03ha2D4T', 'ch_3Sld9bCDsJ3n85lg0CEdPK1g', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2026-01-03 22:18:48', NULL, NULL, NULL, '{\"court_id\": 1, \"end_time\": \"15:00\", \"class_date\": \"2026-01-19\", \"class_type\": \"individual\", \"start_time\": \"14:00\", \"instructor_id\": 1, \"duration_minutes\": 90, \"number_of_students\": 1}', '2026-01-03 22:18:35', '2026-01-03 22:18:48'),
(92, 'TXN176748112542428', 6, 1, 'booking', 23, NULL, NULL, NULL, 638.00, 'MXN', 'completed', NULL, 'stripe', 'pi_3SldmTCDsJ3n85lg00QXI9P3', 'ch_3SldmTCDsJ3n85lg0cQNUJXV', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2026-01-03 22:59:00', NULL, NULL, NULL, '{\"court_id\": 5, \"end_time\": \"19:30\", \"start_time\": \"18:30\", \"booking_date\": \"2026-01-23\", \"duration_minutes\": 90}', '2026-01-03 22:58:45', '2026-01-03 22:59:00');

-- --------------------------------------------------------

--
-- Table structure for table `player_stats`
--

CREATE TABLE `player_stats` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_bookings` int(11) DEFAULT '0',
  `completed_bookings` int(11) DEFAULT '0',
  `cancelled_bookings` int(11) DEFAULT '0',
  `total_hours_played` decimal(10,2) DEFAULT '0.00',
  `favorite_club_id` int(11) DEFAULT NULL,
  `preferred_time_slot` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skill_level` enum('beginner','intermediate','advanced','expert') COLLATE utf8mb4_unicode_ci DEFAULT 'beginner',
  `last_played_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `player_stats`
--

INSERT INTO `player_stats` (`id`, `user_id`, `total_bookings`, `completed_bookings`, `cancelled_bookings`, `total_hours_played`, `favorite_club_id`, `preferred_time_slot`, `skill_level`, `last_played_at`, `updated_at`) VALUES
(1, 1, 0, 0, 0, 0.00, NULL, NULL, 'beginner', NULL, '2025-12-22 22:29:49');

-- --------------------------------------------------------

--
-- Table structure for table `price_rules`
--

CREATE TABLE `price_rules` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `court_id` int(11) DEFAULT NULL,
  `rule_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rule_type` enum('time_of_day','day_of_week','seasonal','special_date') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `days_of_week` json DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `price_per_hour` decimal(10,2) NOT NULL,
  `priority` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `price_rules`
--

INSERT INTO `price_rules` (`id`, `club_id`, `court_id`, `rule_name`, `rule_type`, `start_time`, `end_time`, `days_of_week`, `start_date`, `end_date`, `price_per_hour`, `priority`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'Morning Rate', 'time_of_day', '08:00:00', '14:00:00', NULL, NULL, NULL, 250.00, 1, 1, '2025-12-22 22:29:49', '2025-12-30 23:24:52'),
(2, 1, NULL, 'Afternoon/Evening Rate', 'time_of_day', '14:00:00', '23:00:00', NULL, NULL, NULL, 550.00, 1, 1, '2025-12-22 22:29:49', '2025-12-30 23:25:00');

-- --------------------------------------------------------

--
-- Table structure for table `private_classes`
--

CREATE TABLE `private_classes` (
  `id` int(11) NOT NULL,
  `booking_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `court_id` int(11) DEFAULT NULL,
  `class_type` enum('individual','group','semi_private') COLLATE utf8mb4_unicode_ci DEFAULT 'individual',
  `class_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `number_of_students` int(11) DEFAULT '1',
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled','rescheduled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` enum('pending','paid','refunded','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `focus_areas` json DEFAULT NULL,
  `student_level` enum('beginner','intermediate','advanced','expert') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `instructor_notes` text COLLATE utf8mb4_unicode_ci,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_admin_id` int(11) DEFAULT NULL COMMENT 'Admin ID if class was created manually'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `private_classes`
--

INSERT INTO `private_classes` (`id`, `booking_number`, `user_id`, `instructor_id`, `club_id`, `court_id`, `class_type`, `class_date`, `start_time`, `end_time`, `duration_minutes`, `number_of_students`, `total_price`, `status`, `payment_status`, `focus_areas`, `student_level`, `notes`, `instructor_notes`, `cancellation_reason`, `cancelled_at`, `confirmed_at`, `created_at`, `updated_at`, `created_by_admin_id`) VALUES
(6, 'PCL1767416222187934', 2, 1, 1, 13, 'individual', '2026-01-19', '15:30:00', '16:30:00', 90, 1, 88.20, 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-03 04:57:02', '2026-01-03 04:57:02', '2026-01-03 04:57:02', NULL),
(7, 'PCL1767478728064883', 2, 1, 1, 1, 'individual', '2026-01-19', '14:00:00', '15:00:00', 90, 1, 102.31, 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-03 22:18:48', '2026-01-03 22:18:48', '2026-01-03 22:18:48', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stripe_webhook_events`
--

CREATE TABLE `stripe_webhook_events` (
  `id` int(11) NOT NULL,
  `stripe_event_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_data` json NOT NULL,
  `processed` tinyint(1) DEFAULT '0',
  `processing_started_at` timestamp NULL DEFAULT NULL,
  `processing_completed_at` timestamp NULL DEFAULT NULL,
  `processing_error` text COLLATE utf8mb4_unicode_ci,
  `retry_count` int(11) DEFAULT '0',
  `api_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `plan_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'EUR',
  `billing_cycle` enum('monthly','quarterly','yearly','lifetime') COLLATE utf8mb4_unicode_ci NOT NULL,
  `trial_days` int(11) DEFAULT '0',
  `stripe_price_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_product_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `features` json DEFAULT NULL,
  `max_monthly_bookings` int(11) DEFAULT NULL,
  `booking_discount_percent` decimal(5,2) DEFAULT '0.00',
  `priority_booking_hours` int(11) DEFAULT '0',
  `guest_passes_per_month` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `club_id`, `plan_name`, `plan_slug`, `description`, `price`, `currency`, `billing_cycle`, `trial_days`, `stripe_price_id`, `stripe_product_id`, `features`, `max_monthly_bookings`, `booking_discount_percent`, `priority_booking_hours`, `guest_passes_per_month`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Basic Monthly', 'basic-monthly', 'Perfect for casual players', 29.99, 'EUR', 'monthly', 7, NULL, NULL, '[\"8_bookings_per_month\", \"5%_discount\", \"Online_booking\"]', 8, 5.00, 0, 0, 1, 0, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(2, 1, 'Premium Monthly', 'premium-monthly', 'Best for regular players', 59.99, 'EUR', 'monthly', 14, NULL, NULL, '[\"Unlimited_bookings\", \"10%_discount\", \"Priority_booking\", \"2_guest_passes\"]', NULL, 10.00, 24, 2, 1, 0, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(3, 1, 'VIP Annual', 'vip-annual', 'Ultimate membership experience', 599.99, 'EUR', 'yearly', 0, NULL, NULL, '[\"Unlimited_bookings\", \"15%_discount\", \"Priority_booking\", \"5_guest_passes\", \"Free_equipment\"]', NULL, 15.00, 48, 5, 1, 0, '2025-12-22 22:29:49', '2025-12-22 22:29:49');

-- --------------------------------------------------------

--
-- Table structure for table `time_slots`
--

CREATE TABLE `time_slots` (
  `id` int(11) NOT NULL,
  `court_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` int(11) DEFAULT '90',
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `availability_status` enum('available','booked','blocked','maintenance') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `time_slots`
--

INSERT INTO `time_slots` (`id`, `court_id`, `date`, `start_time`, `end_time`, `duration_minutes`, `price`, `is_available`, `availability_status`, `created_at`, `updated_at`) VALUES
(18, 13, '2026-01-18', '18:30:00', '19:30:00', 90, 506.00, 0, 'booked', '2026-01-03 04:49:57', '2026-01-03 04:49:57'),
(19, 13, '2026-01-14', '11:00:00', '12:00:00', 90, 266.80, 0, 'booked', '2026-01-03 21:58:58', '2026-01-03 21:58:58'),
(20, 13, '2026-01-22', '18:30:00', '19:30:00', 90, 638.00, 0, 'booked', '2026-01-03 22:51:06', '2026-01-03 22:51:06'),
(21, 5, '2026-01-23', '18:30:00', '19:30:00', 90, 638.00, 0, 'booked', '2026-01-03 22:58:59', '2026-01-03 22:58:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `club_id` int(11) DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_customer_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Users table with club-based multi-tenancy. Same email can exist for different clubs.';

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `club_id`, `email`, `name`, `phone`, `avatar_url`, `stripe_customer_id`, `is_active`, `created_at`, `updated_at`, `last_login_at`) VALUES
(1, 1, 'user@example.com', 'John Doe', NULL, NULL, NULL, 1, '2025-12-22 22:29:49', '2025-12-29 22:34:25', NULL),
(2, 1, 'axgoomez@gmail.com', 'Felix Gomez', '4741400363', NULL, 'cus_TiSdl7SUCeWxvo', 1, '2025-12-23 18:23:11', '2026-01-03 22:40:15', '2026-01-03 22:40:15'),
(6, NULL, 'tonatiuh.gom@gmail.com', 'Alex Gomez', '4741400363', NULL, NULL, 1, '2026-01-03 22:58:07', '2026-01-03 22:58:25', '2026-01-03 22:58:25');

-- --------------------------------------------------------

--
-- Table structure for table `users_sessions`
--

CREATE TABLE `users_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_code` int(6) NOT NULL,
  `user_session` tinyint(1) DEFAULT '0',
  `user_session_date_start` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users_sessions`
--

INSERT INTO `users_sessions` (`id`, `user_id`, `session_code`, `user_session`, `user_session_date_start`, `created_at`, `expires_at`, `ip_address`, `user_agent`) VALUES
(18, 2, 966419, 1, '2026-01-03 22:40:02', '2026-01-03 22:40:02', NULL, NULL, NULL),
(21, 6, 925443, 1, '2026-01-03 22:58:08', '2026-01-03 22:58:08', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `subscription_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stripe_subscription_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','trial','past_due','cancelled','expired') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `current_period_start` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `current_period_end` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `cancel_at_period_end` tinyint(1) DEFAULT '0',
  `bookings_used_this_month` int(11) DEFAULT '0',
  `guest_passes_used_this_month` int(11) DEFAULT '0',
  `auto_renew` tinyint(1) DEFAULT '1',
  `payment_method_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_subscriptions`
--

INSERT INTO `user_subscriptions` (`id`, `user_id`, `club_id`, `plan_id`, `subscription_number`, `stripe_subscription_id`, `status`, `started_at`, `trial_ends_at`, `current_period_start`, `current_period_end`, `cancelled_at`, `cancellation_reason`, `cancel_at_period_end`, `bookings_used_this_month`, `guest_passes_used_this_month`, `auto_renew`, `payment_method_id`, `created_at`, `updated_at`) VALUES
(2, 2, 1, 2, 'SUB-1767335057513-2', 'sub_1Sl1mVCDsJ3n85lgGxX3apqo', 'active', '2026-01-02 22:35:55', NULL, '2026-01-02 06:24:17', '2026-02-02 06:24:17', NULL, NULL, 0, 0, 0, 1, NULL, '2026-01-02 06:24:17', '2026-01-02 22:35:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_admins_club_id` (`club_id`);

--
-- Indexes for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `expires_at` (`expires_at`),
  ADD KEY `idx_admin_sessions_token_expires` (`session_token`,`expires_at`);

--
-- Indexes for table `auth_codes`
--
ALTER TABLE `auth_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email_code` (`email`,`code`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `blocked_slots`
--
ALTER TABLE `blocked_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by_admin_id` (`created_by_admin_id`),
  ADD KEY `idx_club_date` (`club_id`,`block_date`),
  ADD KEY `idx_court_date` (`court_id`,`block_date`),
  ADD KEY `idx_type` (`block_type`),
  ADD KEY `idx_blocked_slots_club_id` (`club_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_number` (`booking_number`),
  ADD KEY `court_id` (`court_id`),
  ADD KEY `time_slot_id` (`time_slot_id`),
  ADD KEY `idx_booking_number` (`booking_number`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_club_date` (`club_id`,`booking_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_date_range` (`booking_date`,`start_time`),
  ADD KEY `idx_stripe_payment_intent` (`stripe_payment_intent_id`),
  ADD KEY `idx_factura_requested` (`factura_requested`),
  ADD KEY `idx_bookings_club_id` (`club_id`),
  ADD KEY `idx_payment_method` (`payment_method`),
  ADD KEY `fk_bookings_created_by_admin` (`created_by_admin_id`);

--
-- Indexes for table `clubs`
--
ALTER TABLE `clubs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_city` (`city`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_featured` (`featured`);

--
-- Indexes for table `club_cancellation_policy`
--
ALTER TABLE `club_cancellation_policy`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_club_cancellation` (`club_id`,`is_active`),
  ADD KEY `idx_effective_date` (`effective_date`),
  ADD KEY `idx_club_cancellation_version` (`club_id`,`version`);

--
-- Indexes for table `club_privacy_policy`
--
ALTER TABLE `club_privacy_policy`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_club_privacy` (`club_id`,`is_active`),
  ADD KEY `idx_effective_date` (`effective_date`),
  ADD KEY `idx_club_privacy_version` (`club_id`,`version`);

--
-- Indexes for table `club_schedules`
--
ALTER TABLE `club_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_club_day` (`club_id`,`day_of_week`),
  ADD KEY `idx_club_id` (`club_id`);

--
-- Indexes for table `club_subscriptions`
--
ALTER TABLE `club_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_stripe_product_id` (`stripe_product_id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_club_subscriptions_club_id` (`club_id`),
  ADD KEY `idx_club_subscriptions_active` (`is_active`);

--
-- Indexes for table `club_terms_conditions`
--
ALTER TABLE `club_terms_conditions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_club_terms` (`club_id`,`is_active`),
  ADD KEY `idx_effective_date` (`effective_date`),
  ADD KEY `idx_club_terms_version` (`club_id`,`version`);

--
-- Indexes for table `courts`
--
ALTER TABLE `courts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_courts_club_id` (`club_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_event_date` (`event_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_type` (`event_type`),
  ADD KEY `idx_events_date_status` (`event_date`,`status`),
  ADD KEY `idx_events_club_id` (`club_id`);

--
-- Indexes for table `event_court_schedules`
--
ALTER TABLE `event_court_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_court_schedules_event_id` (`event_id`),
  ADD KEY `idx_event_court_schedules_court_id` (`court_id`),
  ADD KEY `idx_event_court_schedules_times` (`start_time`,`end_time`);

--
-- Indexes for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_event_user` (`event_id`,`user_id`),
  ADD KEY `partner_user_id` (`partner_user_id`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_event_participants_event_id` (`event_id`),
  ADD KEY `idx_event_participants_user_id` (`user_id`),
  ADD KEY `idx_event_participants_status` (`payment_status`,`status`);

--
-- Indexes for table `instructors`
--
ALTER TABLE `instructors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `instructor_availability`
--
ALTER TABLE `instructor_availability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_instructor_day` (`instructor_id`,`day_of_week`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `instructor_blocked_times`
--
ALTER TABLE `instructor_blocked_times`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_instructor_date` (`instructor_id`,`blocked_date`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_invoice_date` (`invoice_date`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_default` (`is_default`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_number` (`transaction_number`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `event_participant_id` (`event_participant_id`),
  ADD KEY `private_class_id` (`private_class_id`),
  ADD KEY `payment_method_id` (`payment_method_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_type` (`transaction_type`),
  ADD KEY `idx_stripe_payment_intent` (`stripe_payment_intent_id`),
  ADD KEY `idx_stripe_charge` (`stripe_charge_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `player_stats`
--
ALTER TABLE `player_stats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `price_rules`
--
ALTER TABLE `price_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `court_id` (`court_id`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `private_classes`
--
ALTER TABLE `private_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_number` (`booking_number`),
  ADD KEY `court_id` (`court_id`),
  ADD KEY `idx_booking_number` (`booking_number`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_instructor_id` (`instructor_id`),
  ADD KEY `idx_club_date` (`club_id`,`class_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_by_admin` (`created_by_admin_id`);

--
-- Indexes for table `stripe_webhook_events`
--
ALTER TABLE `stripe_webhook_events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stripe_event_id` (`stripe_event_id`),
  ADD KEY `idx_stripe_event` (`stripe_event_id`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_processed` (`processed`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_club_slug` (`club_id`,`plan_slug`),
  ADD UNIQUE KEY `stripe_price_id` (`stripe_price_id`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_stripe_price` (`stripe_price_id`);

--
-- Indexes for table `time_slots`
--
ALTER TABLE `time_slots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_court_slot` (`court_id`,`date`,`start_time`),
  ADD KEY `idx_court_date` (`court_id`,`date`),
  ADD KEY `idx_availability` (`is_available`,`availability_status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stripe_customer_id` (`stripe_customer_id`),
  ADD UNIQUE KEY `unique_email_per_club` (`email`,`club_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_stripe_customer` (`stripe_customer_id`),
  ADD KEY `idx_users_club_id` (`club_id`);

--
-- Indexes for table `users_sessions`
--
ALTER TABLE `users_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_session_code` (`session_code`),
  ADD KEY `idx_active_sessions` (`user_id`,`user_session`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscription_number` (`subscription_number`),
  ADD UNIQUE KEY `stripe_subscription_id` (`stripe_subscription_id`),
  ADD UNIQUE KEY `unique_user_club_active` (`user_id`,`club_id`,`status`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_club_id` (`club_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_period_end` (`current_period_end`),
  ADD KEY `idx_stripe_subscription` (`stripe_subscription_id`),
  ADD KEY `idx_user_subscriptions_user_id` (`user_id`),
  ADD KEY `idx_user_subscriptions_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `auth_codes`
--
ALTER TABLE `auth_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `blocked_slots`
--
ALTER TABLE `blocked_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `clubs`
--
ALTER TABLE `clubs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `club_cancellation_policy`
--
ALTER TABLE `club_cancellation_policy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `club_privacy_policy`
--
ALTER TABLE `club_privacy_policy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `club_schedules`
--
ALTER TABLE `club_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `club_subscriptions`
--
ALTER TABLE `club_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `club_terms_conditions`
--
ALTER TABLE `club_terms_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `courts`
--
ALTER TABLE `courts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `event_court_schedules`
--
ALTER TABLE `event_court_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `event_participants`
--
ALTER TABLE `event_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `instructors`
--
ALTER TABLE `instructors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `instructor_availability`
--
ALTER TABLE `instructor_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `instructor_blocked_times`
--
ALTER TABLE `instructor_blocked_times`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `player_stats`
--
ALTER TABLE `player_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `price_rules`
--
ALTER TABLE `price_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `private_classes`
--
ALTER TABLE `private_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stripe_webhook_events`
--
ALTER TABLE `stripe_webhook_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `time_slots`
--
ALTER TABLE `time_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users_sessions`
--
ALTER TABLE `users_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  ADD CONSTRAINT `admin_sessions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blocked_slots`
--
ALTER TABLE `blocked_slots`
  ADD CONSTRAINT `blocked_slots_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blocked_slots_ibfk_2` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blocked_slots_ibfk_3` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bookings_created_by_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `club_cancellation_policy`
--
ALTER TABLE `club_cancellation_policy`
  ADD CONSTRAINT `fk_club_cancellation_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `club_privacy_policy`
--
ALTER TABLE `club_privacy_policy`
  ADD CONSTRAINT `fk_club_privacy_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `club_schedules`
--
ALTER TABLE `club_schedules`
  ADD CONSTRAINT `club_schedules_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `club_subscriptions`
--
ALTER TABLE `club_subscriptions`
  ADD CONSTRAINT `fk_club_subscriptions_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `club_terms_conditions`
--
ALTER TABLE `club_terms_conditions`
  ADD CONSTRAINT `fk_club_terms_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courts`
--
ALTER TABLE `courts`
  ADD CONSTRAINT `courts_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_court_schedules`
--
ALTER TABLE `event_court_schedules`
  ADD CONSTRAINT `event_court_schedules_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_court_schedules_ibfk_2` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_participants_ibfk_3` FOREIGN KEY (`partner_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `instructors`
--
ALTER TABLE `instructors`
  ADD CONSTRAINT `instructors_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `instructor_availability`
--
ALTER TABLE `instructor_availability`
  ADD CONSTRAINT `instructor_availability_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `instructor_blocked_times`
--
ALTER TABLE `instructor_blocked_times`
  ADD CONSTRAINT `instructor_blocked_times_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD CONSTRAINT `payment_methods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_transactions_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_transactions_ibfk_4` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_transactions_ibfk_5` FOREIGN KEY (`event_participant_id`) REFERENCES `event_participants` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_transactions_ibfk_6` FOREIGN KEY (`private_class_id`) REFERENCES `private_classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_transactions_ibfk_7` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `player_stats`
--
ALTER TABLE `player_stats`
  ADD CONSTRAINT `player_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `price_rules`
--
ALTER TABLE `price_rules`
  ADD CONSTRAINT `price_rules_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `price_rules_ibfk_2` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `private_classes`
--
ALTER TABLE `private_classes`
  ADD CONSTRAINT `private_classes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `private_classes_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `private_classes_ibfk_3` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `private_classes_ibfk_4` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD CONSTRAINT `subscription_plans_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `time_slots`
--
ALTER TABLE `time_slots`
  ADD CONSTRAINT `time_slots_ibfk_1` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_club_id` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users_sessions`
--
ALTER TABLE `users_sessions`
  ADD CONSTRAINT `users_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_subscriptions_ibfk_3` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`);

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`root`@`localhost` EVENT `cleanup_expired_sessions` ON SCHEDULE EVERY 1 HOUR STARTS '2025-12-23 12:25:02' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM users_sessions 
  WHERE expires_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
