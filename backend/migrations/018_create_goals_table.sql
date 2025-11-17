-- Migration: Create goals table for user goal tracking
-- Created: 2025-10-21

BEGIN;

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,

  -- Goal metadata
  goal_type VARCHAR(50) NOT NULL, -- 'escrows', 'volume', 'commission', 'listings', 'clients', 'leads', 'appointments'
  period VARCHAR(20) NOT NULL DEFAULT 'yearly', -- 'yearly', 'quarterly', 'monthly', 'custom'
  year INTEGER NOT NULL,
  quarter INTEGER, -- 1-4 for quarterly goals
  month INTEGER, -- 1-12 for monthly goals

  -- Goal targets
  target_count INTEGER, -- Number target (e.g., 50 escrows)
  target_volume NUMERIC(12, 2), -- Dollar target for volume (e.g., $15,000,000)
  target_commission NUMERIC(12, 2), -- Dollar target for commission (e.g., $450,000)

  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one goal per type/period/year combination per user
  UNIQUE(user_id, goal_type, period, year, quarter, month)
);

-- Create indexes for performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_team_id ON goals(team_id);
CREATE INDEX idx_goals_type_period ON goals(goal_type, period);
CREATE INDEX idx_goals_year ON goals(year);
CREATE INDEX idx_goals_active ON goals(is_active);

-- Create composite index for common queries
CREATE INDEX idx_goals_user_type_year ON goals(user_id, goal_type, year) WHERE is_active = true;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goals_timestamp
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

-- Add comments for documentation
COMMENT ON TABLE goals IS 'User and team goal tracking for various metrics';
COMMENT ON COLUMN goals.goal_type IS 'Type of goal: escrows, volume, commission, listings, clients, leads, appointments';
COMMENT ON COLUMN goals.period IS 'Goal period: yearly, quarterly, monthly, custom';
COMMENT ON COLUMN goals.target_count IS 'Numeric target (e.g., 50 closed escrows)';
COMMENT ON COLUMN goals.target_volume IS 'Dollar volume target (e.g., $15M in sales)';
COMMENT ON COLUMN goals.target_commission IS 'Commission earnings target (e.g., $450K)';

COMMIT;
