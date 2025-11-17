-- Migration 023: Update appointments.listing_id foreign key to SET NULL on delete
-- Created: 2025-10-21
-- Purpose: Allow listing deletion without deleting appointments
--
-- Business Logic:
-- - Appointments are independent calendar events that MAY reference a listing
-- - When a listing is deleted, appointments should remain but become unlinked
-- - Example: "Showing at 123 Main St" remains in calendar after listing sells
--
-- Before: Cannot delete listing if appointments exist (foreign key violation)
-- After: Deleting listing sets listing_id = NULL on appointments (seamless)

BEGIN;

-- Drop the existing foreign key constraint
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_listing_id_fkey;

-- Recreate with ON DELETE SET NULL
ALTER TABLE appointments
ADD CONSTRAINT appointments_listing_id_fkey
FOREIGN KEY (listing_id)
REFERENCES listings(id)
ON DELETE SET NULL;

-- Verify the constraint was created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'appointments_listing_id_fkey'
    AND table_name = 'appointments'
  ) THEN
    RAISE EXCEPTION 'Failed to create appointments_listing_id_fkey constraint';
  END IF;

  RAISE NOTICE 'Successfully updated appointments.listing_id foreign key constraint to ON DELETE SET NULL';
END $$;

COMMIT;

-- Rollback script (if needed):
-- BEGIN;
-- ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_listing_id_fkey;
-- ALTER TABLE appointments ADD CONSTRAINT appointments_listing_id_fkey
--   FOREIGN KEY (listing_id) REFERENCES listings(id);
-- COMMIT;
