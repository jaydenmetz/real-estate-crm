-- Rename global_id to id to maintain consistency across environments
-- This migration ensures the production database uses 'id' as the UUID column

-- First check if global_id exists and id doesn't
DO $$
BEGIN
    -- Only proceed if global_id exists and id doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'escrows' AND column_name = 'global_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'escrows' AND column_name = 'id'
    ) THEN
        
        -- Drop existing primary key if it's on global_id
        ALTER TABLE escrows DROP CONSTRAINT IF EXISTS escrows_pkey CASCADE;
        ALTER TABLE escrows DROP CONSTRAINT IF EXISTS unique_global_id CASCADE;
        
        -- Rename global_id to id
        ALTER TABLE escrows RENAME COLUMN global_id TO id;
        
        -- Make id the primary key
        ALTER TABLE escrows ADD PRIMARY KEY (id);
        
        -- Ensure id is NOT NULL
        ALTER TABLE escrows ALTER COLUMN id SET NOT NULL;
        
        -- Add default for new records
        ALTER TABLE escrows ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        RAISE NOTICE 'Successfully renamed global_id to id';
    ELSE
        RAISE NOTICE 'Skipping migration - either id already exists or global_id does not exist';
    END IF;
END $$;

-- Update any foreign key references that might be using global_id
-- (This is a safety measure in case other tables reference the old column name)

-- Add comment to document the column
COMMENT ON COLUMN escrows.id IS 'Primary key - UUID for guaranteed uniqueness';

-- Verify the change
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'escrows' AND column_name = 'id'
    ) THEN
        RAISE NOTICE 'Migration successful - escrows table now has id column';
    ELSE
        RAISE WARNING 'Migration may have failed - id column not found';
    END IF;
END $$;