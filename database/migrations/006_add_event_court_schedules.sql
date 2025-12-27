-- Migration: Add event_court_schedules table for granular court blocking
-- This allows events to use different courts at different times

CREATE TABLE IF NOT EXISTS event_court_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  court_id INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
  INDEX idx_event_court_schedules_event_id (event_id),
  INDEX idx_event_court_schedules_court_id (court_id),
  INDEX idx_event_court_schedules_times (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: This table provides granular control. The events.courts_used JSON field 
-- can still be used for simple cases where all courts are blocked for the entire event duration.
-- When event_court_schedules has entries for an event, those take precedence over courts_used.
