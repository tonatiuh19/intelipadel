-- ============================================
-- INTELIPADEL DATABASE SCHEMA
-- MySQL/MariaDB Schema for Padel Court Booking Platform
-- ============================================

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS stripe_webhook_events;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS event_participants;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS private_classes;
DROP TABLE IF EXISTS blocked_slots;
DROP TABLE IF EXISTS price_rules;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS courts;
DROP TABLE IF EXISTS club_schedules;
DROP TABLE IF EXISTS instructors;
DROP TABLE IF EXISTS user_subscriptions;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS auth_codes;
DROP TABLE IF EXISTS player_stats;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admins;

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Admins table
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('super_admin', 'club_admin') DEFAULT 'club_admin',
    club_id INT NULL, -- NULL for super_admins, specific club_id for club_admins
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_club_id (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users/Players table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    stripe_customer_id VARCHAR(255) UNIQUE, -- Stripe Customer ID
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_stripe_customer (stripe_customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Player statistics
CREATE TABLE player_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_bookings INT DEFAULT 0,
    completed_bookings INT DEFAULT 0,
    cancelled_bookings INT DEFAULT 0,
    total_hours_played DECIMAL(10,2) DEFAULT 0.00,
    favorite_club_id INT NULL,
    preferred_time_slot VARCHAR(20), -- e.g., 'morning', 'afternoon', 'evening'
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    last_played_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Authentication codes (passwordless login)
CREATE TABLE auth_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    user_type ENUM('admin', 'user') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_code (email, code),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CLUBS & COURTS
-- ============================================

-- Clubs table
CREATE TABLE clubs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'España',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    image_url VARCHAR(500),
    gallery JSON, -- Array of image URLs
    amenities JSON, -- Array of amenities: ["parking", "lockers", "showers", "pro_shop", "cafe"]
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    price_per_hour DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    is_active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_city (city),
    INDEX idx_active (is_active),
    INDEX idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUBSCRIPTIONS & PAYMENTS
-- ============================================

-- Subscription plans (per club)
CREATE TABLE subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    plan_slug VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    billing_cycle ENUM('monthly', 'quarterly', 'yearly', 'lifetime') NOT NULL,
    trial_days INT DEFAULT 0,
    stripe_price_id VARCHAR(255) UNIQUE, -- Stripe Price ID (e.g., price_1ABC...)
    stripe_product_id VARCHAR(255), -- Stripe Product ID (e.g., prod_ABC...)
    features JSON, -- Array: ["unlimited_bookings", "priority_access", "10%_discount", "guest_passes"]
    max_monthly_bookings INT NULL, -- NULL = unlimited
    booking_discount_percent DECIMAL(5,2) DEFAULT 0.00,
    priority_booking_hours INT DEFAULT 0, -- Hours before non-subscribers
    guest_passes_per_month INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_club_slug (club_id, plan_slug),
    INDEX idx_club_id (club_id),
    INDEX idx_active (is_active),
    INDEX idx_stripe_price (stripe_price_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User subscriptions (many-to-many: users can subscribe to multiple clubs)
CREATE TABLE user_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    plan_id INT NOT NULL,
    subscription_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "SUB20251222001"
    stripe_subscription_id VARCHAR(255) UNIQUE, -- Stripe Subscription ID (e.g., sub_1ABC...)
    status ENUM('active', 'trial', 'past_due', 'cancelled', 'expired') DEFAULT 'active',
    started_at TIMESTAMP NOT NULL,
    trial_ends_at TIMESTAMP NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    cancel_at_period_end BOOLEAN DEFAULT FALSE, -- If true, don't auto-renew
    bookings_used_this_month INT DEFAULT 0,
    guest_passes_used_this_month INT DEFAULT 0,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_club_id (club_id),
    INDEX idx_status (status),
    INDEX idx_period_end (current_period_end),
    INDEX idx_stripe_subscription (stripe_subscription_id),
    UNIQUE KEY unique_user_club_active (user_id, club_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment methods (stored per user)
CREATE TABLE payment_methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    payment_type ENUM('card', 'paypal', 'bank_transfer', 'cash') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    -- Card details (encrypted/tokenized in production)
    card_brand VARCHAR(50), -- 'visa', 'mastercard', 'amex'
    card_last4 VARCHAR(4),
    card_exp_month INT,
    card_exp_year INT,
    -- PayPal
    paypal_email VARCHAR(255),
    -- Bank transfer
    bank_name VARCHAR(255),
    bank_account_last4 VARCHAR(4),
    -- External payment processor reference
    stripe_payment_method_id VARCHAR(255),
    paypal_billing_agreement_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stripe webhook events (for idempotency and debugging)
CREATE TABLE stripe_webhook_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL, -- Stripe Event ID (e.g., evt_1ABC...)
    event_type VARCHAR(100) NOT NULL, -- e.g., 'payment_intent.succeeded', 'customer.subscription.updated'
    event_data JSON NOT NULL, -- Full event payload from Stripe
    processed BOOLEAN DEFAULT FALSE,
    processing_started_at TIMESTAMP NULL,
    processing_completed_at TIMESTAMP NULL,
    processing_error TEXT,
    retry_count INT DEFAULT 0,
    api_version VARCHAR(20), -- Stripe API version
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stripe_event (stripe_event_id),
    INDEX idx_event_type (event_type),
    INDEX idx_processed (processed),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Instructors table (for private classes)
CREATE TABLE instructors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    specialties JSON, -- Array: ["beginner", "advanced", "tactics", "fitness"]
    hourly_rate DECIMAL(10,2) NOT NULL,
    avatar_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    INDEX idx_club_id (club_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Club schedules (default operating hours)
CREATE TABLE club_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    day_of_week TINYINT NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    opens_at TIME NOT NULL DEFAULT '08:00:00',
    closes_at TIME NOT NULL DEFAULT '23:00:00',
    is_closed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_club_day (club_id, day_of_week),
    INDEX idx_club_id (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courts table
CREATE TABLE courts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., "Court 1", "Court A"
    court_type ENUM('indoor', 'outdoor', 'covered') DEFAULT 'outdoor',
    surface_type ENUM('glass', 'concrete', 'artificial_grass') DEFAULT 'glass',
    has_lighting BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    INDEX idx_club_id (club_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRICING & SCHEDULING
-- ============================================

-- Dynamic price rules (overrides default club pricing)
CREATE TABLE price_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    court_id INT NULL, -- NULL means applies to all courts in the club
    rule_name VARCHAR(255) NOT NULL,
    rule_type ENUM('time_of_day', 'day_of_week', 'seasonal', 'special_date') NOT NULL,
    start_time TIME NULL, -- For time_of_day rules (e.g., 08:00:00)
    end_time TIME NULL, -- For time_of_day rules (e.g., 14:00:00)
    days_of_week JSON NULL, -- Array for day_of_week: [1,2,3,4,5] for Mon-Fri
    start_date DATE NULL, -- For seasonal or special_date rules
    end_date DATE NULL, -- For seasonal or special_date rules
    price_per_hour DECIMAL(10,2) NOT NULL,
    priority INT DEFAULT 0, -- Higher priority rules override lower ones
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    INDEX idx_club_id (club_id),
    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blocked slots (for maintenance, holidays, events)
CREATE TABLE blocked_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    court_id INT NULL, -- NULL means entire club is blocked
    block_type ENUM('maintenance', 'holiday', 'event', 'private_event', 'other') NOT NULL,
    block_date DATE NOT NULL,
    start_time TIME NULL, -- NULL means all day
    end_time TIME NULL, -- NULL means all day
    is_all_day BOOLEAN DEFAULT FALSE,
    reason VARCHAR(500),
    notes TEXT,
    created_by_admin_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_club_date (club_id, block_date),
    INDEX idx_court_date (court_id, block_date),
    INDEX idx_type (block_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOOKINGS & AVAILABILITY
-- ============================================

-- Time slots (for availability management)
CREATE TABLE time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    court_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT DEFAULT 90, -- Standard 1.5 hour slots
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    availability_status ENUM('available', 'booked', 'blocked', 'maintenance') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_court_slot (court_id, date, start_time),
    INDEX idx_court_date (court_id, date),
    INDEX idx_availability (is_available, availability_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings/Reservations table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "BK20251222001"
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    court_id INT NOT NULL,
    time_slot_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'confirmed',
    payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    payment_method VARCHAR(50),
    booking_type ENUM('single', 'recurring') DEFAULT 'single',
    is_recurring BOOLEAN DEFAULT FALSE,
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    INDEX idx_booking_number (booking_number),
    INDEX idx_user_id (user_id),
    INDEX idx_club_date (club_id, booking_date),
    INDEX idx_status (status),
    INDEX idx_date_range (booking_date, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample clubs
INSERT INTO clubs (name, slug, description, address, city, state, postal_code, phone, email, image_url, rating, review_count, price_per_hour, amenities) VALUES
('Club Elite Padel', 'club-elite-padel', 'Premier padel club in Madrid with state-of-the-art facilities', 'Calle del Deporte 45', 'Madrid', 'Madrid', '28001', '+34 912 345 678', 'info@elitepadel.es', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800', 4.8, 234, 45.00, '["parking", "lockers", "showers", "pro_shop", "cafe"]'),
('Padel Barcelona Center', 'padel-barcelona-center', 'Modern padel facility in the heart of Barcelona', 'Avinguda Diagonal 123', 'Barcelona', 'Barcelona', '08019', '+34 933 456 789', 'contact@barcapadel.es', 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800', 4.7, 189, 42.00, '["parking", "lockers", "showers", "cafe"]'),
('Valencia Padel Club', 'valencia-padel-club', 'Premium outdoor courts with ocean views', 'Carrer de la Mar 89', 'Valencia', 'Valencia', '46001', '+34 963 567 890', 'hello@valenciapadel.es', 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=800', 4.9, 312, 40.00, '["parking", "showers", "pro_shop", "cafe"]'),
('Sevilla Sports Complex', 'sevilla-sports-complex', 'Multi-sport facility with excellent padel courts', 'Avenida de la Constitución 56', 'Sevilla', 'Sevilla', '41001', '+34 954 678 901', 'info@sevillapadel.es', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800', 4.6, 156, 38.00, '["parking", "lockers", "showers"]');

-- Insert club schedules (Monday to Sunday for all clubs)
INSERT INTO club_schedules (club_id, day_of_week, opens_at, closes_at) 
SELECT id, day, '08:00:00', '23:00:00'
FROM clubs
CROSS JOIN (SELECT 0 AS day UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) AS days;

-- Insert courts for each club (4 courts per club)
INSERT INTO courts (club_id, name, court_type, surface_type, has_lighting, display_order)
SELECT id, CONCAT('Court ', court_num), 
       CASE WHEN court_num <= 2 THEN 'indoor' ELSE 'outdoor' END,
       'glass', 
       TRUE,
       court_num
FROM clubs
CROSS JOIN (SELECT 1 AS court_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) AS court_numbers;

-- Insert sample admin
INSERT INTO admins (email, name, role) VALUES
('admin@intelipadel.com', 'System Administrator', 'super_admin');

-- Insert sample user
INSERT INTO users (email, name) VALUES
('user@example.com', 'John Doe');

-- Initialize player stats for the sample user
INSERT INTO player_stats (user_id) VALUES (1);

-- Insert sample subscription plans (for first two clubs)
INSERT INTO subscription_plans (club_id, plan_name, plan_slug, description, price, billing_cycle, trial_days, features, max_monthly_bookings, booking_discount_percent, priority_booking_hours, guest_passes_per_month) VALUES
(1, 'Basic Monthly', 'basic-monthly', 'Perfect for casual players', 29.99, 'monthly', 7, '["8_bookings_per_month", "5%_discount", "Online_booking"]', 8, 5.00, 0, 0),
(1, 'Premium Monthly', 'premium-monthly', 'Best for regular players', 59.99, 'monthly', 14, '["Unlimited_bookings", "10%_discount", "Priority_booking", "2_guest_passes"]', NULL, 10.00, 24, 2),
(1, 'VIP Annual', 'vip-annual', 'Ultimate membership experience', 599.99, 'yearly', 0, '["Unlimited_bookings", "15%_discount", "Priority_booking", "5_guest_passes", "Free_equipment"]', NULL, 15.00, 48, 5),
(2, 'Weekend Warrior', 'weekend-warrior', 'Play every weekend', 39.99, 'monthly', 7, '["10_bookings_per_month", "Weekend_priority"]', 10, 8.00, 12, 1),
(2, 'Pro Player', 'pro-player', 'For serious competitors', 79.99, 'monthly', 0, '["Unlimited_bookings", "12%_discount", "Tournament_entry"]', NULL, 12.00, 48, 3);

-- Insert sample user subscription
INSERT INTO user_subscriptions (user_id, club_id, plan_id, subscription_number, status, started_at, current_period_start, current_period_end, auto_renew) VALUES
(1, 1, 2, 'SUB20251201001', 'active', '2025-12-01 10:00:00', '2025-12-01 10:00:00', '2026-01-01 10:00:00', TRUE);

-- Insert sample payment method
INSERT INTO payment_methods (user_id, payment_type, is_default, card_brand, card_last4, card_exp_month, card_exp_year) VALUES
(1, 'card', TRUE, 'visa', '4242', 12, 2027);

-- ============================================
-- EVENTS, TOURNAMENTS & PRIVATE CLASSES
-- ============================================

-- Events/Tournaments table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    event_type ENUM('tournament', 'league', 'clinic', 'social', 'championship') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_participants INT,
    current_participants INT DEFAULT 0,
    registration_fee DECIMAL(10,2) DEFAULT 0.00,
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    skill_level ENUM('all', 'beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'all',
    status ENUM('draft', 'open', 'full', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
    courts_used JSON, -- Array of court IDs: [1, 2, 3]
    image_url VARCHAR(500),
    rules TEXT,
    organizer_name VARCHAR(255),
    organizer_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    INDEX idx_club_id (club_id),
    INDEX idx_event_date (event_date),
    INDEX idx_status (status),
    INDEX idx_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event participants
CREATE TABLE event_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    team_name VARCHAR(255),
    partner_user_id INT NULL, -- For doubles tournaments
    status ENUM('registered', 'confirmed', 'withdrawn', 'disqualified') DEFAULT 'registered',
    notes TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_event_user (event_id, user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Private classes/lessons
CREATE TABLE private_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    instructor_id INT NOT NULL,
    club_id INT NOT NULL,
    court_id INT NULL, -- Court assignment can be flexible
    class_type ENUM('individual', 'group', 'semi_private') DEFAULT 'individual',
    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    number_of_students INT DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    focus_areas JSON, -- Array: ["serve", "backhand", "tactics", "fitness"]
    student_level ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    notes TEXT,
    instructor_notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE SET NULL,
    INDEX idx_booking_number (booking_number),
    INDEX idx_user_id (user_id),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_club_date (club_id, class_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PAYMENTS & INVOICES
-- ============================================

-- Payment transactions (unified for all payment types)
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "TXN20251222001"
    user_id INT NOT NULL,
    club_id INT NULL, -- NULL for platform-level transactions
    transaction_type ENUM('booking', 'subscription', 'event', 'private_class', 'refund') NOT NULL,
    -- Reference IDs (only one should be populated)
    booking_id INT NULL,
    subscription_id INT NULL,
    event_participant_id INT NULL,
    private_class_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    payment_method_id INT NULL,
    payment_provider VARCHAR(50) DEFAULT 'stripe', -- 'stripe', 'paypal', 'manual'
    -- Stripe specific fields
    stripe_payment_intent_id VARCHAR(255), -- Stripe PaymentIntent ID (e.g., pi_1ABC...)
    stripe_charge_id VARCHAR(255), -- Stripe Charge ID (e.g., ch_1ABC...)
    stripe_invoice_id VARCHAR(255), -- Stripe Invoice ID (e.g., in_1ABC...)
    stripe_refund_id VARCHAR(255), -- Stripe Refund ID (e.g., re_1ABC...)
    provider_transaction_id VARCHAR(255), -- Generic external transaction ID
    provider_response JSON, -- Store full response for debugging
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_reason TEXT,
    refunded_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    failure_reason TEXT,
    failure_code VARCHAR(50), -- Stripe error code
    metadata JSON, -- Additional transaction details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (event_participant_id) REFERENCES event_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (private_class_id) REFERENCES private_classes(id) ON DELETE SET NULL,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_club_id (club_id),
    INDEX idx_status (status),
    INDEX idx_type (transaction_type),
    INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
    INDEX idx_stripe_charge (stripe_charge_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoices
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "INV-2025-001"
    user_id INT NOT NULL,
    club_id INT NULL,
    transaction_id INT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    items JSON, -- Array of line items: [{"description": "...", "amount": 50.00}]
    notes TEXT,
    paid_at TIMESTAMP NULL,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_club_id (club_id),
    INDEX idx_status (status),
    INDEX idx_invoice_date (invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA FOR PAYMENTS
-- ============================================

-- Insert sample payment transaction
INSERT INTO payment_transactions (transaction_number, user_id, club_id, transaction_type, subscription_id, amount, status, payment_method_id, payment_provider, paid_at) VALUES
('TXN20251201001', 1, 1, 'subscription', 1, 59.99, 'completed', 1, 'stripe', '2025-12-01 10:05:00');

-- Insert sample instructors
INSERT INTO instructors (club_id, name, email, phone, bio, specialties, hourly_rate, rating, review_count) VALUES
(1, 'Carlos Rodríguez', 'carlos@elitepadel.es', '+34 612 345 678', 'Professional padel coach with 10+ years experience', '["advanced", "tactics", "tournament_prep"]', 60.00, 4.9, 45),
(1, 'María González', 'maria@elitepadel.es', '+34 623 456 789', 'Specialized in teaching beginners and intermediate players', '["beginner", "intermediate", "fitness"]', 50.00, 4.8, 38),
(2, 'Juan Martínez', 'juan@barcapadel.es', '+34 634 567 890', 'Former professional player, expert in advanced techniques', '["advanced", "expert", "tactics"]', 65.00, 4.9, 52);

-- Insert sample price rules
INSERT INTO price_rules (club_id, rule_name, rule_type, start_time, end_time, price_per_hour, priority, is_active) VALUES
(1, 'Morning Rate', 'time_of_day', '08:00:00', '14:00:00', 35.00, 1, TRUE),
(1, 'Afternoon/Evening Rate', 'time_of_day', '14:00:00', '23:00:00', 45.00, 1, TRUE),
(2, 'Early Bird Special', 'time_of_day', '08:00:00', '12:00:00', 32.00, 1, TRUE),
(2, 'Prime Time', 'time_of_day', '18:00:00', '23:00:00', 48.00, 2, TRUE);

-- Insert sample blocked slots
INSERT INTO blocked_slots (club_id, court_id, block_type, block_date, start_time, end_time, is_all_day, reason) VALUES
(1, 1, 'maintenance', '2025-12-25', '09:00:00', '13:00:00', FALSE, 'Court resurfacing'),
(1, NULL, 'holiday', '2025-01-01', NULL, NULL, TRUE, 'New Year - Club Closed'),
(2, 2, 'maintenance', '2025-12-26', '08:00:00', '12:00:00', FALSE, 'Glass panel replacement');

-- Insert sample events
INSERT INTO events (club_id, event_type, title, description, event_date, start_time, end_time, max_participants, registration_fee, prize_pool, skill_level, status, courts_used) VALUES
(1, 'tournament', 'New Year Championship 2026', 'Competitive doubles tournament for all skill levels', '2026-01-10', '09:00:00', '18:00:00', 32, 50.00, 1000.00, 'all', 'open', '[1, 2, 3, 4]'),
(2, 'clinic', 'Advanced Tactics Clinic', 'Learn advanced strategies from professional coaches', '2026-01-15', '10:00:00', '13:00:00', 16, 35.00, 0.00, 'advanced', 'open', '[1, 2]');

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get applicable price for a specific time slot
-- SELECT pr.price_per_hour 
-- FROM price_rules pr 
-- WHERE pr.club_id = 1 
--   AND pr.is_active = TRUE
--   AND (pr.court_id IS NULL OR pr.court_id = 1)
--   AND (pr.start_time <= '10:00:00' AND pr.end_time > '10:00:00')
-- ORDER BY pr.priority DESC, pr.court_id DESC 
-- LIMIT 1;

-- Check if a slot is blocked
-- SELECT * FROM blocked_slots 
-- WHERE club_id = 1 
--   AND block_date = '2025-12-25'
--   AND (court_id IS NULL OR court_id = 1)
--   AND (is_all_day = TRUE OR (start_time <= '10:00:00' AND end_time > '10:00:00'));

-- Get upcoming events at a club
-- SELECT e.*, COUNT(ep.id) as registered_participants
-- FROM events e
-- LEFT JOIN event_participants ep ON e.id = ep.event_id
-- WHERE e.club_id = 1 
--   AND e.event_date >= CURDATE()
--   AND e.status IN ('open', 'in_progress')
-- GROUP BY e.id
-- ORDER BY e.event_date, e.start_time;

-- Get instructor schedule
-- SELECT pc.*, u.name as student_name, c.name as club_name
-- FROM private_classes pc
-- JOIN users u ON pc.user_id = u.id
-- JOIN clubs c ON pc.club_id = c.id
-- WHERE pc.instructor_id = 1
--   AND pc.class_date >= CURDATE()
--   AND pc.status != 'cancelled'
-- ORDER BY pc.class_date, pc.start_time;

-- ============================================
-- ADDITIONAL USEFUL QUERIES
-- ============================================

-- Get all clubs with their court count
-- SELECT c.*, COUNT(ct.id) as court_count 
-- FROM clubs c 
-- LEFT JOIN courts ct ON c.id = ct.club_id 
-- WHERE c.is_active = TRUE 
-- GROUP BY c.id;

-- Get available time slots for a specific club and date
-- SELECT ts.*, co.name as court_name 
-- FROM time_slots ts 
-- JOIN courts co ON ts.court_id = co.id 
-- WHERE co.club_id = 1 
--   AND ts.date = '2025-12-23' 
--   AND ts.is_available = TRUE 
-- ORDER BY ts.start_time;

-- Get user's booking history
-- SELECT b.*, c.name as club_name, co.name as court_name 
-- FROM bookings b 
-- JOIN clubs c ON b.club_id = c.id 
-- JOIN courts co ON b.court_id = co.id 
-- WHERE b.user_id = 1 
-- ORDER BY b.booking_date DESC, b.start_time DESC;

-- ============================================
-- SUBSCRIPTION & PAYMENT QUERIES
-- ============================================

-- Get active subscriptions for a user
-- SELECT us.*, c.name as club_name, sp.plan_name, sp.price, sp.billing_cycle
-- FROM user_subscriptions us
-- JOIN clubs c ON us.club_id = c.id
-- JOIN subscription_plans sp ON us.plan_id = sp.id
-- WHERE us.user_id = 1 
--   AND us.status = 'active'
-- ORDER BY us.current_period_end;

-- Check if user has active subscription at a club
-- SELECT * FROM user_subscriptions 
-- WHERE user_id = 1 
--   AND club_id = 1 
--   AND status = 'active' 
--   AND current_period_end > NOW();

-- Get subscription plans for a club
-- SELECT * FROM subscription_plans 
-- WHERE club_id = 1 
--   AND is_active = TRUE 
-- ORDER BY price ASC;

-- Get user's payment history
-- SELECT pt.*, c.name as club_name
-- FROM payment_transactions pt
-- LEFT JOIN clubs c ON pt.club_id = c.id
-- WHERE pt.user_id = 1
-- ORDER BY pt.created_at DESC;

-- Find subscriptions expiring in next 7 days
-- SELECT us.*, u.email, u.name, c.name as club_name, sp.plan_name
-- FROM user_subscriptions us
-- JOIN users u ON us.user_id = u.id
-- JOIN clubs c ON us.club_id = c.id
-- JOIN subscription_plans sp ON us.plan_id = sp.id
-- WHERE us.status = 'active'
--   AND us.auto_renew = FALSE
--   AND us.current_period_end BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY);

-- Calculate monthly recurring revenue (MRR) per club
-- SELECT c.id, c.name,
--   SUM(CASE 
--     WHEN sp.billing_cycle = 'monthly' THEN sp.price
--     WHEN sp.billing_cycle = 'quarterly' THEN sp.price / 3
--     WHEN sp.billing_cycle = 'yearly' THEN sp.price / 12
--     ELSE 0
--   END) as mrr
-- FROM user_subscriptions us
-- JOIN subscription_plans sp ON us.plan_id = sp.id
-- JOIN clubs c ON us.club_id = c.id
-- WHERE us.status = 'active'
-- GROUP BY c.id, c.name;

-- ============================================
-- STRIPE-SPECIFIC QUERIES
-- ============================================

-- Find user by Stripe Customer ID
-- SELECT * FROM users WHERE stripe_customer_id = 'cus_ABC123';

-- Find subscription by Stripe Subscription ID
-- SELECT us.*, u.email, c.name as club_name
-- FROM user_subscriptions us
-- JOIN users u ON us.user_id = u.id
-- JOIN clubs c ON us.club_id = c.id
-- WHERE us.stripe_subscription_id = 'sub_ABC123';

-- Find payment by Stripe PaymentIntent ID
-- SELECT * FROM payment_transactions 
-- WHERE stripe_payment_intent_id = 'pi_ABC123';

-- Get unprocessed webhook events
-- SELECT * FROM stripe_webhook_events 
-- WHERE processed = FALSE 
-- ORDER BY created_at ASC 
-- LIMIT 100;

-- Get failed webhook events for retry
-- SELECT * FROM stripe_webhook_events 
-- WHERE processed = FALSE 
--   AND processing_error IS NOT NULL
--   AND retry_count < 5
-- ORDER BY created_at ASC;

-- Sync check: Find subscriptions without Stripe IDs
-- SELECT us.*, u.email, c.name as club_name
-- FROM user_subscriptions us
-- JOIN users u ON us.user_id = u.id
-- JOIN clubs c ON us.club_id = c.id
-- WHERE us.status = 'active'
--   AND us.stripe_subscription_id IS NULL;
