-- Migration 032: Create data_access_control table
-- Purpose: Per-resource collaborator access (share specific escrows)
-- Created: October 22, 2025

CREATE TABLE data_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(50) NOT NULL, -- 'escrow', 'client', 'listing', 'lead'
  resource_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Access levels
  can_view BOOLEAN DEFAULT TRUE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,

  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(resource_type, resource_id, user_id)
);

CREATE INDEX idx_dac_resource ON data_access_control(resource_type, resource_id);
CREATE INDEX idx_dac_user ON data_access_control(user_id);

-- Rollback (if needed):
-- DROP TABLE data_access_control;
