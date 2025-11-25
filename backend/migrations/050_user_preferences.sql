-- Migration 050: User Preferences
-- Purpose: Store user-specific UI preferences that sync across devices
-- Use cases: Default view mode, sort order, dashboard layout
-- Replaces: Device-specific localStorage for professional multi-device experience

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Ensure one preference per user per key
  UNIQUE(user_id, preference_key)
);

-- Indexes for fast lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);
CREATE INDEX idx_user_preferences_user_key ON user_preferences(user_id, preference_key);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Insert default preferences for existing users
-- Format: entity.property = value
-- Examples:
--   escrows.viewMode = "card"
--   escrows.sortBy = "closing_date"
--   leads.viewMode = "list"

INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT
  id as user_id,
  'escrows.viewMode' as preference_key,
  '{"value": "card"}'::jsonb as preference_value
FROM users
ON CONFLICT (user_id, preference_key) DO NOTHING;

INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT
  id as user_id,
  'escrows.sortBy' as preference_key,
  '{"value": "closing_date"}'::jsonb as preference_value
FROM users
ON CONFLICT (user_id, preference_key) DO NOTHING;

-- Comments
COMMENT ON TABLE user_preferences IS 'User-specific UI preferences that sync across devices';
COMMENT ON COLUMN user_preferences.preference_key IS 'Dot-notation key (e.g., escrows.viewMode, leads.sortBy)';
COMMENT ON COLUMN user_preferences.preference_value IS 'JSONB value allowing complex preferences';
