-- Migration: Add missing fields identified from Notion data
-- This adds vendor company fields and additional date tracking

BEGIN;

-- Add vendor company fields
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS home_warranty_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS termite_inspection_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS home_inspection_company VARCHAR(255);

-- Add missing core fields first
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5,2) DEFAULT 3,
ADD COLUMN IF NOT EXISTS gross_commission NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS my_commission NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS commission_adjustments NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expense_adjustments NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS earnest_money_deposit NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS acceptance_date DATE,
ADD COLUMN IF NOT EXISTS actual_coe_date DATE,
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS transaction_coordinator VARCHAR(255),
ADD COLUMN IF NOT EXISTS nhd_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS avid BOOLEAN DEFAULT false;

-- Add date tracking fields  
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS contingencies_date DATE,
ADD COLUMN IF NOT EXISTS emd_date DATE;

-- Add listings reference (as JSONB for flexibility)
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS listings JSONB DEFAULT '[]';

-- Add comments
COMMENT ON COLUMN escrows.home_warranty_company IS 'Home warranty provider company name';
COMMENT ON COLUMN escrows.termite_inspection_company IS 'Termite inspection company name';
COMMENT ON COLUMN escrows.home_inspection_company IS 'Home inspection company name';
COMMENT ON COLUMN escrows.contingencies_date IS 'Date when contingencies are due';
COMMENT ON COLUMN escrows.emd_date IS 'Earnest money deposit date';
COMMENT ON COLUMN escrows.listings IS 'Associated property listings';

COMMIT;