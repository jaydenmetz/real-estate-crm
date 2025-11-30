-- Migration: Add representation_type column to escrows table
-- This column indicates the agent's role in the transaction
-- Values: 'buyer' (buyer's agent), 'seller' (seller's agent), 'dual' (dual agency)

-- Add representation_type column
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS representation_type VARCHAR(20) DEFAULT 'buyer';

-- Add comment for documentation
COMMENT ON COLUMN escrows.representation_type IS 'Agent representation type: buyer (buyer''s agent), seller (seller''s agent), or dual (dual agency)';

-- Add check constraint to ensure valid values
ALTER TABLE escrows
ADD CONSTRAINT representation_type_check
CHECK (representation_type IN ('buyer', 'seller', 'dual'));

-- Create index for filtering by representation type
CREATE INDEX IF NOT EXISTS idx_escrows_representation_type ON escrows(representation_type);

-- Update existing rows to have 'buyer' as default if NULL
UPDATE escrows
SET representation_type = 'buyer'
WHERE representation_type IS NULL;
