-- Add 'escrow-' prefix to UUID IDs
-- This makes IDs more readable and identifiable

-- First, let's create a custom function to generate escrow IDs
CREATE OR REPLACE FUNCTION generate_escrow_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'escrow-' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

-- Update existing IDs to have the prefix (if they don't already)
UPDATE escrows 
SET id = 'escrow-' || id::text
WHERE id::text NOT LIKE 'escrow-%';

-- Change the column type to TEXT to accommodate the prefix
ALTER TABLE escrows 
ALTER COLUMN id TYPE TEXT USING id::text;

-- Update the default value to use our custom function
ALTER TABLE escrows 
ALTER COLUMN id SET DEFAULT generate_escrow_id();

-- Ensure the column is still NOT NULL and PRIMARY KEY
ALTER TABLE escrows 
ALTER COLUMN id SET NOT NULL;

-- If primary key was dropped, recreate it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'escrows' 
    AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE escrows ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Update any foreign key references in helper tables
UPDATE escrow_checklists 
SET escrow_id = 'escrow-' || escrow_id
WHERE escrow_id NOT LIKE 'escrow-%' 
AND EXISTS (SELECT 1 FROM escrows WHERE id = 'escrow-' || escrow_checklists.escrow_id);

UPDATE escrow_timeline 
SET escrow_id = 'escrow-' || escrow_id
WHERE escrow_id NOT LIKE 'escrow-%'
AND EXISTS (SELECT 1 FROM escrows WHERE id = 'escrow-' || escrow_timeline.escrow_id);

UPDATE escrow_financials 
SET escrow_id = 'escrow-' || escrow_id
WHERE escrow_id NOT LIKE 'escrow-%'
AND EXISTS (SELECT 1 FROM escrows WHERE id = 'escrow-' || escrow_financials.escrow_id);

UPDATE escrow_documents 
SET escrow_id = 'escrow-' || escrow_id
WHERE escrow_id NOT LIKE 'escrow-%'
AND EXISTS (SELECT 1 FROM escrows WHERE id = 'escrow-' || escrow_documents.escrow_id);

-- Update comment
COMMENT ON COLUMN escrows.id IS 'Primary key - UUID with escrow- prefix for readability';

-- Verify the results
SELECT 
  'IDs updated with escrow- prefix' as status,
  COUNT(*) as total_escrows,
  COUNT(*) FILTER (WHERE id LIKE 'escrow-%') as escrows_with_prefix
FROM escrows;

-- Show sample data
SELECT id, numeric_id, display_id, property_address
FROM escrows
ORDER BY numeric_id
LIMIT 5;