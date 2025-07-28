-- Clean up redundant columns in escrows table
-- This ensures both local and production databases have the same structure

-- Drop global_id if it still exists (it should be renamed to id by now)
ALTER TABLE escrows DROP COLUMN IF EXISTS global_id CASCADE;

-- Drop uuid column if it exists (redundant with id)
ALTER TABLE escrows DROP COLUMN IF EXISTS uuid CASCADE;

-- Ensure we have the proper columns with correct types
-- id: UUID (primary key)
DO $$
BEGIN
    -- Ensure id column is UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'escrows' 
        AND column_name = 'id' 
        AND data_type != 'uuid'
    ) THEN
        -- This shouldn't happen, but just in case
        RAISE EXCEPTION 'id column exists but is not UUID type';
    END IF;
    
    -- Ensure id has proper constraints
    ALTER TABLE escrows ALTER COLUMN id SET NOT NULL;
    ALTER TABLE escrows ALTER COLUMN id SET DEFAULT gen_random_uuid();
    
    -- Ensure primary key is on id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'escrows' 
        AND constraint_type = 'PRIMARY KEY'
        AND constraint_name = 'escrows_pkey'
    ) THEN
        ALTER TABLE escrows ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Ensure numeric_id exists and has proper constraints
ALTER TABLE escrows 
    ALTER COLUMN numeric_id SET NOT NULL,
    ALTER COLUMN numeric_id SET DEFAULT nextval('escrows_numeric_id_seq');

-- Ensure display_id exists
ALTER TABLE escrows 
    ALTER COLUMN display_id SET NOT NULL;

-- Drop any redundant constraints
ALTER TABLE escrows DROP CONSTRAINT IF EXISTS unique_global_id CASCADE;
ALTER TABLE escrows DROP CONSTRAINT IF EXISTS escrows_uuid_unique CASCADE;

-- Add useful indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_escrows_display_id ON escrows(display_id);
CREATE INDEX IF NOT EXISTS idx_escrows_numeric_id ON escrows(numeric_id);
CREATE INDEX IF NOT EXISTS idx_escrows_team_id ON escrows(team_id);
CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(escrow_status);

-- Update column comments
COMMENT ON COLUMN escrows.id IS 'Primary key - UUID for guaranteed uniqueness';
COMMENT ON COLUMN escrows.numeric_id IS 'Simple sequential number (1, 2, 3...)';
COMMENT ON COLUMN escrows.display_id IS 'User-friendly format (ESCROW-2025-0001)';
COMMENT ON COLUMN escrows.team_sequence_id IS 'Legacy team-specific sequence - kept for compatibility';

-- Verify final structure
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'escrows' 
    AND column_name IN ('id', 'numeric_id', 'display_id');
    
    IF col_count = 3 THEN
        RAISE NOTICE 'Success: escrows table has correct ID columns (id, numeric_id, display_id)';
    ELSE
        RAISE WARNING 'Check failed: Expected 3 ID columns, found %', col_count;
    END IF;
    
    -- Check that unwanted columns are gone
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'escrows' 
        AND column_name IN ('global_id', 'uuid')
    ) THEN
        RAISE WARNING 'Cleanup may have failed - global_id or uuid column still exists';
    ELSE
        RAISE NOTICE 'Success: Removed redundant columns (global_id, uuid)';
    END IF;
END $$;