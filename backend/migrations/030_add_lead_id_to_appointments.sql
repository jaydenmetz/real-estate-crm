-- Migration 030: Add lead_id to appointments (inherits privacy from lead)
-- Purpose: Link appointments to leads so privacy is inherited
-- Created: October 22, 2025

-- Step 1: Add lead_id column
ALTER TABLE appointments ADD COLUMN lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;

-- Step 2: Create index for fast lead lookup
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);

-- Rollback (if needed):
-- DROP INDEX idx_appointments_lead_id;
-- ALTER TABLE appointments DROP COLUMN lead_id;
