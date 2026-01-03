-- Create payment_methods table to store user payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  brand VARCHAR(50) NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  exp_month INT NOT NULL,
  exp_year INT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_payment_methods (user_id),
  INDEX idx_stripe_pm_id (stripe_payment_method_id)
);
