-- Migration: Add property details fields for comprehensive property information
BEGIN;

-- Add property characteristics
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS bathrooms NUMERIC(3,1),
ADD COLUMN IF NOT EXISTS square_feet INTEGER,
ADD COLUMN IF NOT EXISTS lot_size_sqft INTEGER,
ADD COLUMN IF NOT EXISTS year_built INTEGER,
ADD COLUMN IF NOT EXISTS garage_spaces INTEGER,
ADD COLUMN IF NOT EXISTS stories INTEGER,
ADD COLUMN IF NOT EXISTS pool BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS spa BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS architectural_style VARCHAR(100),
ADD COLUMN IF NOT EXISTS property_condition VARCHAR(50),
ADD COLUMN IF NOT EXISTS zoning VARCHAR(50),

-- Property identifiers
ADD COLUMN IF NOT EXISTS apn VARCHAR(50),
ADD COLUMN IF NOT EXISTS mls_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS county VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(2) DEFAULT 'CA',
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS subdivision VARCHAR(100),
ADD COLUMN IF NOT EXISTS cross_streets VARCHAR(255),
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7),

-- HOA and community
ADD COLUMN IF NOT EXISTS hoa_fee NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS hoa_frequency VARCHAR(20),
ADD COLUMN IF NOT EXISTS hoa_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS gated_community BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS senior_community BOOLEAN DEFAULT false,

-- Property features JSONB for flexibility
ADD COLUMN IF NOT EXISTS property_features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS property_images JSONB DEFAULT '[]',

-- Listing information
ADD COLUMN IF NOT EXISTS list_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS list_date DATE,
ADD COLUMN IF NOT EXISTS days_on_market INTEGER,
ADD COLUMN IF NOT EXISTS previous_list_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS original_list_price NUMERIC(12,2);

-- Add comments
COMMENT ON COLUMN escrows.bedrooms IS 'Number of bedrooms';
COMMENT ON COLUMN escrows.bathrooms IS 'Number of bathrooms (can be decimal for half baths)';
COMMENT ON COLUMN escrows.square_feet IS 'Living area square footage';
COMMENT ON COLUMN escrows.lot_size_sqft IS 'Lot size in square feet';
COMMENT ON COLUMN escrows.year_built IS 'Year property was built';
COMMENT ON COLUMN escrows.view_type IS 'Type of view (ocean, mountain, city, etc)';
COMMENT ON COLUMN escrows.property_features IS 'JSONB object with additional features like {flooring: "hardwood", kitchen: "granite counters", amenities: [...]}';
COMMENT ON COLUMN escrows.property_images IS 'Array of image URLs';
COMMENT ON COLUMN escrows.hoa_frequency IS 'monthly, quarterly, annually';

COMMIT;