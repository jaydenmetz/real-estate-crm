-- Migration: Add Zillow-style listing fields
-- Created: October 13, 2025
-- Purpose: Add missing fields for comprehensive property listing pages
--          (HOA fees, separate city/state/zip, structured features)

-- Add HOA fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS hoa_fees NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS hoa_frequency VARCHAR(20) DEFAULT 'none' CHECK (hoa_frequency IN ('none', 'monthly', 'quarterly', 'annually'));

-- Add separate address fields for better filtering/display
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(2),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

-- Add property history notes field (complements listing_price_history table)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS property_history_notes TEXT;

-- Add school district field (future enhancement)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS school_district VARCHAR(200);

-- Add parking details (extract from features or store separately)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS parking_spaces INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parking_type VARCHAR(100); -- 'Attached Garage', 'Detached', 'Carport', 'Street', etc.

-- Add heating/cooling details (extract from features or store separately)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS heating_type VARCHAR(100), -- 'Forced Air', 'Radiant', 'Heat Pump', etc.
ADD COLUMN IF NOT EXISTS cooling_type VARCHAR(100); -- 'Central A/C', 'Window Units', 'None', etc.

-- Add appliances included (JSONB array for flexibility)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS appliances_included JSONB DEFAULT '[]'::jsonb;

-- Create indexes for new searchable fields
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(state);
CREATE INDEX IF NOT EXISTS idx_listings_zip_code ON listings(zip_code);
CREATE INDEX IF NOT EXISTS idx_listings_hoa_fees ON listings(hoa_fees) WHERE hoa_fees IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_school_district ON listings(school_district) WHERE school_district IS NOT NULL;

-- Optional: Parse existing property_address into city/state/zip
-- This is a best-effort parse - may need manual cleanup for edge cases
-- Example address format: "123 Main St, San Diego, CA 92101"

UPDATE listings
SET
  city = NULLIF(TRIM(split_part(split_part(property_address, ',', 2), ',', 1)), ''),
  state = NULLIF(TRIM(split_part(split_part(property_address, ',', 3), ' ', 1)), ''),
  zip_code = NULLIF(TRIM(split_part(split_part(property_address, ',', 3), ' ', 2)), '')
WHERE city IS NULL AND property_address LIKE '%,%,%'; -- Only parse if address has at least 2 commas

-- Add comment to table documenting new fields
COMMENT ON COLUMN listings.hoa_fees IS 'Homeowners Association monthly fees (in dollars). NULL means no HOA.';
COMMENT ON COLUMN listings.hoa_frequency IS 'HOA payment frequency: none, monthly, quarterly, or annually';
COMMENT ON COLUMN listings.city IS 'City name (parsed from property_address or manually entered)';
COMMENT ON COLUMN listings.state IS 'State abbreviation (2 letters, e.g., CA, TX, NY)';
COMMENT ON COLUMN listings.zip_code IS 'ZIP code (5 or 9 digits)';
COMMENT ON COLUMN listings.parking_spaces IS 'Number of parking spaces (garage + driveway)';
COMMENT ON COLUMN listings.parking_type IS 'Type of parking (e.g., Attached Garage, Carport, Street)';
COMMENT ON COLUMN listings.heating_type IS 'Heating system type (e.g., Forced Air, Radiant, Heat Pump)';
COMMENT ON COLUMN listings.cooling_type IS 'Cooling system type (e.g., Central A/C, Window Units, None)';
COMMENT ON COLUMN listings.appliances_included IS 'Array of appliances included in sale (e.g., ["Refrigerator", "Dishwasher", "Microwave"])';
COMMENT ON COLUMN listings.school_district IS 'School district name for property (future enhancement)';

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 022 completed successfully!';
  RAISE NOTICE 'New fields added: hoa_fees, hoa_frequency, city, state, zip_code, parking_spaces, parking_type, heating_type, cooling_type, appliances_included, school_district';
  RAISE NOTICE 'Indexes created for city, state, zip_code, hoa_fees, school_district';
  RAISE NOTICE 'Attempted to parse existing property_address into city/state/zip (may need manual cleanup)';
END $$;
