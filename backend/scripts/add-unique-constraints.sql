-- Ensure escrow IDs are unique and use proper sequencing
-- This prevents any possibility of duplicate IDs

-- First, let's check current state
SELECT id, property_address, created_at FROM escrows ORDER BY created_at;

-- Create a sequence for escrow IDs if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS escrow_id_seq START WITH 3;

-- Add a unique constraint on the id column if it doesn't exist
ALTER TABLE escrows 
ADD CONSTRAINT escrows_id_unique UNIQUE (id);

-- Add a trigger to auto-generate IDs for new escrows
CREATE OR REPLACE FUNCTION generate_escrow_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If no ID provided, generate the next one
  IF NEW.id IS NULL THEN
    NEW.id := nextval('escrow_id_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS escrow_id_trigger ON escrows;
CREATE TRIGGER escrow_id_trigger
BEFORE INSERT ON escrows
FOR EACH ROW
EXECUTE FUNCTION generate_escrow_id();

-- Update the sequence to start after the highest existing ID
SELECT setval('escrow_id_seq', 
  GREATEST(
    COALESCE((SELECT MAX(id::integer) FROM escrows WHERE id ~ '^\d+$'), 0),
    2
  ) + 1
);

-- Verify the setup
SELECT 
  nextval('escrow_id_seq') as next_id,
  (SELECT MAX(id::integer) FROM escrows WHERE id ~ '^\d+$') as current_max;