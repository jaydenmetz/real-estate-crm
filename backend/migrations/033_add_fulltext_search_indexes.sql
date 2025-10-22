-- Migration 033: Add full-text search indexes
-- Purpose: Fast search for 1M+ brokers, teams, users
-- Created: October 22, 2025

-- Step 1: Enable pg_trgm extension (trigram matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Create trigram indexes for fuzzy search
CREATE INDEX idx_users_name_trgm ON users USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_users_email_trgm ON users USING gin (email gin_trgm_ops);
CREATE INDEX idx_teams_name_trgm ON teams USING gin (name gin_trgm_ops);
CREATE INDEX idx_brokers_name_trgm ON brokers USING gin (broker_name gin_trgm_ops);

-- Step 3: Add GIN indexes for array searches (if needed)
-- CREATE INDEX idx_users_licensed_states_gin ON users USING gin (licensed_states);

-- Rollback (if needed):
-- DROP INDEX idx_users_name_trgm;
-- DROP INDEX idx_users_email_trgm;
-- DROP INDEX idx_teams_name_trgm;
-- DROP INDEX idx_brokers_name_trgm;
-- DROP EXTENSION pg_trgm;
