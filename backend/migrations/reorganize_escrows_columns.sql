-- Migration: Reorganize escrows table columns for better readability
-- This reorganizes columns into logical groups matching API structure
-- Note: PostgreSQL doesn't support reordering columns directly, so we need to recreate the table

BEGIN;

-- Create new table with organized column order
CREATE TABLE escrows_new (
  -- Primary Identifiers (what uniquely identifies this escrow)
  id                      VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id              VARCHAR(50) NOT NULL,
  numeric_id              INTEGER NOT NULL DEFAULT nextval('escrows_numeric_id_seq'),
  team_sequence_id        INTEGER,

  -- Property Information (what property is being sold)
  property_address        TEXT NOT NULL,
  city                    VARCHAR(100),
  state                   VARCHAR(2),
  property_type           VARCHAR(100) DEFAULT 'Single Family',
  property_image_url      TEXT,
  zillow_url              TEXT,
  zillow_image_url        TEXT,

  -- Financial Data (purchase price and basic financials)
  purchase_price          NUMERIC(12,2) NOT NULL,
  earnest_money_deposit   NUMERIC(10,2),
  down_payment            NUMERIC(10,2),
  loan_amount             NUMERIC(12,2),

  -- Commission Data (agent compensation)
  commission_percentage   NUMERIC(5,2) DEFAULT 2.5,
  gross_commission        NUMERIC(10,2),
  net_commission          NUMERIC(10,2),
  my_commission           NUMERIC(12,2) DEFAULT 0,
  commission_adjustments  NUMERIC(12,2) DEFAULT 0,
  expense_adjustments     NUMERIC(12,2) DEFAULT 0,

  -- Timeline/Dates (important transaction dates)
  acceptance_date         DATE,
  closing_date            DATE,
  actual_coe_date         DATE,

  -- Status & Classification (current state of the deal)
  escrow_status           VARCHAR(50) DEFAULT 'Active',
  lead_source             VARCHAR(100),
  avid                    BOOLEAN DEFAULT false,

  -- Contact Information (key people involved)
  escrow_company          VARCHAR(255),
  escrow_officer_name     VARCHAR(255),
  escrow_officer_email    VARCHAR(255),
  escrow_officer_phone    VARCHAR(50),
  title_company           VARCHAR(255),
  lender_name             VARCHAR(255),
  loan_officer_name       VARCHAR(255),
  loan_officer_email      VARCHAR(255),
  loan_officer_phone      VARCHAR(50),
  transaction_coordinator VARCHAR(255),
  nhd_company             VARCHAR(255),

  -- JSONB Data Structures (complex nested data matching API)
  people                  JSONB DEFAULT '{}'::jsonb,
  timeline                JSONB DEFAULT '[]'::jsonb,
  financials              JSONB DEFAULT '{}'::jsonb,
  checklists              JSONB DEFAULT '{}'::jsonb,
  documents               JSONB DEFAULT '[]'::jsonb,
  expenses                JSONB DEFAULT '[]'::jsonb,

  -- Ownership & Metadata (who owns this and when was it modified)
  created_by              UUID,
  team_id                 UUID,
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at              TIMESTAMP WITH TIME ZONE
);

-- Copy all data from old table to new table
INSERT INTO escrows_new SELECT
  id,
  display_id,
  numeric_id,
  team_sequence_id,
  property_address,
  city,
  state,
  property_type,
  property_image_url,
  zillow_url,
  zillow_image_url,
  purchase_price,
  earnest_money_deposit,
  down_payment,
  loan_amount,
  commission_percentage,
  gross_commission,
  net_commission,
  my_commission,
  commission_adjustments,
  expense_adjustments,
  acceptance_date,
  closing_date,
  actual_coe_date,
  escrow_status,
  lead_source,
  avid,
  escrow_company,
  escrow_officer_name,
  escrow_officer_email,
  escrow_officer_phone,
  title_company,
  lender_name,
  loan_officer_name,
  loan_officer_email,
  loan_officer_phone,
  transaction_coordinator,
  nhd_company,
  people,
  timeline,
  financials,
  checklists,
  documents,
  expenses,
  created_by,
  team_id,
  created_at,
  updated_at,
  deleted_at
FROM escrows;

-- Drop old table and rename new table
DROP TABLE escrows;
ALTER TABLE escrows_new RENAME TO escrows;

-- Recreate all indexes
CREATE INDEX idx_escrows_team_id ON escrows(team_id);
CREATE INDEX idx_escrows_created_by ON escrows(created_by);
CREATE INDEX idx_escrows_status ON escrows(escrow_status);
CREATE INDEX idx_escrows_closing_date ON escrows(closing_date);
CREATE INDEX idx_escrows_display_id ON escrows(display_id);
CREATE UNIQUE INDEX idx_escrows_team_sequence ON escrows(team_id, team_sequence_id) WHERE team_sequence_id IS NOT NULL;
CREATE INDEX idx_escrows_deleted_at ON escrows(deleted_at);

-- Recreate foreign key constraints
ALTER TABLE escrows ADD CONSTRAINT fk_escrows_team
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE;

ALTER TABLE escrows ADD CONSTRAINT fk_escrows_created_by
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate triggers for updated_at
CREATE OR REPLACE FUNCTION update_escrows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_escrows_updated_at ON escrows;
CREATE TRIGGER update_escrows_updated_at
  BEFORE UPDATE ON escrows
  FOR EACH ROW
  EXECUTE FUNCTION update_escrows_updated_at();

COMMIT;

-- Verify column order
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'escrows'
ORDER BY ordinal_position;
