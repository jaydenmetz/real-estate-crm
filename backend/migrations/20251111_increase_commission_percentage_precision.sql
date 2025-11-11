-- Migration: Increase commission_percentage precision for unlimited decimal places
-- Date: 2025-11-11
-- Purpose: Allow commission percentages like 2.875% or 2.12345678901%
--          Auto-trim trailing zeros (2.50000 → 2.5, 2.87500 → 2.875)

-- Change from numeric(5,2) to numeric(12,10)
-- This allows values from 0.0000000001% to 99.9999999999%
-- (12 total digits: 2 before decimal, 10 after decimal)
-- The database will automatically trim trailing zeros on storage
ALTER TABLE escrows
ALTER COLUMN commission_percentage TYPE numeric(12,10);

-- Add comment
COMMENT ON COLUMN escrows.commission_percentage IS 'Commission as percentage (up to 10 decimal places, auto-trims trailing zeros). Examples: 2.5, 2.875, 2.12345678901';
