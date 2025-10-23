-- Migration 016: Create data_access_control table for per-resource sharing
-- Created: October 22, 2025
-- Purpose: Store granular access permissions for specific resources

CREATE TABLE IF NOT EXISTS data_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Resource identification
  resource_type VARCHAR(50) NOT NULL, -- escrow, client, lead, listing, appointment
  resource_id UUID NOT NULL,

  -- Access grants (one of these will be set)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,

  -- Permission levels
  can_view BOOLEAN DEFAULT TRUE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,

  -- Audit
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints: exactly one of user_id, team_id, broker_id must be set
  CHECK (
    (user_id IS NOT NULL AND team_id IS NULL AND broker_id IS NULL) OR
    (user_id IS NULL AND team_id IS NOT NULL AND broker_id IS NULL) OR
    (user_id IS NULL AND team_id IS NULL AND broker_id IS NOT NULL)
  )
);

CREATE INDEX idx_dac_resource ON data_access_control(resource_type, resource_id);
CREATE INDEX idx_dac_user_id ON data_access_control(user_id);
CREATE INDEX idx_dac_team_id ON data_access_control(team_id);
CREATE INDEX idx_dac_broker_id ON data_access_control(broker_id);
CREATE INDEX idx_dac_resource_user ON data_access_control(resource_type, resource_id, user_id);

-- Verification
SELECT COUNT(*) as data_access_control_table_created FROM data_access_control;
