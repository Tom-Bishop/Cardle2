-- Add is_admin column to users table for admin authentication
-- This enhances security by moving admin auth to the database

ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- Set Tom as admin (you'll need to set the password via the auth system)
-- UPDATE users SET is_admin = 1 WHERE username = 'Tom';
