-- Create instructor_availability table
-- This stores recurring weekly availability for instructors

CREATE TABLE IF NOT EXISTS instructor_availability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  instructor_id INT NOT NULL,
  day_of_week TINYINT NOT NULL, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
  INDEX idx_instructor_day (instructor_id, day_of_week),
  INDEX idx_active (is_active)
);

-- Create instructor_blocked_times table for specific date/time blocks
-- This allows blocking out specific dates (vacations, etc.)

CREATE TABLE IF NOT EXISTS instructor_blocked_times (
  id INT PRIMARY KEY AUTO_INCREMENT,
  instructor_id INT NOT NULL,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
  INDEX idx_instructor_date (instructor_id, blocked_date)
);
