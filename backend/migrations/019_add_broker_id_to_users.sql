-- Migration 025: Add broker_id to users
-- Purpose: Link users to their broker for multi-tenant hierarchy
-- Created: October 22, 2025

-- Step 1: Add broker_id column (nullable initially)
ALTER TABLE users ADD COLUMN broker_id UUID;

-- Step 2: Populate broker_id from teams.primary_broker_id
UPDATE users u
SET broker_id = t.primary_broker_id
FROM teams t
WHERE u.team_id = t.team_id
  AND t.primary_broker_id IS NOT NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE users
ADD CONSTRAINT users_broker_id_fkey
FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE SET NULL;

-- Step 4: Create index for fast broker queries
CREATE INDEX idx_users_broker_id ON users(broker_id);
CREATE INDEX idx_users_role ON users(role);

-- Step 5: Create composite index for broker + team queries
CREATE INDEX idx_users_broker_team ON users(broker_id, team_id);

-- Rollback (if needed):
-- ALTER TABLE users DROP CONSTRAINT users_broker_id_fkey;
-- DROP INDEX idx_users_broker_id;
-- DROP INDEX idx_users_role;
-- DROP INDEX idx_users_broker_team;
-- ALTER TABLE users DROP COLUMN broker_id;
