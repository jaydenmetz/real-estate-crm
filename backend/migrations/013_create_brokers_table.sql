-- Create brokers table to hold multiple teams
-- A broker can manage multiple teams and have overarching permissions

CREATE TABLE IF NOT EXISTS brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    license_number VARCHAR(100),
    license_state VARCHAR(2),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    website VARCHAR(255),
    logo_url TEXT,
    
    -- Broker settings
    settings JSONB DEFAULT '{}',
    
    -- Commission splits and financial settings
    commission_split_default DECIMAL(5,2), -- Default commission split for teams
    monthly_fee DECIMAL(10,2), -- Monthly fee charged to teams
    transaction_fee DECIMAL(10,2), -- Per transaction fee
    
    -- Status and timestamps
    is_active BOOLEAN DEFAULT true,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create broker_teams junction table to link brokers with teams
CREATE TABLE IF NOT EXISTS broker_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    
    -- Team-specific settings under this broker
    commission_split DECIMAL(5,2), -- Override default split for this team
    monthly_fee DECIMAL(10,2), -- Override monthly fee for this team
    transaction_fee DECIMAL(10,2), -- Override transaction fee
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, terminated
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    terminated_at TIMESTAMP,
    
    -- Unique constraint to prevent duplicate relationships
    UNIQUE(broker_id, team_id)
);

-- Create broker_users table for broker-level administrators
CREATE TABLE IF NOT EXISTS broker_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Broker-level roles
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- owner, admin, manager, viewer
    
    -- Permissions at broker level
    permissions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(broker_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_brokers_email ON brokers(email);
CREATE INDEX idx_brokers_is_active ON brokers(is_active);
CREATE INDEX idx_broker_teams_broker_id ON broker_teams(broker_id);
CREATE INDEX idx_broker_teams_team_id ON broker_teams(team_id);
CREATE INDEX idx_broker_teams_status ON broker_teams(status);
CREATE INDEX idx_broker_users_broker_id ON broker_users(broker_id);
CREATE INDEX idx_broker_users_user_id ON broker_users(user_id);

-- Add broker_id column to teams table for primary broker relationship
ALTER TABLE teams ADD COLUMN IF NOT EXISTS primary_broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_teams_primary_broker_id ON teams(primary_broker_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brokers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brokers_updated_at_trigger
BEFORE UPDATE ON brokers
FOR EACH ROW
EXECUTE FUNCTION update_brokers_updated_at();

CREATE TRIGGER update_broker_users_updated_at_trigger
BEFORE UPDATE ON broker_users
FOR EACH ROW
EXECUTE FUNCTION update_brokers_updated_at();

-- Add comments for documentation
COMMENT ON TABLE brokers IS 'Stores broker organizations that can manage multiple teams';
COMMENT ON TABLE broker_teams IS 'Junction table linking brokers to teams they manage';
COMMENT ON TABLE broker_users IS 'Users with broker-level administrative permissions';
COMMENT ON COLUMN brokers.commission_split_default IS 'Default commission split percentage for teams under this broker';
COMMENT ON COLUMN broker_teams.status IS 'Relationship status: active, suspended, or terminated';
COMMENT ON COLUMN broker_users.role IS 'Broker-level role: owner, admin, manager, or viewer';