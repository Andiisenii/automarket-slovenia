-- =============================================
-- AutoMarket Slovenia - Supabase Schema (FIXED)
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: Create CARS table first
-- =============================================
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  
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
  vehicle_condition_sub TEXT[],
  
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
  
  -- Seller Info
  seller_name VARCHAR(255),
  seller_phone VARCHAR(50),
  seller_user_type VARCHAR(20),
  seller_verified BOOLEAN DEFAULT FALSE,
  
  -- Stats
  views INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  
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
-- STEP 2: Create other tables (they reference cars now)
-- =============================================

-- USERS table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(50),
  user_type VARCHAR(20) DEFAULT 'private',
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MESSAGES table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
  sender_id INTEGER,
  receiver_id INTEGER,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAVORITES table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

-- PURCHASED BOOSTS table
CREATE TABLE IF NOT EXISTS purchased_boosts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
  boost_type VARCHAR(50),
  days INTEGER,
  price DECIMAL(8,2),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PACKAGES table
CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  name_sl VARCHAR(100),
  type VARCHAR(50),
  price DECIMAL(8,2),
  min_days INTEGER DEFAULT 30,
  discount_percent INTEGER DEFAULT 0,
  discount_active BOOLEAN DEFAULT FALSE,
  features TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER PACKAGES table
CREATE TABLE IF NOT EXISTS user_packages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- =============================================
-- STEP 3: Create INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_city ON cars(city);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at DESC);

-- =============================================
-- STEP 4: Insert default PACKAGES
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
SELECT 'Schema Created Successfully!' AS status;
