-- Add multi-tenant structure and three-tier escrow IDs
-- Created: 2025-07-25

-- 1. Add team_id to all relevant tables
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS team_id UUID,
ADD COLUMN IF NOT EXISTS team_sequence_id INTEGER,
ADD COLUMN IF NOT EXISTS global_id UUID DEFAULT gen_random_uuid();

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS team_id UUID;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS team_id UUID;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS team_id UUID;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS team_id UUID;

-- 2. Add role column for system_admin if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'user_role_extended'
    ) THEN
        CREATE TYPE user_role_extended AS ENUM (
            'system_admin',
            'admin',
            'broker',
            'agent',
            'assistant',
            'viewer'
        );
    END IF;
END $$;

-- Update role column to use new enum (if we can)
-- This is safe to run multiple times
DO $$
BEGIN
    -- Check if we need to update the column type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role' 
        AND data_type = 'character varying'
    ) THEN
        -- Add new role column with extended enum
        ALTER TABLE users ADD COLUMN role_new user_role_extended;
        
        -- Copy existing roles
        UPDATE users SET role_new = 
            CASE 
                WHEN role = 'system_admin' THEN 'system_admin'::user_role_extended
                WHEN role = 'admin' THEN 'admin'::user_role_extended
                WHEN role = 'broker' THEN 'broker'::user_role_extended
                WHEN role = 'agent' THEN 'agent'::user_role_extended
                WHEN role = 'assistant' THEN 'assistant'::user_role_extended
                ELSE 'viewer'::user_role_extended
            END;
            
        -- Drop old column and rename new one
        ALTER TABLE users DROP COLUMN role;
        ALTER TABLE users RENAME COLUMN role_new TO role;
    END IF;
END $$;

-- 3. Create sequence for team-specific escrow IDs
CREATE SEQUENCE IF NOT EXISTS escrow_team_sequence_seq;

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrows_team_id ON escrows(team_id);
CREATE INDEX IF NOT EXISTS idx_escrows_global_id ON escrows(global_id);
CREATE INDEX IF NOT EXISTS idx_escrows_team_sequence ON escrows(team_id, team_sequence_id);

CREATE INDEX IF NOT EXISTS idx_listings_team_id ON listings(team_id);
CREATE INDEX IF NOT EXISTS idx_clients_team_id ON clients(team_id);
CREATE INDEX IF NOT EXISTS idx_leads_team_id ON leads(team_id);
CREATE INDEX IF NOT EXISTS idx_appointments_team_id ON appointments(team_id);

-- 5. Add constraints
ALTER TABLE escrows 
ADD CONSTRAINT unique_team_display_id UNIQUE (team_id, display_id),
ADD CONSTRAINT unique_global_id UNIQUE (global_id);

-- 6. Create a view for admin to see all escrows across teams
CREATE OR REPLACE VIEW admin_all_escrows AS
SELECT 
    e.global_id,
    e.team_id,
    t.name as team_name,
    e.display_id,
    e.team_sequence_id,
    e.property_address,
    e.escrow_status,
    e.closing_date,
    e.created_at
FROM escrows e
LEFT JOIN teams t ON e.team_id = t.team_id;

-- 7. Create helper function to generate display IDs
CREATE OR REPLACE FUNCTION generate_escrow_display_id(p_team_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_year INTEGER;
    v_sequence INTEGER;
    v_display_id VARCHAR(20);
BEGIN
    v_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get next sequence for this team and year
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(display_id FROM 'ESC-\d{4}-(\d+)')
            AS INTEGER
        )
    ), 0) + 1
    INTO v_sequence
    FROM escrows
    WHERE team_id = p_team_id
    AND display_id LIKE CONCAT('ESC-', v_year, '-%');
    
    v_display_id := CONCAT('ESC-', v_year, '-', LPAD(v_sequence::TEXT, 3, '0'));
    
    RETURN v_display_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Update existing escrows to have global_ids if they don't
UPDATE escrows 
SET global_id = gen_random_uuid() 
WHERE global_id IS NULL;