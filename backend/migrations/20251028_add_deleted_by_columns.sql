-- Migration: Add deleted_by audit columns
-- Date: 2025-10-28
-- Purpose: Track which user soft-deleted each entity for audit trail
-- Required for: Archive/restore functionality with user attribution

-- Add deleted_by column to all entity tables
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Add comments for documentation
COMMENT ON COLUMN escrows.deleted_by IS 'User ID who soft-deleted this escrow (for audit trail)';
COMMENT ON COLUMN clients.deleted_by IS 'User ID who soft-deleted this client (for audit trail)';
COMMENT ON COLUMN leads.deleted_by IS 'User ID who soft-deleted this lead (for audit trail)';
COMMENT ON COLUMN appointments.deleted_by IS 'User ID who soft-deleted this appointment (for audit trail)';
COMMENT ON COLUMN listings.deleted_by IS 'User ID who soft-deleted this listing (for audit trail)';

-- Note: No indexes needed on deleted_by as it's only used for audit display, not filtering
