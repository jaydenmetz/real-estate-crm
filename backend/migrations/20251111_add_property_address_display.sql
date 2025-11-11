-- Migration: Add property_address_display column for custom display addresses
-- Date: 2025-11-11
-- Purpose: Support multifamily properties with custom display addresses (e.g., "171 & 175 Main St")
--          while maintaining verified canonical address for geocoding/mapping

-- Add the display address column (nullable, defaults to canonical address if not set)
ALTER TABLE escrows
ADD COLUMN property_address_display text;

-- Copy existing property_address values to display column for existing records
UPDATE escrows
SET property_address_display = property_address
WHERE property_address_display IS NULL;

-- Add comment
COMMENT ON COLUMN escrows.property_address_display IS 'Display address shown to user (e.g., "171 & 175 Main St" for multifamily). Falls back to property_address if null.';
COMMENT ON COLUMN escrows.property_address IS 'Canonical verified address from Google Places for geocoding/mapping (e.g., "175 Main Street"). Used for Street View and location data.';
