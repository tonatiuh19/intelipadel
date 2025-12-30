-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 29, 2025 at 08:21 PM
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
(1, 'axgoomez@gmail.com', 'Felix Gomez', NULL, 'super_admin', 1, 1, '2025-12-22 22:29:49', '2025-12-29 23:57:58', '2025-12-29 23:57:58');

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
(1, 1, '6404c666b78b68bc399e21cbe8496ca4fe8e883de70f40620de1f5f4f5ef0791', '2025-12-30 02:13:49', '2025-12-26 21:52:50', '2025-12-30 02:13:49', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(2, 1, '2dc28ed3e9c2a7ec0e6aa71af0095a677e1f54b8fcb9449fc07750c164cc9a3f', '2025-12-26 22:01:26', '2025-12-26 22:01:25', '2025-12-26 22:01:26', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(3, 1, '4ef8174216bf77b586b0015d273d7442a3065e340e7c543fd4934c2b937f1a5d', '2025-12-26 22:09:28', '2025-12-26 22:09:27', '2025-12-26 22:09:28', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(4, 1, '06e26c9f8dde368e65faa84a76e67939afd6501870718b525bbe512fec4721f8', '2025-12-26 22:12:13', '2025-12-26 22:12:12', '2025-12-26 22:12:13', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(5, 1, '6516c6b11afcc43045aad468909ce31ca94495d2a8172664ef56100465d1e181', '2025-12-26 22:14:29', '2025-12-26 22:14:28', '2025-12-26 22:14:29', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(6, 1, '3feb41d7723eb0504ea5340ad7d9197f05cbb013db3fc835221dcb16e10077b8', '2025-12-26 22:16:52', '2025-12-26 22:16:51', '2025-12-26 22:16:52', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(7, 1, '6f7192b949720e5799efad896445e6e97128fea48c60e787901750d83841323e', '2025-12-26 22:22:44', '2025-12-26 22:22:38', '2025-12-26 22:22:44', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(8, 1, '6890630018f87d583d43ed8b0f253199177b1d729419e4b4cf876064e754fd7e', '2025-12-26 22:27:53', '2025-12-26 22:27:45', '2025-12-26 22:27:53', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(9, 1, 'aaf8b83c3b351eed19284bd6597eeb39c1f41192d00cb42419cd1f0c90278ae9', '2025-12-26 22:29:47', '2025-12-26 22:29:46', '2025-12-26 22:29:47', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(12, 1, '8e0a234fbd8908988809aaef9b2c34175aa84af1d001cb8c423ba900f5d12718', '2026-01-03 18:30:04', '2025-12-27 19:30:03', '2025-12-27 19:30:03', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(15, 1, '5da56bd6d9146eebafa6105dd8221bf26de8eb27a2586b7a4e2c9bfa7af88d9c', '2026-01-05 23:57:58', '2025-12-29 23:57:58', '2025-12-29 23:57:58', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36');

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

--
-- Dumping data for table `auth_codes`
--

INSERT INTO `auth_codes` (`id`, `email`, `code`, `user_type`, `expires_at`, `is_used`, `created_at`) VALUES
(22, 'axgoomez@gmail.com', '336864', 'admin', '2025-12-29 23:57:58', 1, '2025-12-29 23:57:28');

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
(2, 1, NULL, 'holiday', '2026-01-01', NULL, NULL, 1, 'New Year - Club Closed', NULL, NULL, '2025-12-22 22:29:49', '2025-12-26 18:52:27'),
(3, 2, 2, 'maintenance', '2026-01-06', '08:00:00', '12:00:00', 0, 'Glass panel replacement', NULL, NULL, '2025-12-22 22:29:49', '2025-12-26 19:06:36');

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
(3, 'BK1766778360951457', 2, 1, 13, 2, '2025-12-28', '10:00:00', '11:00:00', 60, 45.00, 'confirmed', 'paid', 'card', NULL, 'single', 0, NULL, 1, '2025-12-26 20:07:59', NULL, NULL, NULL, '2025-12-26 19:46:01', '2025-12-26 19:46:01', '2025-12-26 20:07:59', NULL),
(4, 'BK1766778754513559', 2, 1, 5, 3, '2025-12-28', '09:00:00', '10:00:00', 60, 45.00, 'confirmed', 'paid', 'card', 'pi_3Sih3VCDsJ3n85lg0zGGh6PU', 'single', 0, NULL, 0, NULL, NULL, NULL, NULL, '2025-12-26 19:52:34', '2025-12-26 19:52:34', '2025-12-26 19:52:34', NULL),
(5, 'BK1766781405527755', 2, 1, 13, 4, '2025-12-28', '22:00:00', '23:00:00', 60, 45.00, 'confirmed', 'paid', 'card', 'pi_3SihkQCDsJ3n85lg0c7KlutU', 'single', 0, NULL, 0, NULL, NULL, NULL, NULL, '2025-12-26 20:36:45', '2025-12-26 20:36:45', '2025-12-26 20:36:45', NULL),
(8, 'BK1766873186483', 3, 1, 13, 6, '2026-01-06', '08:00:00', '09:00:00', 60, 0.00, 'confirmed', 'paid', 'manual', NULL, 'single', 0, NULL, 0, NULL, NULL, NULL, NULL, '2025-12-27 22:06:26', '2025-12-27 22:06:26', '2025-12-29 22:47:44', 1),
(9, 'BK1766873598308', 3, 1, 9, 7, '2026-01-06', '09:00:00', '10:00:00', 60, 950.00, 'confirmed', 'paid', 'manual', NULL, 'single', 0, NULL, 0, NULL, NULL, NULL, NULL, '2025-12-27 22:13:18', '2025-12-27 22:13:18', '2025-12-27 22:13:18', 1),
(10, 'BK1766957552996', 2, 1, 5, 8, '2025-12-28', '15:00:00', '16:00:00', 60, 550.00, 'confirmed', 'paid', 'manual', NULL, 'single', 0, NULL, 0, NULL, NULL, NULL, NULL, '2025-12-28 21:32:33', '2025-12-28 21:32:33', '2025-12-28 21:32:33', 1),
(11, 'BK1767048846907', 3, 1, 9, 9, '2026-01-09', '08:00:00', '09:00:00', 60, 800.00, 'confirmed', 'paid', 'manual', NULL, 'single', 0, NULL, 0, NULL, NULL, NULL, NULL, '2025-12-29 22:54:07', '2025-12-29 22:54:07', '2025-12-29 22:54:07', 1);

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
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'EUR',
  `is_active` tinyint(1) DEFAULT '1',
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clubs`
--

INSERT INTO `clubs` (`id`, `name`, `slug`, `description`, `address`, `city`, `state`, `postal_code`, `country`, `latitude`, `longitude`, `phone`, `email`, `website`, `image_url`, `logo_url`, `gallery`, `amenities`, `rating`, `review_count`, `price_per_hour`, `currency`, `is_active`, `featured`, `created_at`, `updated_at`) VALUES
(1, 'Club Elite Padel', 'club-elite-padel', 'Premier padel club in Madrid with state-of-the-art facilities', 'Calle del Deporte 45', 'Madrid', 'Madrid', '28001', 'España', NULL, NULL, '+34 912 345 678', 'info@elitepadel.es', NULL, 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800', 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=200&h=200&fit=crop', NULL, '[\"parking\", \"lockers\", \"showers\", \"pro_shop\", \"cafe\"]', 4.80, 234, 45.00, 'EUR', 1, 0, '2025-12-22 22:29:49', '2025-12-26 21:36:37'),
(2, 'Padel Barcelona Center', 'padel-barcelona-center', 'Modern padel facility in the heart of Barcelona', 'Avinguda Diagonal 123', 'Barcelona', 'Barcelona', '08019', 'España', NULL, NULL, '+34 933 456 789', 'contact@barcapadel.es', NULL, 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&h=200&fit=crop', NULL, '[\"parking\", \"lockers\", \"showers\", \"cafe\"]', 4.70, 189, 42.00, 'EUR', 1, 0, '2025-12-22 22:29:49', '2025-12-26 21:36:37'),
(3, 'Valencia Padel Club', 'valencia-padel-club', 'Premium outdoor courts with ocean views', 'Carrer de la Mar 89', 'Valencia', 'Valencia', '46001', 'España', NULL, NULL, '+34 963 567 890', 'hello@valenciapadel.es', NULL, 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=800', 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=200&h=200&fit=crop', NULL, '[\"parking\", \"showers\", \"pro_shop\", \"cafe\"]', 4.90, 312, 40.00, 'EUR', 1, 0, '2025-12-22 22:29:49', '2025-12-26 21:36:37'),
(4, 'Sevilla Sports Complex', 'sevilla-sports-complex', 'Multi-sport facility with excellent padel courts', 'Avenida de la Constitución 56', 'Sevilla', 'Sevilla', '41001', 'España', NULL, NULL, '+34 954 678 901', 'info@sevillapadel.es', NULL, 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800', 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=200&h=200&fit=crop', NULL, '[\"parking\", \"lockers\", \"showers\"]', 4.60, 156, 38.00, 'EUR', 1, 0, '2025-12-22 22:29:49', '2025-12-26 21:36:37');

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
(1, 1, '1.0', '<h2>Política de Cancelación de Pádel Club Premium</h2>\r\n<h3>Cancelaciones con Reembolso Completo</h3>\r\n<p>Recibirá un reembolso del 100% si cancela con al menos 24 horas de anticipación.</p>\r\n<h3>Cancelaciones Tardías</h3>\r\n<p>Cancelaciones con menos de 24 horas no son elegibles para reembolso.</p>\r\n<h3>Proceso de Reembolso</h3>\r\n<p>Los reembolsos se procesan en 5-7 días hábiles a su método de pago original.</p>', 24, 100.00, '2025-12-26', 1, '2025-12-26 20:49:30', '2025-12-26 20:49:30'),
(2, 2, '1.0', '<h2>Política de Cancelación de Pádel Arena</h2>\r\n<h3>Términos de Cancelación</h3>\r\n<ul>\r\n  <li>Más de 24 horas: Reembolso completo</li>\r\n  <li>12-24 horas: Reembolso del 50%</li>\r\n  <li>Menos de 12 horas: Sin reembolso</li>\r\n</ul>\r\n<h3>Cómo Cancelar</h3>\r\n<p>Puede cancelar desde su cuenta en la sección \"Mis Reservas\".</p>', 24, 100.00, '2025-12-26', 1, '2025-12-26 20:49:30', '2025-12-26 20:49:30');

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
(1, 1, '1.0', '<h2>Política de Privacidad de Pádel Club Premium</h2>\r\n<h3>Recopilación de Datos</h3>\r\n<p>Recopilamos la siguiente información personal:</p>\r\n<ul>\r\n  <li>Nombre y apellidos</li>\r\n  <li>Correo electrónico</li>\r\n  <li>Número de teléfono</li>\r\n  <li>Información de pago (procesada de forma segura por Stripe)</li>\r\n</ul>\r\n<h3>Uso de la Información</h3>\r\n<p>Utilizamos su información para:</p>\r\n<ul>\r\n  <li>Procesar sus reservas</li>\r\n  <li>Enviar confirmaciones y recordatorios</li>\r\n  <li>Mejorar nuestros servicios</li>\r\n  <li>Comunicaciones de marketing (con su consentimiento)</li>\r\n</ul>\r\n<h3>Protección de Datos</h3>\r\n<p>Sus datos están protegidos según la LFPDPPP mexicana. No compartimos su información con terceros sin su consentimiento.</p>', '2025-12-26', 1, '2025-12-26 20:49:30', '2025-12-26 20:49:30'),
(2, 2, '1.0', '<h2>Política de Privacidad de Pádel Arena</h2>\r\n<h3>Información que Recopilamos</h3>\r\n<p>Recopilamos datos necesarios para brindar nuestros servicios:</p>\r\n<ul>\r\n  <li>Datos de contacto (nombre, email, teléfono)</li>\r\n  <li>Historial de reservas</li>\r\n  <li>Preferencias de juego</li>\r\n</ul>\r\n<h3>Derechos del Usuario</h3>\r\n<p>Usted tiene derecho a:</p>\r\n<ul>\r\n  <li>Acceder a sus datos personales</li>\r\n  <li>Rectificar información incorrecta</li>\r\n  <li>Solicitar la eliminación de sus datos</li>\r\n  <li>Oponerse al procesamiento de sus datos</li>\r\n</ul>\r\n<h3>Contacto</h3>\r\n<p>Para ejercer sus derechos, contáctenos en privacy@padelarena.com</p>', '2025-12-26', 1, '2025-12-26 20:49:30', '2025-12-26 20:49:30');

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
(2, 2, 0, '08:00:00', '23:00:00', 0),
(3, 3, 0, '08:00:00', '23:00:00', 0),
(4, 4, 0, '08:00:00', '23:00:00', 0),
(5, 1, 1, '08:00:00', '23:00:00', 0),
(6, 2, 1, '08:00:00', '23:00:00', 0),
(7, 3, 1, '08:00:00', '23:00:00', 0),
(8, 4, 1, '08:00:00', '23:00:00', 0),
(9, 1, 2, '08:00:00', '23:00:00', 0),
(10, 2, 2, '08:00:00', '23:00:00', 0),
(11, 3, 2, '08:00:00', '23:00:00', 0),
(12, 4, 2, '08:00:00', '23:00:00', 0),
(13, 1, 3, '08:00:00', '23:00:00', 0),
(14, 2, 3, '08:00:00', '23:00:00', 0),
(15, 3, 3, '08:00:00', '23:00:00', 0),
(16, 4, 3, '08:00:00', '23:00:00', 0),
(17, 1, 4, '08:00:00', '23:00:00', 0),
(18, 2, 4, '08:00:00', '23:00:00', 0),
(19, 3, 4, '08:00:00', '23:00:00', 0),
(20, 4, 4, '08:00:00', '23:00:00', 0),
(21, 1, 5, '08:00:00', '23:00:00', 0),
(22, 2, 5, '08:00:00', '23:00:00', 0),
(23, 3, 5, '08:00:00', '23:00:00', 0),
(24, 4, 5, '08:00:00', '23:00:00', 0),
(25, 1, 6, '08:00:00', '23:00:00', 0),
(26, 2, 6, '08:00:00', '23:00:00', 0),
(27, 3, 6, '08:00:00', '23:00:00', 0),
(28, 4, 6, '08:00:00', '23:00:00', 0);

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
(1, 1, '1.0', '<h2>Términos y Condiciones de Pádel Club Premium</h2>\r\n<p>Bienvenido a Pádel Club Premium. Al realizar una reserva, usted acepta los siguientes términos y condiciones:</p>\r\n<h3>1. Reservas</h3>\r\n<ul>\r\n  <li>Las reservas deben realizarse con al menos 1 hora de anticipación</li>\r\n  <li>El pago debe completarse al momento de la reserva</li>\r\n  <li>Las reservas no utilizadas no serán reembolsadas sin previo aviso</li>\r\n</ul>\r\n<h3>2. Cancelaciones</h3>\r\n<ul>\r\n  <li>Cancelaciones con más de 24 horas: reembolso completo</li>\r\n  <li>Cancelaciones con menos de 24 horas: sin reembolso</li>\r\n</ul>\r\n<h3>3. Normas del Club</h3>\r\n<ul>\r\n  <li>El uso de calzado deportivo adecuado es obligatorio</li>\r\n  <li>Respete los horarios de inicio y fin de su reserva</li>\r\n  <li>Mantenga las instalaciones limpias</li>\r\n</ul>', '2025-12-26', 1, '2025-12-26 20:49:30', '2025-12-26 20:49:30'),
(2, 2, '1.0', '<h2>Términos y Condiciones de Pádel Arena</h2>\r\n<p>Al utilizar las instalaciones de Pádel Arena, usted acepta cumplir con estos términos:</p>\r\n<h3>1. Uso de Instalaciones</h3>\r\n<ul>\r\n  <li>Las canchas deben ser reservadas con anticipación</li>\r\n  <li>El tiempo de juego incluye el tiempo de preparación</li>\r\n  <li>No se permite el ingreso de mascotas</li>\r\n</ul>\r\n<h3>2. Responsabilidad</h3>\r\n<ul>\r\n  <li>Los usuarios son responsables de su propia seguridad</li>\r\n  <li>El club no se hace responsable por objetos personales perdidos</li>\r\n</ul>', '2025-12-26', 1, '2025-12-26 20:49:30', '2025-12-26 20:49:30');

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
(2, 2, 'Court 1', 'indoor', 'glass', 1, 1, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(3, 3, 'Court 1', 'indoor', 'glass', 1, 1, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(4, 4, 'Court 1', 'indoor', 'glass', 1, 1, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(5, 1, 'Cancha 3 \"Nestle\"', 'outdoor', 'glass', 1, 1, 2, '2025-12-22 22:29:49', '2025-12-27 00:38:01'),
(6, 2, 'Court 2', 'indoor', 'glass', 1, 1, 2, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(7, 3, 'Court 2', 'indoor', 'glass', 1, 1, 2, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(8, 4, 'Court 2', 'indoor', 'glass', 1, 1, 2, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(9, 1, 'Cancha 3 \"Tesla\"', 'indoor', 'glass', 1, 1, 3, '2025-12-22 22:29:49', '2025-12-27 00:32:11'),
(10, 2, 'Court 3', 'outdoor', 'glass', 1, 1, 3, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(11, 3, 'Court 3', 'outdoor', 'glass', 1, 1, 3, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(12, 4, 'Court 3', 'outdoor', 'glass', 1, 1, 3, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(13, 1, 'Cancha 4', 'indoor', 'glass', 1, 1, 4, '2025-12-22 22:29:49', '2025-12-27 00:29:17'),
(14, 2, 'Court 4', 'outdoor', 'glass', 1, 1, 4, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(15, 3, 'Court 4', 'outdoor', 'glass', 1, 1, 4, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(16, 4, 'Court 4', 'outdoor', 'glass', 1, 1, 4, '2025-12-22 22:29:49', '2025-12-22 22:29:49');

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
(1, 1, 'tournament', 'New Year Championship 2026', 'Competitive doubles tournament for all skill levels', '2026-01-10', '09:00:00', '18:00:00', 32, 1, 50.00, 1000.00, 'all', 'open', '[1, 2, 3, 4]', NULL, NULL, NULL, NULL, '2025-12-22 22:29:49', '2025-12-27 19:24:45'),
(2, 2, 'clinic', 'Advanced Tactics Clinic', 'Learn advanced strategies from professional coaches', '2026-01-15', '10:00:00', '13:00:00', 16, 0, 35.00, 0.00, 'advanced', 'open', '[1, 2]', NULL, NULL, NULL, NULL, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(3, 1, 'tournament', 'Torneo de Reyes', 'El mejor torneo para partir la rosca', '2026-01-06', '15:30:00', '23:00:00', 120, 2, 320.00, 3500.00, 'intermediate', 'open', '[5, 13]', NULL, NULL, NULL, NULL, '2025-12-27 19:51:03', '2025-12-27 22:42:12');

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
(4, 3, 13, '15:30:00', '17:00:00', NULL, '2025-12-27 19:54:40');

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
(1, 1, 2, '2025-12-27 19:24:45', 'paid', NULL, NULL, 'confirmed', NULL),
(2, 3, 3, '2025-12-27 20:30:14', 'paid', NULL, NULL, 'confirmed', NULL),
(4, 3, 2, '2025-12-27 22:42:12', 'paid', NULL, NULL, 'confirmed', NULL);

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
(2, 1, 'María González', 'maria@elitepadel.es', '+34 623 456 789', 'Specialized in teaching beginners and intermediate players', '[\"beginner\", \"intermediate\", \"fitness\"]', 50.00, NULL, 4.80, 38, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(3, 2, 'Juan Martínez', 'juan@barcapadel.es', '+34 634 567 890', 'Former professional player, expert in advanced techniques', '[\"advanced\", \"expert\", \"tactics\"]', 65.00, NULL, 4.90, 52, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49');

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
(1, 1, 'card', 1, 'visa', '4242', 12, 2027, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49');

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
(1, 'TXN20251201001', 1, 1, 'subscription', NULL, 1, NULL, NULL, 59.99, 'EUR', 'completed', 1, 'stripe', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2025-12-01 16:05:00', NULL, NULL, NULL, NULL, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(2, 'TXN1766777691976659', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'EUR', 'pending', NULL, 'stripe', 'pi_3SigmlCDsJ3n85lg04VtoJYD', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"10:00\", \"start_time\": \"09:00\", \"booking_date\": \"2025-12-28\", \"duration_minutes\": 60}', '2025-12-26 19:34:52', '2025-12-26 19:34:52'),
(3, 'TXN176677773994135', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'EUR', 'pending', NULL, 'stripe', 'pi_3SignXCDsJ3n85lg0cwVGVYs', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"11:00\", \"start_time\": \"10:00\", \"booking_date\": \"2025-12-28\", \"duration_minutes\": 60}', '2025-12-26 19:35:40', '2025-12-26 19:35:40'),
(4, 'TXN1766777884014930', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'EUR', 'pending', NULL, 'stripe', 'pi_3SigprCDsJ3n85lg1SnOd7um', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"12:00\", \"start_time\": \"11:00\", \"booking_date\": \"2025-12-28\", \"duration_minutes\": 60}', '2025-12-26 19:38:04', '2025-12-26 19:38:04'),
(5, 'TXN1766778228543403', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'EUR', 'pending', NULL, 'stripe', 'pi_3SigvQCDsJ3n85lg05dWZp2Q', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"11:00\", \"start_time\": \"10:00\", \"booking_date\": \"2025-12-28\", \"duration_minutes\": 60}', '2025-12-26 19:43:48', '2025-12-26 19:43:48'),
(6, 'TXN1766778345200606', 2, 1, 'booking', 3, NULL, NULL, NULL, 45.00, 'EUR', 'completed', NULL, 'stripe', 'pi_3SigxJCDsJ3n85lg1dWU5kO5', 'ch_3SigxJCDsJ3n85lg1JfleqEN', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2025-12-26 19:46:01', NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"11:00\", \"start_time\": \"10:00\", \"booking_date\": \"2025-12-28\", \"duration_minutes\": 60}', '2025-12-26 19:45:45', '2025-12-26 19:46:01'),
(7, 'TXN1766778729944755', 2, 1, 'booking', 4, NULL, NULL, NULL, 45.00, 'MXN', 'completed', NULL, 'stripe', 'pi_3Sih3VCDsJ3n85lg0zGGh6PU', 'ch_3Sih3VCDsJ3n85lg0BhnRHIS', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2025-12-26 19:52:35', NULL, NULL, NULL, '{\"court_id\": 5, \"end_time\": \"10:00\", \"start_time\": \"09:00\", \"booking_date\": \"2025-12-28\", \"duration_minutes\": 60}', '2025-12-26 19:52:10', '2025-12-26 19:52:35'),
(8, 'TXN1766781390788962', 2, 1, 'booking', 5, NULL, NULL, NULL, 45.00, 'MXN', 'completed', NULL, 'stripe', 'pi_3SihkQCDsJ3n85lg0c7KlutU', 'ch_3SihkQCDsJ3n85lg0p2mxQOB', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2025-12-26 20:36:46', NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"23:00\", \"start_time\": \"22:00\", \"booking_date\": \"2025-12-28\", \"duration_minutes\": 60}', '2025-12-26 20:36:30', '2025-12-26 20:36:46'),
(9, 'TXN1766782271707626', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SihydCDsJ3n85lg13n4XNNm', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"13:00\", \"start_time\": \"12:00\", \"booking_date\": \"2025-12-31\", \"duration_minutes\": 60}', '2025-12-26 20:51:11', '2025-12-26 20:51:11'),
(10, 'EVT1766799776726884', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SimWyCDsJ3n85lg10LvYCng', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 01:42:56', '2025-12-27 01:42:56'),
(11, 'EVT1766799873421468', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SimYXCDsJ3n85lg0ZuD82NF', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 01:44:33', '2025-12-27 01:44:33'),
(12, 'EVT1766799873174694', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SimYXCDsJ3n85lg0h9o87yv', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 01:44:34', '2025-12-27 01:44:34'),
(13, 'EVT1766799874624798', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SimYXCDsJ3n85lg0lQ7NwS6', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 01:44:34', '2025-12-27 01:44:34'),
(14, 'EVT1766799874703704', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SimYXCDsJ3n85lg1laRAPB9', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 01:44:34', '2025-12-27 01:44:34'),
(15, 'EVT1766863214034152', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sj32ACDsJ3n85lg1mygzKeT', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 19:20:14', '2025-12-27 19:20:14'),
(16, 'EVT1766863214281979', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sj32ACDsJ3n85lg0IxC8Lac', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 19:20:14', '2025-12-27 19:20:14'),
(17, 'EVT1766863214285878', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sj32ACDsJ3n85lg1xmYARaX', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 19:20:14', '2025-12-27 19:20:14'),
(18, 'EVT176686321462075', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sj32ACDsJ3n85lg0TJbxIwU', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 19:20:14', '2025-12-27 19:20:14'),
(19, 'EVT1766863371030992', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sj34gCDsJ3n85lg0uHTxZX0', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\"}', '2025-12-27 19:22:51', '2025-12-27 19:22:51'),
(20, 'EVT1766863467759478', 2, 1, '', NULL, NULL, NULL, NULL, 50.00, 'MXN', 'completed', NULL, 'stripe', 'pi_3Sj36FCDsJ3n85lg0CmXbDay', 'ch_3Sj36FCDsJ3n85lg0hPUuEk9', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2025-12-27 19:24:46', NULL, NULL, NULL, '{\"event_id\": 1, \"event_date\": \"2026-01-10T07:00:00.000Z\", \"event_title\": \"New Year Championship 2026\", \"participant_id\": 1}', '2025-12-27 19:24:28', '2025-12-27 19:24:46'),
(21, 'EVT176686739407294', 3, 1, '', NULL, NULL, NULL, NULL, 320.00, 'MXN', 'completed', NULL, 'stripe', 'pi_3Sj47aCDsJ3n85lg1oiFMaGO', 'ch_3Sj47aCDsJ3n85lg1cfNxu2j', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2025-12-27 20:30:14', NULL, NULL, NULL, '{\"event_id\": 3, \"event_date\": \"2026-01-06T07:00:00.000Z\", \"event_title\": \"Torneo de Reyes\", \"participant_id\": 2}', '2025-12-27 20:29:54', '2025-12-27 20:30:14'),
(22, 'TXN1766875332855', 2, 1, 'event', NULL, NULL, 4, NULL, 320.00, 'mxn', 'completed', NULL, 'manual', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2025-12-27 22:42:13', NULL, NULL, NULL, '{\"type\": \"event_registration\", \"notes\": null, \"event_id\": \"3\", \"admin_name\": \"Felix Gomez\", \"event_title\": \"Torneo de Reyes\", \"participant_id\": 4, \"created_by_admin_id\": 1}', '2025-12-27 22:42:13', '2025-12-27 22:42:13'),
(23, 'TXN1767051843370762', 3, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sjq6ZCDsJ3n85lg1Jl5hPAj', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"9:00\", \"start_time\": \"08:00\", \"booking_date\": \"2026-01-04\", \"duration_minutes\": 60}', '2025-12-29 23:44:03', '2025-12-29 23:44:03'),
(24, 'CLS176705449249311', 2, 1, 'private_class', NULL, NULL, NULL, NULL, 60.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SjqnICDsJ3n85lg0j484SLc', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"end_time\": \"9:00\", \"class_date\": \"2026-01-05\", \"class_type\": \"individual\", \"start_time\": \"08:00\", \"instructor_id\": 1, \"duration_minutes\": 60, \"number_of_students\": 1}', '2025-12-30 00:28:12', '2025-12-30 00:28:12'),
(25, 'CLS1767054911664241', 2, 1, 'private_class', NULL, NULL, NULL, NULL, 60.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sjqu3CDsJ3n85lg1L0EtO8F', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"10:00\", \"class_date\": \"2026-01-05\", \"class_type\": \"individual\", \"start_time\": \"09:00\", \"instructor_id\": 1, \"duration_minutes\": 60, \"number_of_students\": 1}', '2025-12-30 00:35:11', '2025-12-30 00:35:11'),
(26, 'TXN1767055123696153', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SjqxTCDsJ3n85lg0MOnydJV', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"10:00\", \"start_time\": \"09:00\", \"booking_date\": \"2026-01-05\", \"duration_minutes\": 60}', '2025-12-30 00:38:43', '2025-12-30 00:38:43'),
(27, 'TXN1767055309693773', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sjr0TCDsJ3n85lg1XMYTL7Q', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"10:00\", \"start_time\": \"09:00\", \"booking_date\": \"2026-01-05\", \"duration_minutes\": 60}', '2025-12-30 00:41:49', '2025-12-30 00:41:49'),
(28, 'TXN1767055511032893', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sjr3iCDsJ3n85lg0f5NCmED', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"10:00\", \"start_time\": \"09:00\", \"booking_date\": \"2026-01-05\", \"duration_minutes\": 60}', '2025-12-30 00:45:11', '2025-12-30 00:45:11'),
(29, 'TXN1767055644716152', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sjr5sCDsJ3n85lg0IYMdj1Q', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"9:00\", \"start_time\": \"08:00\", \"booking_date\": \"2026-01-05\", \"duration_minutes\": 60}', '2025-12-30 00:47:25', '2025-12-30 00:47:25'),
(30, 'TXN1767055737196375', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3Sjr7NCDsJ3n85lg13qjuVzM', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"9:00\", \"start_time\": \"08:00\", \"booking_date\": \"2026-01-05\", \"duration_minutes\": 60}', '2025-12-30 00:48:57', '2025-12-30 00:48:57'),
(31, 'TXN1767056050269610', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SjrCQCDsJ3n85lg0H2PL8pq', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"9:00\", \"start_time\": \"08:00\", \"booking_date\": \"2026-01-05\", \"duration_minutes\": 60}', '2025-12-30 00:54:10', '2025-12-30 00:54:10'),
(32, 'TXN1767056267559482', 2, 1, 'booking', NULL, NULL, NULL, NULL, 45.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SjrFvCDsJ3n85lg0M7z3I6D', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"11:00\", \"start_time\": \"10:00\", \"booking_date\": \"2026-01-05\", \"duration_minutes\": 60}', '2025-12-30 00:57:47', '2025-12-30 00:57:47'),
(33, 'CLS1767056442881230', 2, 1, 'private_class', NULL, NULL, NULL, NULL, 60.00, 'MXN', 'pending', NULL, 'stripe', 'pi_3SjrIkCDsJ3n85lg04glcSte', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"9:00\", \"class_date\": \"2026-01-05\", \"class_type\": \"individual\", \"start_time\": \"08:00\", \"instructor_id\": 1, \"duration_minutes\": 60, \"number_of_students\": 1}', '2025-12-30 01:00:43', '2025-12-30 01:00:43'),
(34, 'CLS1767056543938677', 2, 1, 'private_class', NULL, NULL, NULL, 1, 60.00, 'MXN', 'completed', NULL, 'stripe', 'pi_3SjrKNCDsJ3n85lg1XmHWTTz', 'ch_3SjrKNCDsJ3n85lg14kkV4ZQ', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, '2025-12-30 01:02:53', NULL, NULL, NULL, '{\"court_id\": 13, \"end_time\": \"11:00\", \"class_date\": \"2026-01-05\", \"class_type\": \"individual\", \"start_time\": \"10:00\", \"instructor_id\": 1, \"duration_minutes\": 60, \"number_of_students\": 1}', '2025-12-30 01:02:24', '2025-12-30 01:02:53');

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
(1, 1, NULL, 'Morning Rate', 'time_of_day', '08:00:00', '14:00:00', NULL, NULL, NULL, 35.00, 1, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(2, 1, NULL, 'Afternoon/Evening Rate', 'time_of_day', '14:00:00', '23:00:00', NULL, NULL, NULL, 45.00, 1, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(3, 2, NULL, 'Early Bird Special', 'time_of_day', '08:00:00', '12:00:00', NULL, NULL, NULL, 32.00, 1, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(4, 2, NULL, 'Prime Time', 'time_of_day', '18:00:00', '23:00:00', NULL, NULL, NULL, 48.00, 2, 1, '2025-12-22 22:29:49', '2025-12-22 22:29:49');

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
(1, 'PCL1767056573154395', 2, 1, 1, 13, 'individual', '2026-01-05', '10:00:00', '11:00:00', 60, 1, 60.00, 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-30 01:02:53', '2025-12-30 01:02:53', '2025-12-30 01:02:53', NULL);

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
(3, 1, 'VIP Annual', 'vip-annual', 'Ultimate membership experience', 599.99, 'EUR', 'yearly', 0, NULL, NULL, '[\"Unlimited_bookings\", \"15%_discount\", \"Priority_booking\", \"5_guest_passes\", \"Free_equipment\"]', NULL, 15.00, 48, 5, 1, 0, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(4, 2, 'Weekend Warrior', 'weekend-warrior', 'Play every weekend', 39.99, 'EUR', 'monthly', 7, NULL, NULL, '[\"10_bookings_per_month\", \"Weekend_priority\"]', 10, 8.00, 12, 1, 1, 0, '2025-12-22 22:29:49', '2025-12-22 22:29:49'),
(5, 2, 'Pro Player', 'pro-player', 'For serious competitors', 79.99, 'EUR', 'monthly', 0, NULL, NULL, '[\"Unlimited_bookings\", \"12%_discount\", \"Tournament_entry\"]', NULL, 12.00, 48, 3, 1, 0, '2025-12-22 22:29:49', '2025-12-22 22:29:49');

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
(2, 13, '2025-12-28', '10:00:00', '11:00:00', 60, 45.00, 0, 'booked', '2025-12-26 19:46:01', '2025-12-26 19:46:01'),
(3, 5, '2025-12-28', '09:00:00', '10:00:00', 60, 45.00, 0, 'booked', '2025-12-26 19:52:34', '2025-12-26 19:52:34'),
(4, 13, '2025-12-28', '22:00:00', '23:00:00', 60, 45.00, 0, 'booked', '2025-12-26 20:36:45', '2025-12-26 20:36:45'),
(6, 13, '2026-01-06', '08:00:00', '09:00:00', 60, 0.00, 0, 'booked', '2025-12-27 22:06:26', '2025-12-27 22:06:26'),
(7, 9, '2026-01-06', '09:00:00', '10:00:00', 60, 950.00, 0, 'booked', '2025-12-27 22:13:18', '2025-12-27 22:13:18'),
(8, 5, '2025-12-28', '15:00:00', '16:00:00', 60, 550.00, 0, 'booked', '2025-12-28 21:32:33', '2025-12-28 21:32:33'),
(9, 9, '2026-01-09', '08:00:00', '09:00:00', 60, 800.00, 0, 'booked', '2025-12-29 22:54:07', '2025-12-29 22:54:07');

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
(2, 1, 'axgoomez@gmail.com', 'Felix Gomez', '4741400363', NULL, NULL, 1, '2025-12-23 18:23:11', '2025-12-30 00:28:11', '2025-12-30 00:28:11'),
(3, 1, 'tonatiuh.gom@gmail.com', 'Alex Gomez', '4741400363', NULL, NULL, 1, '2025-12-27 20:29:29', '2025-12-29 22:34:25', '2025-12-27 20:29:52'),
(4, 2, 'lesliegcardona@gmail.com', 'Leslie Gonzalez', NULL, NULL, NULL, 1, '2025-12-27 22:21:45', '2025-12-29 22:35:47', NULL);

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
(8, 3, 849691, 1, '2025-12-27 19:29:30', '2025-12-27 20:29:30', NULL, NULL, NULL),
(9, 2, 828244, 1, '2025-12-30 00:26:26', '2025-12-30 00:26:26', NULL, NULL, NULL);

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
(1, 1, 1, 2, 'SUB20251201001', NULL, 'active', '2025-12-01 16:00:00', NULL, '2025-12-01 16:00:00', '2026-01-01 16:00:00', NULL, NULL, 0, 0, 0, 1, NULL, '2025-12-22 22:29:49', '2025-12-22 22:29:49');

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
  ADD KEY `idx_stripe_subscription` (`stripe_subscription_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `auth_codes`
--
ALTER TABLE `auth_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `blocked_slots`
--
ALTER TABLE `blocked_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `event_court_schedules`
--
ALTER TABLE `event_court_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `event_participants`
--
ALTER TABLE `event_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users_sessions`
--
ALTER TABLE `users_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  ADD CONSTRAINT `fk_private_classes_created_by_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
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
