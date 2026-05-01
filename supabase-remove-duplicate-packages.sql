-- =============================================
-- AutoMarket Slovenia - REMOVE DUPLICATE PACKAGES
-- Run this in Supabase SQL Editor
-- =============================================

-- Delete the duplicate packages created on 2026-04-29
DELETE FROM packages WHERE id >= 15;

-- Verify remaining packages (should be 8: OSNOVNI, PREMIUM, and 6 boost packages)
SELECT id, name, type, price, min_days FROM packages ORDER BY type, id;

SELECT 'Duplicates removed! Remaining packages: ' || COUNT(*) AS status FROM packages;
