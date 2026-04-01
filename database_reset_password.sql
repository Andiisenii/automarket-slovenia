-- Add reset password columns to users table
-- Run this in phpMyAdmin > SQL tab

ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(6) NULL,
ADD COLUMN reset_expires DATETIME NULL;
