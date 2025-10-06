-- Ensure all escrows have created_at and updated_at timestamps
-- This prevents any NULL timestamp issues

-- First, update any NULL created_at to current timestamp
UPDATE escrows 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Update any NULL updated_at to created_at or current timestamp
UPDATE escrows 
SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;

-- Add NOT NULL constraints if they don't exist
ALTER TABLE escrows 
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN updated_at SET NOT NULL;

-- Verify no NULL timestamps remain
SELECT 
  id, 
  property_address,
  created_at,
  updated_at
FROM escrows 
WHERE created_at IS NULL OR updated_at IS NULL;