-- Fix escrow IDs to be simple incrementing numbers
-- This handles the case where some IDs might already be numbers

BEGIN;

-- Step 1: Temporarily update all IDs to avoid conflicts
-- Add a prefix to make them unique
UPDATE escrows 
SET id = 'TEMP_' || id;

-- Step 2: Now update to sequential numbers based on creation order
WITH numbered_escrows AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as new_id
  FROM escrows
)
UPDATE escrows e
SET id = n.new_id::text
FROM numbered_escrows n
WHERE e.id = n.id;

-- Verify the results
SELECT id, property_address, created_at 
FROM escrows 
ORDER BY id::integer;

COMMIT;