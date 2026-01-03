-- Migration: Clean all data except for club_id = 1 and preserve all users
-- Date: 2026-01-02
-- Description: Removes all data not related to club_id = 1, but keeps users table intact

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clean session tables (not tied to club_id, but good to clean up)
DELETE FROM admin_sessions WHERE admin_id NOT IN (SELECT id FROM admins WHERE club_id = 1 OR club_id IS NULL);
DELETE FROM users_sessions;
DELETE FROM auth_codes;

-- Clean admin data (keep only admins for club_id = 1 and super_admins)
DELETE FROM admins WHERE club_id IS NOT NULL AND club_id != 1;

-- Clean club-related core tables
DELETE FROM blocked_slots WHERE club_id != 1;
DELETE FROM courts WHERE club_id != 1;
DELETE FROM price_rules WHERE club_id != 1;
DELETE FROM time_slots WHERE court_id NOT IN (SELECT id FROM courts WHERE club_id = 1);

-- Clean club schedules and policies
DELETE FROM club_schedules WHERE club_id != 1;
DELETE FROM club_cancellation_policy WHERE club_id != 1;
DELETE FROM club_privacy_policy WHERE club_id != 1;
DELETE FROM club_terms_conditions WHERE club_id != 1;

-- Clean subscription plans
DELETE FROM club_subscriptions WHERE club_id != 1;

-- Clean user subscriptions (not related to club_id = 1)
DELETE FROM user_subscriptions WHERE plan_id NOT IN (SELECT id FROM club_subscriptions WHERE club_id = 1);

-- Clean bookings
DELETE FROM bookings WHERE club_id != 1;

-- Clean instructors and related tables
DELETE FROM instructor_blocked_times WHERE instructor_id NOT IN (SELECT id FROM instructors WHERE club_id = 1);
DELETE FROM instructor_availability WHERE instructor_id NOT IN (SELECT id FROM instructors WHERE club_id = 1);
DELETE FROM instructors WHERE club_id != 1;

-- Clean private classes
DELETE FROM private_classes WHERE club_id != 1;

-- Clean events and related tables
DELETE FROM event_court_schedules WHERE event_id NOT IN (SELECT id FROM events WHERE club_id = 1);
DELETE FROM event_participants WHERE event_id NOT IN (SELECT id FROM events WHERE club_id = 1);
DELETE FROM events WHERE club_id != 1;

-- Clean payment transactions
DELETE FROM payment_transactions WHERE club_id != 1;

-- Clean payment methods (for users not in club_id = 1)
DELETE FROM payment_methods WHERE user_id NOT IN (SELECT id FROM users WHERE club_id = 1);

-- Clean invoices
DELETE FROM invoices WHERE club_id != 1;

-- Clean player stats (keep all user stats since we're keeping all users)
-- No deletion needed for player_stats as it's user-specific, not club-specific

-- Clean stripe webhook events (not tied to club_id, but can clean old ones)
DELETE FROM stripe_webhook_events WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Clean clubs (keep only club_id = 1)
DELETE FROM clubs WHERE id != 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify remaining data
SELECT 'Clubs remaining:' as info, COUNT(*) as count FROM clubs;
SELECT 'Users remaining:' as info, COUNT(*) as count FROM users;
SELECT 'Admins remaining:' as info, COUNT(*) as count FROM admins;
SELECT 'Courts remaining:' as info, COUNT(*) as count FROM courts;
SELECT 'Bookings remaining:' as info, COUNT(*) as count FROM bookings;
SELECT 'Events remaining:' as info, COUNT(*) as count FROM events;
SELECT 'Instructors remaining:' as info, COUNT(*) as count FROM instructors;
SELECT 'Private classes remaining:' as info, COUNT(*) as count FROM private_classes;
SELECT 'Payment transactions remaining:' as info, COUNT(*) as count FROM payment_transactions;
