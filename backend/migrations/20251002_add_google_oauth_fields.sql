-- Migration: Add Google OAuth fields to users table
-- Created: 2025-10-02

-- Add Google OAuth fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN users.google_id IS 'Google OAuth user ID (sub claim from Google ID token)';
COMMENT ON COLUMN users.profile_picture_url IS 'URL to user profile picture (from Google or uploaded)';
