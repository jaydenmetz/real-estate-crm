/**
 * Migration: Add owner_id column to appointments table
 * Date: October 22, 2025
 * Purpose: Phase 3 - Multi-tenant authorization requires owner_id for consistent access control
 *
 * This migration was executed directly on Railway production database.
 * Creating this file to document the schema change.
 *
 * Context: The appointments table was using agent_id while all other tables (escrows, clients,
 * listings, leads) use owner_id. This caused stats.controller.js queries to fail.
 */

-- Add owner_id column (nullable initially)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Populate owner_id from existing agent_id
UPDATE appointments SET owner_id = agent_id WHERE agent_id IS NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON appointments(owner_id);

-- Add foreign key constraint
ALTER TABLE appointments
ADD CONSTRAINT IF NOT EXISTS appointments_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- Verification query (run manually to confirm):
-- SELECT COUNT(*) as total_appointments,
--        COUNT(owner_id) as with_owner_id
-- FROM appointments;
