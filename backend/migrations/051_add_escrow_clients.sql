-- Migration: Add clients JSONB column to escrows table
-- This column stores buyer and seller client associations for each escrow
-- Structure: {"buyers": [{Client}...], "sellers": [{Client}...]}
-- Max 6 buyers and 6 sellers (12 total for dual agency)

-- Add clients column with default empty structure
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS clients JSONB DEFAULT '{"buyers": [], "sellers": []}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN escrows.clients IS 'JSONB column storing buyer and seller client associations. Structure: {"buyers": [{Client}...], "sellers": [{Client}...]}. Max 6 per role.';

-- Update existing rows to have the default structure if NULL
UPDATE escrows
SET clients = '{"buyers": [], "sellers": []}'::jsonb
WHERE clients IS NULL;

-- Add check constraint to ensure valid structure (optional but recommended)
ALTER TABLE escrows
ADD CONSTRAINT clients_structure_check
CHECK (
  clients ? 'buyers' AND
  clients ? 'sellers' AND
  jsonb_typeof(clients->'buyers') = 'array' AND
  jsonb_typeof(clients->'sellers') = 'array'
);

-- Create index on clients for faster queries
CREATE INDEX IF NOT EXISTS idx_escrows_clients ON escrows USING GIN (clients);
