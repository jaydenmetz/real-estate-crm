-- Migration 035: Create agent_kpis table
-- Purpose: Monthly KPI snapshots for broker dashboard
-- Created: October 22, 2025

CREATE TABLE agent_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL,

  -- Time period (monthly snapshots)
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Lead metrics
  total_leads INTEGER DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  converted_leads INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2), -- 2.35%

  -- Appointment metrics
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  show_rate NUMERIC(5,2), -- 73.5%

  -- Production metrics
  total_escrows INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,
  total_volume NUMERIC(12,2), -- $1,234,567.89
  total_commission NUMERIC(10,2),

  -- Activity tracking
  last_activity TIMESTAMP WITH TIME ZONE,
  days_active INTEGER, -- Days with activity in period

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX idx_agent_kpis_user ON agent_kpis(user_id);
CREATE INDEX idx_agent_kpis_broker ON agent_kpis(broker_id);
CREATE INDEX idx_agent_kpis_period ON agent_kpis(period_start, period_end);

-- Rollback (if needed):
-- DROP TABLE agent_kpis;
