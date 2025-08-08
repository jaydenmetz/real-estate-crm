-- Drop existing tables if they exist
DROP TABLE IF EXISTS api_key_logs CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;

-- Create API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    team_id UUID,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{"escrows": ["read", "write"], "listings": ["read", "write"], "clients": ["read", "write"], "leads": ["read", "write"]}',
    last_used_at TIMESTAMP,
    last_used_ip VARCHAR(45),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE api_keys ADD CONSTRAINT fk_api_keys_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE api_keys ADD CONSTRAINT fk_api_keys_team 
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_team_id ON api_keys(team_id);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);

-- Create API key logs table
CREATE TABLE api_key_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for logs
ALTER TABLE api_key_logs ADD CONSTRAINT fk_api_key_logs_key
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE;

-- Create indexes for logs
CREATE INDEX idx_api_key_logs_api_key_id ON api_key_logs(api_key_id);
CREATE INDEX idx_api_key_logs_timestamp ON api_key_logs(request_timestamp);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_keys_updated_at_trigger
BEFORE UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION update_api_keys_updated_at();