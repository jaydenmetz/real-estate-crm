-- Migration 027: Add ownership to escrows (NO privacy - broker always sees)
-- Purpose: Track escrow ownership but keep visible to broker
-- Created: October 22, 2025

-- Step 1: Add owner_id column
ALTER TABLE escrows ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Step 2: Populate owner_id from created_by
UPDATE escrows SET owner_id = created_by WHERE created_by IS NOT NULL;

-- Step 3: Create index for fast ownership queries
CREATE INDEX idx_escrows_owner_id ON escrows(owner_id);

-- Rollback (if needed):
-- DROP INDEX idx_escrows_owner_id;
-- ALTER TABLE escrows DROP COLUMN owner_id;
