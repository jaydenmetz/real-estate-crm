-- Migration 031: Create user_permissions table
-- Purpose: Global permissions granted by team_owner to team members
-- Created: October 22, 2025

CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,

  -- Global permissions
  can_delete BOOLEAN DEFAULT FALSE,
  can_edit_team_data BOOLEAN DEFAULT FALSE,
  can_view_financials BOOLEAN DEFAULT FALSE,
  can_manage_team BOOLEAN DEFAULT FALSE,

  -- Admin toggles (broker can grant)
  is_broker_admin BOOLEAN DEFAULT FALSE,
  is_team_admin BOOLEAN DEFAULT FALSE,

  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, team_id)
);

CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_team ON user_permissions(team_id);

-- Rollback (if needed):
-- DROP TABLE user_permissions;
