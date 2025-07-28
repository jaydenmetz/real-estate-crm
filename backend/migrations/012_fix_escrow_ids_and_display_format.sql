-- Fix escrow IDs to use proper UUID, clean display_id format, and correct numeric_id
-- This migration ensures:
-- 1. id column already uses UUID format (no change needed)
-- 2. display_id has clean "ESCROW-2025-0001" format
-- 3. numeric_id is the simple sequential number (1, 2, 3...)

-- Current schema has:
-- - id as UUID (already correct)
-- - team_sequence_id instead of numeric_id
-- - display_id that needs proper formatting

-- Add numeric_id column if it doesn't exist
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS numeric_id INTEGER;

-- Also add uuid column as alias to id for compatibility
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS uuid UUID;

-- Create a sequence for numeric_id if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS escrows_numeric_id_seq START WITH 1;

-- Update existing records to have proper numeric_id based on team_sequence_id
UPDATE escrows 
SET numeric_id = team_sequence_id
WHERE numeric_id IS NULL AND team_sequence_id IS NOT NULL;

-- Set uuid to match id
UPDATE escrows
SET uuid = id
WHERE uuid IS NULL;

-- For any remaining NULL numeric_ids, assign sequential numbers
WITH numbered_escrows AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as new_numeric_id
  FROM escrows
  WHERE numeric_id IS NULL
)
UPDATE escrows e
SET numeric_id = n.new_numeric_id
FROM numbered_escrows n
WHERE e.id = n.id;

-- Now update display_id to have the proper format
-- First fix any display_ids that have the old format (ESC-2025-0001)
UPDATE escrows
SET display_id = REPLACE(display_id, 'ESC-', 'ESCROW-')
WHERE display_id LIKE 'ESC-%';

-- Then update any that don't have the proper format
UPDATE escrows
SET display_id = 'ESCROW-' || EXTRACT(YEAR FROM COALESCE(created_at, CURRENT_DATE))::text || '-' || LPAD(numeric_id::text, 4, '0')
WHERE display_id IS NULL OR (display_id NOT LIKE 'ESCROW-%' AND numeric_id IS NOT NULL);

-- Make numeric_id NOT NULL after populating
ALTER TABLE escrows 
ALTER COLUMN numeric_id SET NOT NULL;

-- Add constraint to ensure numeric_id is unique
ALTER TABLE escrows
DROP CONSTRAINT IF EXISTS escrows_numeric_id_unique;
ALTER TABLE escrows
ADD CONSTRAINT escrows_numeric_id_unique UNIQUE (numeric_id);

-- Set default for numeric_id
ALTER TABLE escrows 
ALTER COLUMN numeric_id SET DEFAULT nextval('escrows_numeric_id_seq');

-- Update the sequence to start after the highest numeric_id
SELECT setval('escrows_numeric_id_seq', COALESCE(MAX(numeric_id), 0) + 1) FROM escrows;

-- The id column is already UUID type, so we don't need to change it
-- Just ensure uuid column matches id for compatibility
UPDATE escrows
SET uuid = id
WHERE uuid IS NULL OR uuid != id;

-- Ensure uuid column is NOT NULL
ALTER TABLE escrows 
ALTER COLUMN uuid SET NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrows_numeric_id ON escrows(numeric_id);
CREATE INDEX IF NOT EXISTS idx_escrows_display_id ON escrows(display_id);

-- Update column comments
COMMENT ON COLUMN escrows.id IS 'Primary key - UUID for guaranteed uniqueness';
COMMENT ON COLUMN escrows.uuid IS 'Same as id - kept for backward compatibility';
COMMENT ON COLUMN escrows.numeric_id IS 'Simple sequential number (1, 2, 3...)';
COMMENT ON COLUMN escrows.display_id IS 'User-friendly format (ESCROW-2025-0001)';
COMMENT ON COLUMN escrows.team_sequence_id IS 'Legacy team-specific sequence - deprecated';

-- Create or replace the view to show all ID formats
CREATE OR REPLACE VIEW escrows_with_all_ids AS
SELECT 
  *,
  id::text as uuid_string,
  numeric_id::text as simple_id,
  display_id as formatted_id
FROM escrows;

-- Function to get next display_id for new escrows
CREATE OR REPLACE FUNCTION get_next_escrow_display_id()
RETURNS TEXT AS $$
DECLARE
  next_numeric INTEGER;
  current_year INTEGER;
BEGIN
  SELECT nextval('escrows_numeric_id_seq') INTO next_numeric;
  SELECT EXTRACT(YEAR FROM CURRENT_DATE) INTO current_year;
  RETURN 'ESCROW-' || current_year::text || '-' || LPAD(next_numeric::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set display_id on insert
CREATE OR REPLACE FUNCTION set_escrow_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := get_next_escrow_display_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS escrow_display_id_trigger ON escrows;
CREATE TRIGGER escrow_display_id_trigger
  BEFORE INSERT ON escrows
  FOR EACH ROW
  EXECUTE FUNCTION set_escrow_display_id();

-- Update any remaining display_ids that don't match the format
UPDATE escrows
SET display_id = 'ESCROW-' || EXTRACT(YEAR FROM COALESCE(created_at, CURRENT_DATE))::text || '-' || LPAD(numeric_id::text, 4, '0')
WHERE numeric_id IS NOT NULL AND (display_id IS NULL OR display_id !~ '^ESCROW-\d{4}-\d{4}$');

-- Fix the first escrow to have numeric_id = 1 if it's currently different
-- This ensures ESCROW-2025-0001 has numeric_id = 1
UPDATE escrows
SET numeric_id = 1
WHERE display_id = 'ESCROW-2025-0001' AND numeric_id != 1;

-- Resequence all numeric_ids to be consecutive starting from 1
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY COALESCE(team_sequence_id, 999999), created_at) as new_num
  FROM escrows
)
UPDATE escrows e
SET numeric_id = n.new_num
FROM numbered n
WHERE e.id = n.id;

-- Update display_ids one more time with the corrected numeric_ids
UPDATE escrows
SET display_id = 'ESCROW-' || EXTRACT(YEAR FROM COALESCE(created_at, CURRENT_DATE))::text || '-' || LPAD(numeric_id::text, 4, '0');

-- Final verification query (commented out, run manually to check)
-- SELECT 
--   id::text as uuid_id,
--   numeric_id,
--   display_id,
--   team_sequence_id,
--   property_address
-- FROM escrows
-- ORDER BY numeric_id;