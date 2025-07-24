-- Migration: Add numeric ID to escrows table for dual ID system
-- This allows accessing escrows by both /escrows/1 and /escrows/ESC-2025-001

-- Add numeric_id column
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS numeric_id SERIAL;

-- Create unique index on numeric_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_escrows_numeric_id ON escrows(numeric_id);

-- Rename current id column to display_id for clarity
ALTER TABLE escrows RENAME COLUMN id TO display_id;

-- Update existing rows to have sequential numeric IDs
UPDATE escrows 
SET numeric_id = sub.new_id
FROM (
  SELECT display_id, ROW_NUMBER() OVER (ORDER BY created_at, display_id) as new_id
  FROM escrows
) sub
WHERE escrows.display_id = sub.display_id;

-- Make numeric_id NOT NULL after populating
ALTER TABLE escrows ALTER COLUMN numeric_id SET NOT NULL;

-- Update foreign key constraints to use display_id
-- First drop existing constraints
ALTER TABLE escrow_checklists DROP CONSTRAINT IF EXISTS escrow_checklists_escrow_id_fkey;
ALTER TABLE escrow_buyers DROP CONSTRAINT IF EXISTS escrow_buyers_escrow_id_fkey;
ALTER TABLE escrow_sellers DROP CONSTRAINT IF EXISTS escrow_sellers_escrow_id_fkey;

-- Rename escrow_id columns to escrow_display_id for clarity
ALTER TABLE escrow_checklists RENAME COLUMN escrow_id TO escrow_display_id;
ALTER TABLE escrow_buyers RENAME COLUMN escrow_id TO escrow_display_id;
ALTER TABLE escrow_sellers RENAME COLUMN escrow_id TO escrow_display_id;

-- Re-add foreign key constraints
ALTER TABLE escrow_checklists 
  ADD CONSTRAINT escrow_checklists_escrow_display_id_fkey 
  FOREIGN KEY (escrow_display_id) REFERENCES escrows(display_id) ON DELETE CASCADE;

ALTER TABLE escrow_buyers 
  ADD CONSTRAINT escrow_buyers_escrow_display_id_fkey 
  FOREIGN KEY (escrow_display_id) REFERENCES escrows(display_id) ON DELETE CASCADE;

ALTER TABLE escrow_sellers 
  ADD CONSTRAINT escrow_sellers_escrow_display_id_fkey 
  FOREIGN KEY (escrow_display_id) REFERENCES escrows(display_id) ON DELETE CASCADE;

-- Add comment to explain the dual ID system
COMMENT ON COLUMN escrows.numeric_id IS 'Numeric ID for simple URL access (/escrows/1)';
COMMENT ON COLUMN escrows.display_id IS 'Display ID in format ESC-YYYY-XXXX for business use';

-- Create a view that shows both IDs for convenience
CREATE OR REPLACE VIEW escrows_with_ids AS
SELECT 
  numeric_id as id,
  display_id,
  property_address,
  escrow_status,
  escrow_number,
  purchase_price,
  earnest_money_deposit,
  down_payment,
  loan_amount,
  commission_percentage,
  gross_commission,
  net_commission,
  acceptance_date,
  closing_date,
  property_type,
  lead_source,
  created_at,
  updated_at
FROM escrows;