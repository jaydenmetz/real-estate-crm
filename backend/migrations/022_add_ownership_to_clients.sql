-- Migration 028: Add ownership to clients (NO privacy - broker always sees)
-- Purpose: Track client ownership but keep visible to broker
-- Created: October 22, 2025

-- Step 1: Add owner_id column
ALTER TABLE clients ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Step 2: Populate owner_id from created_by if exists, or team's first user
UPDATE clients c SET owner_id = (
  SELECT u.id FROM users u WHERE u.team_id = c.team_id LIMIT 1
) WHERE owner_id IS NULL;

-- Step 3: Create index for fast ownership queries
CREATE INDEX idx_clients_owner_id ON clients(owner_id);

-- Rollback (if needed):
-- DROP INDEX idx_clients_owner_id;
-- ALTER TABLE clients DROP COLUMN owner_id;
