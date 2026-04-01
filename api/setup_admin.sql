-- AutoMarket Slovenia - Admin Panel Database Setup
-- Run this in phpMyAdmin or MySQL

-- Users table (already exists, add is_admin column if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin TINYINT(1) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) DEFAULT 0;

-- Purchases/Packages table (for tracking package purchases)
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    package_type VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Messages table (contact form messages)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(50),
    message TEXT NOT NULL,
    car_id INT,
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_car_id (car_id),
    INDEX idx_is_read (is_read)
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Package definitions (static, stored in localStorage but can be here too)
-- No need for DB table, stored in code

-- Insert some sample data if tables are empty
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
    ('site_name', 'AutoMarket Slovenia'),
    ('site_email', 'info@automarket.si'),
    ('contact_phone', '+386 1 234 5678');

-- Check if there are any users
SELECT 'Users count:', COUNT(*) FROM users;
SELECT 'Cars count:', COUNT(*) FROM cars;