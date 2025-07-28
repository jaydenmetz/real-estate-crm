-- Combined migration to fix production database
-- Run this directly in Railway's SQL interface

-- Step 1: Rename global_id to id (if needed)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'escrows' AND column_name = 'global_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'escrows' AND column_name = 'id'
    ) THEN
        -- Drop constraints
        ALTER TABLE escrows DROP CONSTRAINT IF EXISTS escrows_pkey CASCADE;
        ALTER TABLE escrows DROP CONSTRAINT IF EXISTS unique_global_id CASCADE;
        
        -- Rename column
        ALTER TABLE escrows RENAME COLUMN global_id TO id;
        
        -- Add primary key
        ALTER TABLE escrows ADD PRIMARY KEY (id);
        ALTER TABLE escrows ALTER COLUMN id SET NOT NULL;
        ALTER TABLE escrows ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        RAISE NOTICE 'Successfully renamed global_id to id';
    END IF;
END $$;

-- Step 2: Add numeric_id if it doesn't exist
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS numeric_id INTEGER;

-- Create sequence for numeric_id
CREATE SEQUENCE IF NOT EXISTS escrows_numeric_id_seq START WITH 1;

-- Populate numeric_id from team_sequence_id
UPDATE escrows 
SET numeric_id = team_sequence_id
WHERE numeric_id IS NULL AND team_sequence_id IS NOT NULL;

-- For any NULL numeric_ids, assign sequential numbers
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_num
  FROM escrows
  WHERE numeric_id IS NULL
)
UPDATE escrows e
SET numeric_id = n.new_num
FROM numbered n
WHERE e.id = n.id;

-- Make numeric_id NOT NULL with sequence default
ALTER TABLE escrows 
ALTER COLUMN numeric_id SET NOT NULL,
ALTER COLUMN numeric_id SET DEFAULT nextval('escrows_numeric_id_seq');

-- Update sequence to start after max value
SELECT setval('escrows_numeric_id_seq', COALESCE(MAX(numeric_id), 0) + 1) FROM escrows;

-- Step 3: Fix display_id format
UPDATE escrows
SET display_id = REPLACE(display_id, 'ESC-', 'ESCROW-')
WHERE display_id LIKE 'ESC-%';

UPDATE escrows
SET display_id = 'ESCROW-' || EXTRACT(YEAR FROM COALESCE(created_at, CURRENT_DATE))::text || '-' || LPAD(numeric_id::text, 4, '0')
WHERE display_id IS NULL OR display_id NOT LIKE 'ESCROW-%';

-- Step 4: Ensure numeric_id = 1 for first escrow
UPDATE escrows
SET numeric_id = 1
WHERE display_id = 'ESCROW-2025-0001' AND numeric_id != 1;

-- Resequence all numeric_ids
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY COALESCE(team_sequence_id, 999999), created_at) as new_num
  FROM escrows
)
UPDATE escrows e
SET numeric_id = n.new_num
FROM numbered n
WHERE e.id = n.id;

-- Update display_ids with corrected numeric_ids
UPDATE escrows
SET display_id = 'ESCROW-' || EXTRACT(YEAR FROM COALESCE(created_at, CURRENT_DATE))::text || '-' || LPAD(numeric_id::text, 4, '0');

-- Step 5: Clean up redundant columns
ALTER TABLE escrows DROP COLUMN IF EXISTS global_id CASCADE;
ALTER TABLE escrows DROP COLUMN IF EXISTS uuid CASCADE;

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrows_display_id ON escrows(display_id);
CREATE INDEX IF NOT EXISTS idx_escrows_numeric_id ON escrows(numeric_id);

-- Step 7: Add unique constraint on numeric_id
ALTER TABLE escrows DROP CONSTRAINT IF EXISTS escrows_numeric_id_unique;
ALTER TABLE escrows ADD CONSTRAINT escrows_numeric_id_unique UNIQUE (numeric_id);

-- Step 8: Record migrations as applied
INSERT INTO migrations (filename) VALUES 
  ('013_rename_global_id_to_id.sql'),
  ('014_cleanup_escrow_columns.sql')
ON CONFLICT (filename) DO NOTHING;

-- Verify the results
SELECT 
  'Table structure updated successfully!' as status,
  COUNT(*) as total_escrows,
  MIN(numeric_id) as min_numeric_id,
  MAX(numeric_id) as max_numeric_id
FROM escrows;

-- Show sample data
SELECT id::text, numeric_id, display_id, property_address
FROM escrows
ORDER BY numeric_id
LIMIT 5;