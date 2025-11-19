-- Migration: Add display_address column to listings table
-- Date: 2025-11-19
-- Purpose: Provide same custom address display capability as escrows
--          Standardized field name across all entities

-- Add the display address column (nullable, defaults to canonical address if not set)
ALTER TABLE listings
ADD COLUMN display_address text;

-- Copy existing property_address values to display column for existing records
UPDATE listings
SET display_address = property_address
WHERE display_address IS NULL;

-- Add comments
COMMENT ON COLUMN listings.display_address IS 'Display address shown to user (e.g., "171 & 175 Main St" for multifamily). Falls back to property_address if null. Standardized field name across all entities.';
COMMENT ON COLUMN listings.property_address IS 'Canonical verified address from Google Places for geocoding/mapping (e.g., "175 Main Street"). Used for Street View and location data.';
