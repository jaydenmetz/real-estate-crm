/**
 * Migration 013: Add ownership columns to escrows table
 * Date: October 22, 2025
 * Purpose: Phase 6 - Enable data ownership and privacy controls
 *
 * Adds three critical columns:
 * - owner_id: Who owns this escrow (user who created it)
 * - is_private: Boolean flag for privacy (TRUE = only owner can see)
 * - access_level: Sharing scope (personal, team, broker)
 */

-- Add ownership columns
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'team';

-- Add CHECK constraint for valid access levels
ALTER TABLE escrows DROP CONSTRAINT IF EXISTS escrows_access_level_check;
ALTER TABLE escrows ADD CONSTRAINT escrows_access_level_check
  CHECK (access_level IN ('personal', 'team', 'broker'));

-- Populate owner_id from created_by (fallback to last_modified_by if created_by is NULL)
UPDATE escrows
SET owner_id = COALESCE(created_by, last_modified_by)
WHERE owner_id IS NULL;

-- If still NULL, assign to admin user as fallback
UPDATE escrows
SET owner_id = (SELECT id FROM users WHERE email = 'admin@jaydenmetz.com' LIMIT 1)
WHERE owner_id IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrows_owner_id ON escrows(owner_id);
CREATE INDEX IF NOT EXISTS idx_escrows_is_private ON escrows(is_private);
CREATE INDEX IF NOT EXISTS idx_escrows_access_level ON escrows(access_level);

-- Composite index for ownership queries (most common filter pattern)
CREATE INDEX IF NOT EXISTS idx_escrows_owner_private_access
  ON escrows(owner_id, is_private, access_level);

-- Verification query
SELECT
  COUNT(*) as total_escrows,
  COUNT(owner_id) as with_owner,
  COUNT(CASE WHEN is_private THEN 1 END) as private_count,
  COUNT(CASE WHEN access_level = 'personal' THEN 1 END) as personal,
  COUNT(CASE WHEN access_level = 'team' THEN 1 END) as team,
  COUNT(CASE WHEN access_level = 'broker' THEN 1 END) as broker
FROM escrows;

-- Expected result: with_owner should equal total_escrows
-- All escrows should have access_level = 'team' by default
