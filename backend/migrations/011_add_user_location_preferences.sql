-- Migration: Add user location preferences
-- Description: Add fields for user's home city, state, and licensed states for personalized search
-- Date: 2025-01-20

-- Add location preference columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS home_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS home_state VARCHAR(2),
ADD COLUMN IF NOT EXISTS home_zip VARCHAR(10),
ADD COLUMN IF NOT EXISTS home_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS home_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS licensed_states TEXT[], -- Array of state codes like ['CA', 'NV', 'AZ']
ADD COLUMN IF NOT EXISTS search_radius_miles INTEGER DEFAULT 50; -- Default 50 mile radius

-- Add indexes for location queries
CREATE INDEX IF NOT EXISTS idx_users_home_state ON users(home_state);
CREATE INDEX IF NOT EXISTS idx_users_licensed_states ON users USING GIN(licensed_states);

-- Set default values for existing users (Bakersfield for now, users can update)
UPDATE users
SET
  home_city = COALESCE(home_city, 'Bakersfield'),
  home_state = COALESCE(home_state, 'CA'),
  home_zip = COALESCE(home_zip, '93301'),
  home_lat = COALESCE(home_lat, 35.3733),
  home_lng = COALESCE(home_lng, -119.0187),
  licensed_states = COALESCE(licensed_states, ARRAY['CA']),
  search_radius_miles = COALESCE(search_radius_miles, 50)
WHERE home_city IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.home_city IS 'User primary working city for address searches';
COMMENT ON COLUMN users.home_state IS 'User primary working state (2-letter code)';
COMMENT ON COLUMN users.home_zip IS 'User primary working ZIP code';
COMMENT ON COLUMN users.home_lat IS 'Latitude of user home city for distance calculations';
COMMENT ON COLUMN users.home_lng IS 'Longitude of user home city for distance calculations';
COMMENT ON COLUMN users.licensed_states IS 'Array of states where user is licensed to operate';
COMMENT ON COLUMN users.search_radius_miles IS 'Default search radius for address lookups in miles';