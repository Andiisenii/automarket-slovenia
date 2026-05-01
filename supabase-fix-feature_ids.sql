-- =============================================
-- AutoMarket Slovenia - FIX feature_ids COLUMN TYPE
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop the integer column if it exists and recreate as TEXT[]
ALTER TABLE cars DROP COLUMN IF EXISTS feature_ids;
ALTER TABLE cars ADD COLUMN feature_ids TEXT[];

-- Verify
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'cars' AND column_name = 'feature_ids';

SELECT 'feature_ids column is now TEXT[]' AS status;
