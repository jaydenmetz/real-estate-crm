-- Add soft delete support to tables
-- Created: 2025-01-17

-- Add deleted_at column to escrows
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at column to other main tables
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for efficient filtering of non-deleted records
CREATE INDEX IF NOT EXISTS idx_escrows_deleted_at ON escrows(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_listings_deleted_at ON listings(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON leads(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON appointments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON notes(deleted_at) WHERE deleted_at IS NULL;