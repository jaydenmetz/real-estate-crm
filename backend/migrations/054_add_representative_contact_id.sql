-- Migration: Add representative_contact_id to clients
-- This links entity clients (Trust, Corporation, LLC, etc.) to their representative contact

-- Add representative_contact_id column
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS representative_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_representative_contact_id ON clients(representative_contact_id);

-- Add comment explaining the field
COMMENT ON COLUMN clients.representative_contact_id IS 'Foreign key to contacts table for the representative of an entity (Trust, Corporation, LLC, etc.). For individual clients, this is typically NULL.';
