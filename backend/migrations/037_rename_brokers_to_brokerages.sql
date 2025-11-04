-- Migration: Rename brokers → brokerages and add designated broker
-- Date: 2025-11-03
-- Purpose: Separate brokerage (company) from broker (DRE-licensed person)

-- Rename table for clarity
ALTER TABLE IF EXISTS brokers RENAME TO brokerages;

-- Add designated broker reference (the DRE-licensed broker who heads the brokerage)
ALTER TABLE brokerages ADD COLUMN IF NOT EXISTS designated_broker_user_id UUID REFERENCES users(id);

-- Create index for designated broker lookups
CREATE INDEX IF NOT EXISTS idx_brokerages_designated_broker ON brokerages(designated_broker_user_id);

COMMENT ON TABLE brokerages IS 'Real estate brokerage companies (corporations/entities)';
COMMENT ON COLUMN brokerages.designated_broker_user_id IS 'User ID of the DRE-licensed broker (Licensed Officer per DRE)';
COMMENT ON COLUMN brokerages.name IS 'Name of the designated broker/licensed officer';
COMMENT ON COLUMN brokerages.company_name IS 'Legal name of the brokerage entity';
