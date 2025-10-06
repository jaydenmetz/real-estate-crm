-- Standardize escrow IDs to simple incrementing numbers
-- This script will update all escrow IDs to sequential numbers starting from 1

-- First, let's see what we're working with
SELECT id, property_address, created_at FROM escrows ORDER BY created_at;

-- Create a temporary table to map old IDs to new IDs
CREATE TEMP TABLE id_mapping AS
SELECT 
  id as old_id,
  ROW_NUMBER() OVER (ORDER BY created_at) as new_id
FROM escrows;

-- Show the mapping
SELECT * FROM id_mapping;

-- Update escrows table with new IDs
-- We need to update in a specific order to avoid conflicts
UPDATE escrows e
SET id = m.new_id::text
FROM id_mapping m
WHERE e.id = m.old_id;

-- Verify the update
SELECT id, property_address, created_at FROM escrows ORDER BY id::integer;

-- Clean up
DROP TABLE IF EXISTS id_mapping;