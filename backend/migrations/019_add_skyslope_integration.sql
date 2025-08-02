-- Migration: Add SkySlope integration fields and commission tracking
BEGIN;

-- Add SkySlope integration fields to escrows
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS skyslope_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS skyslope_type VARCHAR(50), -- 'sale' or 'listing'
ADD COLUMN IF NOT EXISTS skyslope_sync_status VARCHAR(50) DEFAULT 'pending', -- pending, synced, error
ADD COLUMN IF NOT EXISTS skyslope_last_sync TIMESTAMP,
ADD COLUMN IF NOT EXISTS transaction_side VARCHAR(50), -- 'buyer', 'seller', 'dual'
ADD COLUMN IF NOT EXISTS ytd_gci NUMERIC(12,2) DEFAULT 0, -- Year-to-date GCI at time of transaction
ADD COLUMN IF NOT EXISTS commission_split_percentage NUMERIC(5,2), -- Actual split percentage applied
ADD COLUMN IF NOT EXISTS cap_status VARCHAR(50); -- 'pre_cap', 'post_cap'

-- Create SkySlope document tracking table
CREATE TABLE IF NOT EXISTS escrow_skyslope_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id VARCHAR(255) REFERENCES escrows(id) ON DELETE CASCADE,
    skyslope_document_id VARCHAR(255),
    document_name VARCHAR(255),
    document_code VARCHAR(50),
    document_type VARCHAR(50),
    required BOOLEAN DEFAULT false,
    uploaded_date TIMESTAMP,
    skyslope_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, uploaded, approved, rejected
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create commission split rules table
CREATE TABLE IF NOT EXISTS commission_split_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_source VARCHAR(255),
    gci_threshold_min NUMERIC(12,2) DEFAULT 0,
    gci_threshold_max NUMERIC(12,2),
    split_percentage NUMERIC(5,2) NOT NULL,
    effective_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default commission split rules for current year
INSERT INTO commission_split_rules (lead_source, gci_threshold_min, gci_threshold_max, split_percentage, notes)
VALUES 
    ('default', 0, 50000, 70, 'Base split: 70% until $50k GCI'),
    ('default', 50000, 100000, 80, 'Mid-tier split: 80% from $50k-$100k GCI'),
    ('default', 100000, NULL, 100, 'Cap reached: 100% split after $100k GCI');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrows_skyslope_id ON escrows(skyslope_id);
CREATE INDEX IF NOT EXISTS idx_escrow_skyslope_documents_escrow_id ON escrow_skyslope_documents(escrow_id);
CREATE INDEX IF NOT EXISTS idx_commission_split_rules_lead_source ON commission_split_rules(lead_source);

-- Add comments
COMMENT ON COLUMN escrows.skyslope_id IS 'SkySlope transaction ID for API integration';
COMMENT ON COLUMN escrows.skyslope_type IS 'Type of SkySlope transaction: sale or listing';
COMMENT ON COLUMN escrows.ytd_gci IS 'Year-to-date GCI at the time of this transaction';
COMMENT ON COLUMN escrows.commission_split_percentage IS 'Actual commission split percentage applied based on GCI tier';
COMMENT ON COLUMN escrows.cap_status IS 'Whether agent had reached cap at time of transaction';

COMMIT;