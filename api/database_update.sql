-- ============================================
-- AutoMarket Slovenia - Database Schema
-- ============================================

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    user_type VARCHAR(50) DEFAULT 'private',
    is_verified BOOLEAN DEFAULT FALSE,
    reset_code VARCHAR(6),
    reset_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for user-to-user messaging
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INT REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) DEFAULT '',
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sent_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track which broadcasts a user has read
CREATE TABLE IF NOT EXISTS broadcast_reads (
    broadcast_id INT REFERENCES broadcasts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (broadcast_id, user_id)
);

-- User packages (purchased subscriptions)
CREATE TABLE IF NOT EXISTS user_packages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    package_id INT,
    package_name VARCHAR(255),
    package_type VARCHAR(50),
    price_paid DECIMAL(10,2),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Packages table for admin management
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'publishing', 'boost_private', 'boost_business'
    name VARCHAR(255) NOT NULL,
    name_sl VARCHAR(255),
    name_en VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    min_days INT DEFAULT 30,
    discount_percent INT DEFAULT 0,
    discount_active BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcasts_created ON broadcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_packages_user ON user_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_packages_active ON user_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(type);

-- ============================================
-- INSERT DEFAULT PACKAGES (only if table is empty)
-- ============================================
INSERT INTO packages (type, name, name_sl, name_en, price, min_days, discount_percent, discount_active) 
SELECT 
    'publishing', 'Osnovni', 'Osnovni paket', 'Basic Package', 34.99, 30, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Osnovni');

INSERT INTO packages (type, name, name_sl, name_en, price, min_days, discount_percent, discount_active) 
SELECT 
    'publishing', 'Premium', 'Premium paket', 'Premium Package', 64.99, 30, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Premium');

-- Boost packages (private)
INSERT INTO packages (type, name, name_sl, name_en, price, min_days, discount_percent, discount_active) 
SELECT 
    'boost_private', 'Akcija Private', 'Akcija - Zasebne osebe', 'Private Deal', 1.50, 15, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Akcija Private');

INSERT INTO packages (type, name, name_sl, name_en, price, min_days, discount_percent, discount_active) 
SELECT 
    'boost_private', 'Top Private', 'Top izbira - Zasebne', 'Top Choice - Private', 1.50, 15, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Top Private');

INSERT INTO packages (type, name, name_sl, name_en, price, min_days, discount_percent, discount_active) 
SELECT 
    'boost_private', 'Skok Private', 'Skok na vrh - Zasebne', 'Jump Top - Private', 1.00, 15, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Skok Private');

-- Boost packages (business)
INSERT INTO packages (type, name, name_sl, name_en, price, min_days, discount_percent, discount_active) 
SELECT 
    'boost_business', 'Akcija Business', 'Akcija - Trgovci', 'Business Deal', 0.75, 30, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Akcija Business');

INSERT INTO packages (type, name, name_sl, name_en, price, min_days, discount_percent, discount_active) 
SELECT 
    'boost_business', 'Top Business', 'Top izbira - Trgovci', 'Top Choice - Business', 0.65, 30, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Top Business');

INSERT INTO packages (type, name, name_sl, name_en, price, min_days, discount_percent, discount_active) 
SELECT 
    'boost_business', 'Skok Business', 'Skok na vrh - Trgovci', 'Jump Top - Business', 0.50, 30, 0, FALSE
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Skok Business');

-- ============================================
-- UPDATE EXISTING ADMIN USER
-- ============================================
UPDATE users 
SET 
    role = 'admin',
    user_type = 'business'
WHERE email = 'harbin309@gmail.com';
