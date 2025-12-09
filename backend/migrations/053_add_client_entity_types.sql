-- Migration: Add entity type support to clients
-- This enables clients to be:
--   - individual: A person buying/selling in their own name
--   - trust: A trust entity (e.g., "Smith Family Trust")
--   - corporation: A corporation (e.g., "ABC Corp")
--   - llc: A limited liability company (e.g., "123 Main Street LLC")
--   - partnership: A partnership entity
--   - estate: An estate (e.g., "Estate of John Smith")
--   - power_of_attorney: Someone acting under power of attorney

-- Add entity type fields to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS entity_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS representative_title VARCHAR(100);

-- Add check constraint for valid entity types
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_entity_type_check;
ALTER TABLE clients ADD CONSTRAINT clients_entity_type_check
CHECK (entity_type IN ('individual', 'trust', 'corporation', 'llc', 'partnership', 'estate', 'power_of_attorney'));

-- Add index for entity type filtering
CREATE INDEX IF NOT EXISTS idx_clients_entity_type ON clients(entity_type);

-- Update display_name column to support longer entity names
ALTER TABLE clients ALTER COLUMN display_name TYPE VARCHAR(300);

-- Add comment explaining the entity type system
COMMENT ON COLUMN clients.entity_type IS 'Type of legal entity: individual, trust, corporation, llc, partnership, estate, power_of_attorney';
COMMENT ON COLUMN clients.entity_name IS 'Name of the entity (e.g., "Smith Family Trust", "ABC Corp"). For individuals, this is typically NULL.';
COMMENT ON COLUMN clients.representative_title IS 'Title of the contact as representative (e.g., "Trustee", "Managing Member", "President", "Executor", "Attorney-in-Fact")';
