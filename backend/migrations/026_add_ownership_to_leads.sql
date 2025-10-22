-- Migration 026: Add ownership to leads (with privacy support)
-- Purpose: Allow agents to mark leads as private (hidden from broker/team_owner)
-- Created: October 22, 2025

-- Step 1: Add ownership columns
ALTER TABLE leads ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN is_private BOOLEAN DEFAULT FALSE;

-- Step 2: Populate owner_id from user_id (existing creator)
UPDATE leads SET owner_id = user_id WHERE user_id IS NOT NULL;

-- Step 3: Create indexes for fast ownership queries
CREATE INDEX idx_leads_owner_id ON leads(owner_id);
CREATE INDEX idx_leads_is_private ON leads(is_private) WHERE is_private = TRUE;

-- Step 4: Create composite index for owner + private queries
CREATE INDEX idx_leads_owner_private ON leads(owner_id, is_private);

-- Rollback (if needed):
-- DROP INDEX idx_leads_owner_id;
-- DROP INDEX idx_leads_is_private;
-- DROP INDEX idx_leads_owner_private;
-- ALTER TABLE leads DROP COLUMN is_private;
-- ALTER TABLE leads DROP COLUMN owner_id;
