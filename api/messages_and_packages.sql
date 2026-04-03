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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcasts_created ON broadcasts(created_at DESC);

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

-- Insert default packages
INSERT INTO packages (type, name, name_sl, name_en, price, min_days, discount_percent, discount_active) VALUES
-- Publishing packages
('publishing', 'Osnovni', 'Osnovni paket', 'Basic Package', 34.99, 30, 0, FALSE),
('publishing', 'Premium', 'Premium paket', 'Premium Package', 64.99, 30, 0, FALSE),

-- Boost packages (private)
('boost_private', 'Akcija Private', 'Akcija - Zasebne osebe', 'Private Deal', 1.50, 15, 0, FALSE),
('boost_private', 'Top Private', 'Top izbira - Zasebne', 'Top Choice - Private', 1.50, 15, 0, FALSE),
('boost_private', 'Skok Private', 'Skok na vrh - Zasebne', 'Jump Top - Private', 1.00, 15, 0, FALSE),

-- Boost packages (business)
('boost_business', 'Akcija Business', 'Akcija - Trgovci', 'Business Deal', 0.75, 30, 0, FALSE),
('boost_business', 'Top Business', 'Top izbira - Trgovci', 'Top Choice - Business', 0.65, 30, 0, FALSE),
('boost_business', 'Skok Business', 'Skok na vrh - Trgovci', 'Jump Top - Business', 0.50, 30, 0, FALSE)

ON CONFLICT DO NOTHING;
