-- Add password reset columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMP;

-- Create index for reset code lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_code ON users(reset_code);
