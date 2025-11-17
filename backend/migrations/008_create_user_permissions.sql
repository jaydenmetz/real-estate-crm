-- Migration 015: Create user_permissions table for team member permissions
-- Created: October 22, 2025
-- Purpose: Store per-user permission flags for team management

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,

  -- Permission flags
  can_delete BOOLEAN DEFAULT FALSE,
  can_edit_team_data BOOLEAN DEFAULT FALSE,
  can_view_financials BOOLEAN DEFAULT TRUE,
  can_manage_team BOOLEAN DEFAULT FALSE,
  is_broker_admin BOOLEAN DEFAULT FALSE,
  is_team_admin BOOLEAN DEFAULT FALSE,

  -- Audit
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, team_id)
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_team_id ON user_permissions(team_id);
CREATE INDEX idx_user_permissions_broker_id ON user_permissions(broker_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_permissions_updated_at
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_permissions_updated_at();

-- Verification
SELECT COUNT(*) as user_permissions_table_created FROM user_permissions;
