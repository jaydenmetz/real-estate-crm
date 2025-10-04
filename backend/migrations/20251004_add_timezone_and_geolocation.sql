-- Migration: Add Timezone Preferences and IP Geolocation
-- Date: 2025-10-04
-- Description: Add user timezone preferences and IP location data for security events and sessions

-- ============================================================================
-- 1. USER TIMEZONE PREFERENCES
-- ============================================================================

-- Add timezone column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Los_Angeles';

-- Add timezone preference metadata
COMMENT ON COLUMN users.timezone IS 'User preferred timezone (IANA format: America/Los_Angeles, America/New_York, etc.)';

-- ============================================================================
-- 2. IP GEOLOCATION FOR REFRESH TOKENS
-- ============================================================================

-- Add location fields to refresh_tokens
ALTER TABLE refresh_tokens
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_region VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_timezone VARCHAR(50);

-- Add comments
COMMENT ON COLUMN refresh_tokens.location_city IS 'City from IP geolocation (e.g., Los Angeles)';
COMMENT ON COLUMN refresh_tokens.location_region IS 'State/region from IP geolocation (e.g., California)';
COMMENT ON COLUMN refresh_tokens.location_country IS 'ISO 3166-1 alpha-2 country code (e.g., US)';
COMMENT ON COLUMN refresh_tokens.location_lat IS 'Latitude from IP geolocation';
COMMENT ON COLUMN refresh_tokens.location_lng IS 'Longitude from IP geolocation';
COMMENT ON COLUMN refresh_tokens.location_timezone IS 'Timezone from IP geolocation (e.g., America/Los_Angeles)';

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_location ON refresh_tokens(location_country, location_region, location_city);

-- ============================================================================
-- 3. IP GEOLOCATION FOR SECURITY EVENTS
-- ============================================================================

-- Add location fields to security_events
ALTER TABLE security_events
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_region VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_timezone VARCHAR(50);

-- Add comments
COMMENT ON COLUMN security_events.location_city IS 'City from IP geolocation';
COMMENT ON COLUMN security_events.location_region IS 'State/region from IP geolocation';
COMMENT ON COLUMN security_events.location_country IS 'ISO country code';
COMMENT ON COLUMN security_events.location_lat IS 'Latitude';
COMMENT ON COLUMN security_events.location_lng IS 'Longitude';
COMMENT ON COLUMN security_events.location_timezone IS 'Timezone from IP';

-- Create index for anomaly detection (find logins from unusual locations)
CREATE INDEX IF NOT EXISTS idx_security_events_location ON security_events(user_id, location_country, location_city);

-- ============================================================================
-- 4. COMMON TIMEZONES REFERENCE
-- ============================================================================

-- Create table for common timezones (for dropdown in UI)
CREATE TABLE IF NOT EXISTS timezones (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  offset VARCHAR(10) NOT NULL,
  display_name VARCHAR(150) NOT NULL
);

COMMENT ON TABLE timezones IS 'Common timezones for user preference dropdown';

-- Insert common US timezones
INSERT INTO timezones (code, name, offset, display_name) VALUES
('America/Los_Angeles', 'Pacific Time', 'UTC-8', '(UTC-8:00) Pacific Time - Los Angeles'),
('America/Denver', 'Mountain Time', 'UTC-7', '(UTC-7:00) Mountain Time - Denver'),
('America/Chicago', 'Central Time', 'UTC-6', '(UTC-6:00) Central Time - Chicago'),
('America/New_York', 'Eastern Time', 'UTC-5', '(UTC-5:00) Eastern Time - New York'),
('America/Phoenix', 'Arizona Time', 'UTC-7', '(UTC-7:00) Arizona Time (No DST)'),
('America/Anchorage', 'Alaska Time', 'UTC-9', '(UTC-9:00) Alaska Time'),
('Pacific/Honolulu', 'Hawaii Time', 'UTC-10', '(UTC-10:00) Hawaii Time')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Check users.timezone
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'timezone'
  ) THEN
    RAISE NOTICE '✅ users.timezone column added successfully';
  END IF;

  -- Check refresh_tokens location columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'refresh_tokens' AND column_name = 'location_city'
  ) THEN
    RAISE NOTICE '✅ refresh_tokens location columns added successfully';
  END IF;

  -- Check security_events location columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'security_events' AND column_name = 'location_city'
  ) THEN
    RAISE NOTICE '✅ security_events location columns added successfully';
  END IF;

  -- Check timezones table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'timezones') THEN
    RAISE NOTICE '✅ timezones table created successfully';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration completed successfully! 🎉';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Add timezone selector to Settings page';
  RAISE NOTICE '2. Integrate IP geolocation service (ipapi.co or ip-api.com)';
  RAISE NOTICE '3. Update auth.controller.js to capture location on login';
  RAISE NOTICE '4. Display times in user timezone throughout app';
  RAISE NOTICE '========================================';
END $$;
