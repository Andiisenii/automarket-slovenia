-- ============================================
-- AutoMarket Slovenia - Supabase Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    user_type TEXT DEFAULT 'private' CHECK (user_type IN ('private', 'business')),
    logo_url TEXT,
    profile_photo TEXT,
    has_phone INTEGER DEFAULT 0,
    has_whatsapp INTEGER DEFAULT 0,
    has_viber INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CARS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    year INTEGER,
    price NUMERIC(12,2),
    mileage INTEGER,
    fuel_type TEXT,
    transmission TEXT,
    body_type TEXT,
    engine TEXT,
    horsepower INTEGER,
    color TEXT,
    city TEXT,
    description TEXT,
    images TEXT[], -- Array of image URLs
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold')),
    featured BOOLEAN DEFAULT FALSE,
    promoted BOOLEAN DEFAULT FALSE,
    has_boost BOOLEAN DEFAULT FALSE,
    boost_package UUID,
    boost_spent NUMERIC(10,2) DEFAULT 0,
    is_luxury_car BOOLEAN DEFAULT FALSE,
    has_financing BOOLEAN DEFAULT FALSE,
    monthly_budget NUMERIC(10,2),
    down_payment_type TEXT,
    down_payment_value NUMERIC(10,2),
    feature_ids INTEGER[],
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_sl TEXT,
    type TEXT NOT NULL CHECK (type IN ('publishing', 'boost_private', 'boost_business')),
    price NUMERIC(10,2) NOT NULL,
    min_days INTEGER DEFAULT 30,
    discount_percent INTEGER DEFAULT 0,
    discount_active BOOLEAN DEFAULT FALSE,
    features TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER_PACKAGES TABLE (Purchased packages)
-- ============================================
CREATE TABLE IF NOT EXISTS user_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    package_name TEXT,
    package_type TEXT,
    price_paid NUMERIC(10,2),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE (Payment records)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    package_type TEXT,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BROADCASTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
    subject TEXT,
    content TEXT NOT NULL,
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, car_id)
);

-- ============================================
-- CAR FEATURES TABLE (Optional - for car equipment)
-- ============================================
CREATE TABLE IF NOT EXISTS car_features (
    id SERIAL PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_sl TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_packages_user_id ON user_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_packages_expires ON user_packages(expires_at);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users: Anyone can sign up, users can read their own data
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Cars: Anyone can view active cars, users can manage their own
CREATE POLICY "Anyone can view active cars" ON cars
    FOR SELECT USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can insert their own cars" ON cars
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cars" ON cars
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own cars" ON cars
    FOR DELETE USING (user_id = auth.uid());

-- Packages: Anyone can view active packages
CREATE POLICY "Anyone can view active packages" ON packages
    FOR SELECT USING (is_active = TRUE);

-- Messages: Users can view their own messages
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own read status" ON messages
    FOR UPDATE USING (recipient_id = auth.uid());

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add their own favorites" ON favorites
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- SEED DATA - Default Packages
-- ============================================
INSERT INTO packages (name, name_sl, type, price, min_days, features) VALUES
-- Publishing packages
('Basic', 'Osnovni', 'publishing', 34.99, 30, ARRAY['Up to 100 listings', '10 photos per listing', 'Basic features']),
('Premium', 'Premium', 'publishing', 64.99, 30, ARRAY['Unlimited listings', '30 photos per listing', 'HD images', '360° photos', 'Priority support']),
-- Boost packages - Private
('Top Choice - Private', 'Top izbira - Zasebno', 'boost_private', 1.50, 15, ARRAY['Top of listings', 'Increased visibility']),
('Jump to Top - Private', 'Skok na vrh - Zasebno', 'boost_private', 1.00, 15, ARRAY['Jump to top', 'Quick boost']),
-- Boost packages - Business
('Top Choice - Business', 'Top izbira - Poslovno', 'boost_business', 0.65, 30, ARRAY['Top of listings', 'Maximum visibility', 'Badge indicator']),
('Jump to Top - Business', 'Skok na vrh - Poslovno', 'boost_business', 0.50, 30, ARRAY['Jump to top', 'Fast results'])
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cars_updated_at ON cars;
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
