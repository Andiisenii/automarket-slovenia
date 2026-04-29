-- =============================================
-- AutoMarket Slovenia - Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(50),
  user_type VARCHAR(20) DEFAULT 'private', -- 'private' or 'business'
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CARS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  vehicle_category VARCHAR(50) DEFAULT 'avto',
  vehicle_sub_category VARCHAR(100),
  vehicle_sub_category_detail VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  price DECIMAL(12,2),
  mileage INTEGER,
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  body_type VARCHAR(50),
  engine VARCHAR(100),
  horsepower INTEGER,
  color VARCHAR(50),
  city VARCHAR(100),
  description TEXT,
  
  -- Vehicle Condition
  vehicle_condition VARCHAR(50),
  vehicle_condition_sub TEXT[], -- Array of condition sub-options
  
  -- Images
  images TEXT[],
  
  -- Features
  feature_ids TEXT[],
  
  -- Fuel Consumption
  fuel_consumption DECIMAL(5,2),
  emission_class VARCHAR(20),
  co2_emissions INTEGER,
  auto_publish_fuel_data BOOLEAN DEFAULT FALSE,
  
  -- Vehicle Age & Ownership
  vehicle_age VARCHAR(20),
  has_warranty BOOLEAN DEFAULT FALSE,
  has_guarantee BOOLEAN DEFAULT FALSE,
  has_oldtimer_cert BOOLEAN DEFAULT FALSE,
  
  -- Registration
  first_reg_month VARCHAR(20),
  first_reg_year INTEGER,
  technical_valid_until DATE,
  owner_count INTEGER,
  
  -- Motor specific
  engine_capacity DECIMAL(6,2),
  engine_power_kw DECIMAL(6,2),
  cylinder_count INTEGER,
  engine_stroke VARCHAR(20),
  diff_lock VARCHAR(50),
  start_type VARCHAR(50),
  
  -- Kamion specific
  airbag_count_kamion INTEGER,
  nosilnost INTEGER,
  tovorni_prostor DECIMAL(8,2),
  zadnja_vrata TEXT[],
  stranska_vrata TEXT[],
  barva_oblazinjenja VARCHAR(50),
  oblazinjenje VARCHAR(50),
  streha_vozila TEXT[],
  vin VARCHAR(50),
  
  -- Tovorna prikolica specific
  dolzina DECIMAL(6,2),
  sirina DECIMAL(6,2),
  stev_osi INTEGER,
  dovoljena_skupna_tezza INTEGER,
  volumen DECIMAL(8,2),
  
  -- UTV specific
  utv_engine_capacity DECIMAL(6,2),
  utv_engine_power_km DECIMAL(6,2),
  utv_cylinder_count INTEGER,
  utv_engine_stroke VARCHAR(20),
  utv_diff_lock VARCHAR(50),
  utv_start_type VARCHAR(50),
  
  -- Seller Info (denormalized for performance)
  seller_name VARCHAR(255),
  seller_phone VARCHAR(50),
  seller_user_type VARCHAR(20),
  seller_verified BOOLEAN DEFAULT FALSE,
  
  -- Stats
  views INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'sold', 'deleted'
  
  -- Boost/Promo
  has_boost BOOLEAN DEFAULT FALSE,
  boost_package VARCHAR(50),
  boost_days INTEGER,
  boost_spent DECIMAL(8,2),
  is_featured BOOLEAN DEFAULT FALSE,
  is_promoted BOOLEAN DEFAULT FALSE,
  
  -- Luxury Car
  is_luxury_car BOOLEAN DEFAULT FALSE,
  
  -- Financing
  has_financing BOOLEAN DEFAULT FALSE,
  monthly_budget DECIMAL(10,2),
  down_payment_type VARCHAR(20),
  down_payment_value DECIMAL(10,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PURCHASED BOOSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS purchased_boosts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
  boost_type VARCHAR(50), -- 'top_izbira', 'skok_na_vrh', 'akcija'
  days INTEGER,
  price DECIMAL(8,2),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  receiver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

-- =============================================
-- PACKAGES TABLE (already exists, but ensure structure)
-- =============================================
-- This table should already exist from previous setup
-- If not, create it:

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  name_sl VARCHAR(100),
  type VARCHAR(50), -- 'publishing', 'boost_private', 'boost_business'
  price DECIMAL(8,2),
  min_days INTEGER DEFAULT 30,
  discount_percent INTEGER DEFAULT 0,
  discount_active BOOLEAN DEFAULT FALSE,
  features TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER PACKAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_packages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_city ON cars(city);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_car_id ON favorites(car_id);
CREATE INDEX IF NOT EXISTS idx_messages_car_id ON messages(car_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_packages ENABLE ROW LEVEL SECURITY;

-- Users: anyone can sign up, users can only see/edit their own data
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::integer = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid()::integer = id);

CREATE POLICY "Anyone can insert users (signup)" ON users
  FOR INSERT WITH CHECK (TRUE);

-- Cars: anyone can view active cars, users can manage their own
CREATE POLICY "Anyone can view active cars" ON cars
  FOR SELECT USING (status = 'active' OR user_id = auth.uid()::integer);

CREATE POLICY "Users can insert their own cars" ON cars
  FOR INSERT WITH CHECK (user_id = auth.uid()::integer);

CREATE POLICY "Users can update their own cars" ON cars
  FOR UPDATE USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can delete their own cars" ON cars
  FOR DELETE USING (user_id = auth.uid()::integer);

-- Messages: users can only see their own messages
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid()::integer OR receiver_id = auth.uid()::integer);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid()::integer);

-- Favorites: users can only see their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can manage their own favorites" ON favorites
  FOR ALL USING (user_id = auth.uid()::integer);

-- Purchased boosts: users can view their own
CREATE POLICY "Users can view their own boosts" ON purchased_boosts
  FOR SELECT USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can insert their own boosts" ON purchased_boosts
  FOR INSERT WITH CHECK (user_id = auth.uid()::integer);

-- Packages: anyone can view active packages
CREATE POLICY "Anyone can view active packages" ON packages
  FOR SELECT USING (is_active = TRUE);

-- User packages: users can view their own
CREATE POLICY "Users can view their own user packages" ON user_packages
  FOR SELECT USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can insert their own user packages" ON user_packages
  FOR INSERT WITH CHECK (user_id = auth.uid()::integer);

-- =============================================
-- INSERT DEFAULT PACKAGES (if not exists)
-- =============================================
INSERT INTO packages (name, name_sl, type, price, min_days, is_active) VALUES
  ('OSNOVNI', 'OSNOVNI', 'publishing', 34.99, 30, TRUE),
  ('PREMIUM', 'PREMIUM', 'publishing', 64.99, 30, TRUE),
  ('Paket vseh cen', 'Paket vseh cen', 'boost_private', 1.50, 15, TRUE),
  ('Paket vseh cen', 'Paket vseh cen', 'boost_business', 0.75, 30, TRUE),
  ('Top izbira', 'Top izbira', 'boost_private', 1.00, 15, TRUE),
  ('Top izbira', 'Top izbira', 'boost_business', 0.65, 30, TRUE),
  ('Skok na vrh', 'Skok na vrh', 'boost_private', 1.50, 15, TRUE),
  ('Skok na vrh', 'Skok na vrh', 'boost_business', 0.50, 30, TRUE)
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE!
-- =============================================
SELECT 'AutoMarket Slovenia Schema Created Successfully!' AS status;
