-- Migration 029: Add ownership to listings (NO privacy - broker always sees)
-- Purpose: Track listing ownership but keep visible to broker
-- Created: October 22, 2025

-- Step 1: Add owner_id column
ALTER TABLE listings ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Step 2: Populate owner_id from team's first user
UPDATE listings l SET owner_id = (
  SELECT u.id FROM users u WHERE u.team_id = l.team_id LIMIT 1
) WHERE owner_id IS NULL;

-- Step 3: Create index for fast ownership queries
CREATE INDEX idx_listings_owner_id ON listings(owner_id);

-- Rollback (if needed):
-- DROP INDEX idx_listings_owner_id;
-- ALTER TABLE listings DROP COLUMN owner_id;
