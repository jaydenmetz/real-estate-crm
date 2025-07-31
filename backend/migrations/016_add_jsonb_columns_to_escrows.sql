-- Migration: Add JSONB columns to escrows table for comprehensive data storage
-- This migration adds JSONB columns to store complex escrow data without helper tables

BEGIN;

-- Add JSONB columns to escrows table
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS people JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS financials JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS checklists JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS expenses JSONB DEFAULT '[]';

-- Add indexes for better query performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_escrows_people ON escrows USING gin(people);
CREATE INDEX IF NOT EXISTS idx_escrows_timeline ON escrows USING gin(timeline);
CREATE INDEX IF NOT EXISTS idx_escrows_financials ON escrows USING gin(financials);
CREATE INDEX IF NOT EXISTS idx_escrows_documents ON escrows USING gin(documents);

-- Add new columns for additional escrow data
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5,2) DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS gross_commission NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS my_commission NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_adjustments NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expense_adjustments NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_coe_date DATE,
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS transaction_coordinator VARCHAR(255),
ADD COLUMN IF NOT EXISTS nhd_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS avid BOOLEAN DEFAULT false;

-- Update existing escrows with empty JSONB structures if null
UPDATE escrows 
SET 
  people = CASE WHEN people IS NULL THEN '{}' ELSE people END,
  timeline = CASE WHEN timeline IS NULL THEN '[]' ELSE timeline END,
  financials = CASE WHEN financials IS NULL THEN '{}' ELSE financials END,
  checklists = CASE WHEN checklists IS NULL THEN '{}' ELSE checklists END,
  documents = CASE WHEN documents IS NULL THEN '[]' ELSE documents END,
  expenses = CASE WHEN expenses IS NULL THEN '[]' ELSE expenses END;

-- Add comments for documentation
COMMENT ON COLUMN escrows.people IS 'JSONB storage for all transaction participants (client, agents, officers, etc.)';
COMMENT ON COLUMN escrows.timeline IS 'JSONB array of important dates and milestones';
COMMENT ON COLUMN escrows.financials IS 'JSONB storage for all financial details including commission breakdown';
COMMENT ON COLUMN escrows.checklists IS 'JSONB storage for checklist items organized by category';
COMMENT ON COLUMN escrows.documents IS 'JSONB array of document references';
COMMENT ON COLUMN escrows.expenses IS 'JSONB array of expense items';

COMMIT;