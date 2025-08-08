-- Add ownership columns to escrows table for user/team filtering

-- Add created_by column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' 
                   AND column_name = 'created_by') THEN
        ALTER TABLE escrows ADD COLUMN created_by UUID;
        
        -- Add foreign key constraint
        ALTER TABLE escrows ADD CONSTRAINT fk_escrows_created_by 
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
            
        -- Create index for performance
        CREATE INDEX idx_escrows_created_by ON escrows(created_by);
    END IF;
END $$;

-- Add team_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' 
                   AND column_name = 'team_id') THEN
        ALTER TABLE escrows ADD COLUMN team_id UUID;
        
        -- Add foreign key constraint
        ALTER TABLE escrows ADD CONSTRAINT fk_escrows_team 
            FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL;
            
        -- Create index for performance
        CREATE INDEX idx_escrows_team_id ON escrows(team_id);
    END IF;
END $$;

-- Update existing escrows to assign them to the first admin user (for testing)
-- In production, you'd want to properly migrate ownership
UPDATE escrows 
SET created_by = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE created_by IS NULL;

-- Set team_id based on the created_by user's team
UPDATE escrows e
SET team_id = u.team_id
FROM users u
WHERE e.created_by = u.id
AND e.team_id IS NULL;