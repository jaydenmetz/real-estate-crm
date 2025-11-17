-- Migration: Add DRE license tracking to users
-- Date: 2025-11-03
-- Purpose: Track California DRE license information for all licensed agents/brokers

-- Add DRE license fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS dre_license_id VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS dre_license_type VARCHAR(20); -- 'salesperson' or 'broker'
ALTER TABLE users ADD COLUMN IF NOT EXISTS dre_license_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS dre_license_expiration DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dre_license_issued_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dre_broker_license_issued_date DATE; -- NULL for salespersons
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailing_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailing_city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailing_state VARCHAR(2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailing_zip VARCHAR(10);

-- Create broker history table (tracks brokerage changes)
CREATE TABLE IF NOT EXISTS broker_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brokerage_id UUID NOT NULL REFERENCES brokerages(id),
  brokerage_license_id VARCHAR(20),
  brokerage_name VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_broker_history_user ON broker_history(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_history_brokerage ON broker_history(brokerage_id);
CREATE INDEX IF NOT EXISTS idx_broker_history_current ON broker_history(user_id, is_current) WHERE is_current = true;

COMMENT ON TABLE broker_history IS 'Historical record of agent/broker brokerage affiliations per DRE';
COMMENT ON COLUMN broker_history.is_current IS 'True for current brokerage, false for former';
COMMENT ON COLUMN users.dre_license_id IS 'California DRE license number (8 digits)';
COMMENT ON COLUMN users.dre_license_type IS 'salesperson or broker per DRE';
