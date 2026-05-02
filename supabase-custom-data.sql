-- =============================================
-- AutoMarket Slovenia - CUSTOM BRANDS/MODELS TABLE
-- Run this in Supabase SQL Editor
-- =============================================

-- Create table for custom brands and models
CREATE TABLE IF NOT EXISTS custom_data (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'brand' or 'model'
  brand_name VARCHAR(255) NOT NULL,
  model_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_custom_data_type ON custom_data(type);
CREATE INDEX IF NOT EXISTS idx_custom_data_brand ON custom_data(brand_name);

-- Allow public access
DROP POLICY IF EXISTS "Anyone can view custom_data" ON custom_data;
CREATE POLICY "Anyone can view custom_data" ON custom_data FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can insert custom_data" ON custom_data;
CREATE POLICY "Anyone can insert custom_data" ON custom_data FOR INSERT WITH CHECK (TRUE);

SELECT 'Custom data table created!' AS status;
