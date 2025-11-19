-- Migration: Rename property_address_display to display_address in escrows table
-- Date: 2025-11-19
-- Purpose: Standardize address display field naming across all entities (escrows, listings)

-- Rename the column
ALTER TABLE escrows
RENAME COLUMN property_address_display TO display_address;

-- Update comment to reflect new standardized name
COMMENT ON COLUMN escrows.display_address IS 'Display address shown to user (e.g., "171 & 175 Main St" for multifamily). Falls back to property_address if null. Standardized field name across all entities.';
COMMENT ON COLUMN escrows.property_address IS 'Canonical verified address from Google Places for geocoding/mapping (e.g., "175 Main Street"). Used for Street View and location data.';
