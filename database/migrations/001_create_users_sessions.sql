-- ============================================
-- USER SESSIONS TABLE FOR PASSWORDLESS AUTH
-- Migration: 001_create_users_sessions
-- ============================================

-- Create users_sessions table for passwordless authentication
CREATE TABLE IF NOT EXISTS users_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_code INT(6) NOT NULL,
    user_session TINYINT(1) DEFAULT 0, -- 0 = inactive, 1 = active
    user_session_date_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    INDEX idx_user_id (user_id),
    INDEX idx_session_code (session_code),
    INDEX idx_active_sessions (user_id, user_session),
    INDEX idx_expires (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up expired sessions older than 24 hours
CREATE EVENT IF NOT EXISTS cleanup_expired_sessions
ON SCHEDULE EVERY 1 HOUR
DO
  DELETE FROM users_sessions 
  WHERE expires_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
