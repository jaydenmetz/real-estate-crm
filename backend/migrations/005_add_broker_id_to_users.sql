/**
 * Migration 012: Add broker_id to users table
 * Date: October 22, 2025
 * Purpose: Phase 6 - Enable direct broker-to-user relationship for efficient queries
 *
 * This migration adds a denormalized broker_id column to users table.
 * Denormalization is intentional for query performance - allows "find all users under broker"
 * without joining through teams table.
 */

-- Add broker_id column (nullable initially)
ALTER TABLE users ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;

-- Populate broker_id from teams.primary_broker_id
UPDATE users u
SET broker_id = t.primary_broker_id
FROM teams t
WHERE u.team_id = t.team_id
AND u.broker_id IS NULL;

-- Create index for performance (critical for admin queries)
CREATE INDEX IF NOT EXISTS idx_users_broker_id ON users(broker_id);

-- Verification query
SELECT
  COUNT(*) as total_users,
  COUNT(broker_id) as users_with_broker,
  COUNT(CASE WHEN team_id IS NOT NULL AND broker_id IS NULL THEN 1 END) as orphaned_users
FROM users;

-- Expected result: users_with_broker should equal users with team_id
-- orphaned_users should be 0 (if not, investigate manually)
