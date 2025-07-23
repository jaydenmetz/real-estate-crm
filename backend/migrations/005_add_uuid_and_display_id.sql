-- Add UUID and display_id to escrows table for proper unique identification
-- This allows both user-friendly URLs and guaranteed uniqueness

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add new columns to escrows
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
ADD COLUMN IF NOT EXISTS display_id INTEGER;

-- Populate display_id with current numeric IDs
UPDATE escrows 
SET display_id = CASE 
  WHEN id ~ '^\d+$' THEN id::INTEGER
  ELSE NULL
END;

-- For any NULL display_ids, assign sequential numbers
WITH numbered_escrows AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) + (SELECT COALESCE(MAX(display_id), 0) FROM escrows) as new_display_id
  FROM escrows
  WHERE display_id IS NULL
)
UPDATE escrows e
SET display_id = n.new_display_id
FROM numbered_escrows n
WHERE e.id = n.id;

-- Make display_id NOT NULL and UNIQUE after populating
ALTER TABLE escrows 
ALTER COLUMN display_id SET NOT NULL,
ADD CONSTRAINT escrows_display_id_unique UNIQUE (display_id);

-- Create a sequence for auto-incrementing display_id
CREATE SEQUENCE IF NOT EXISTS escrows_display_id_seq;
SELECT setval('escrows_display_id_seq', (SELECT MAX(display_id) FROM escrows));
ALTER TABLE escrows ALTER COLUMN display_id SET DEFAULT nextval('escrows_display_id_seq');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrows_uuid ON escrows(uuid);
CREATE INDEX IF NOT EXISTS idx_escrows_display_id ON escrows(display_id);

-- Add a comment explaining the dual ID system
COMMENT ON COLUMN escrows.uuid IS 'Globally unique identifier for the escrow';
COMMENT ON COLUMN escrows.display_id IS 'User-friendly sequential number for URLs and display';
COMMENT ON COLUMN escrows.id IS 'Legacy ID field - will be migrated to UUID as primary key';

-- Create a view that makes it easy to work with both IDs
CREATE OR REPLACE VIEW escrows_with_ids AS
SELECT 
  *,
  display_id::text as url_id,
  uuid::text as unique_id
FROM escrows;