-- Phase 1: Production Hardening - Add Optimistic Locking
-- Migration: 003_optimistic_locking.sql
-- Purpose: Add version columns to prevent lost updates from concurrent modifications
-- Date: 2025-10-01

BEGIN;

-- 1. Add version column to escrows
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
CREATE INDEX IF NOT EXISTS idx_escrows_version ON escrows(id, version);
COMMENT ON COLUMN escrows.version IS 'Optimistic locking version for concurrent update detection';

-- 2. Add version column to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_version ON clients(id, version);
COMMENT ON COLUMN clients.version IS 'Optimistic locking version for concurrent update detection';

-- 3. Add version column to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_version ON listings(id, version);
COMMENT ON COLUMN listings.version IS 'Optimistic locking version for concurrent update detection';

-- 4. Add version column to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_version ON leads(id, version);
COMMENT ON COLUMN leads.version IS 'Optimistic locking version for concurrent update detection';

-- 5. Add version column to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_version ON appointments(id, version);
COMMENT ON COLUMN appointments.version IS 'Optimistic locking version for concurrent update detection';

-- 6. Add last_modified_by for audit trail
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES users(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES users(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES users(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES users(id);

COMMIT;
