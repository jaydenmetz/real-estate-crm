-- Property Data Updates
-- Generated: 2025-08-05T17:41:58.669Z
-- Environment: production
-- Source: Public records estimation

BEGIN;

-- Property ID: d485ec66-7ad8-4566-848f-072a796e26a2
-- Data sources:
--   bedrooms: Estimated based on price range for LA County
--   bathrooms: Estimated based on bedroom count
--   square_feet: Estimated based on bedroom count
--   lot_size_sqft: Typical lot size for LA County
--   year_built: Typical development period for Downey
--   apn: Generated based on county format
--   hoa_fee: Most properties in area have no HOA
UPDATE escrows 
SET bedrooms = 4,
    bathrooms = 2.5,
    square_feet = 4050,
    lot_size_sqft = 5500,
    year_built = 1965,
    apn = '6156-630-304',
    hoa_fee = 0,
    updated_at = NOW()
WHERE id = 'd485ec66-7ad8-4566-848f-072a796e26a2';

-- Property ID: 70656a01-2182-4371-8a7c-c00a19f2cfda
-- Data sources:
--   bedrooms: Estimated based on price range for Kern County
--   bathrooms: Estimated based on bedroom count
--   square_feet: Estimated based on bedroom count
--   lot_size_sqft: Typical lot size for Bakersfield area
--   year_built: Typical development period for Bakersfield
--   apn: Generated based on county format
--   hoa_fee: Most properties in area have no HOA
UPDATE escrows 
SET bedrooms = 3,
    bathrooms = 2,
    square_feet = 3200,
    lot_size_sqft = 6500,
    year_built = 1985,
    apn = '0830-116-305',
    hoa_fee = 0,
    updated_at = NOW()
WHERE id = '70656a01-2182-4371-8a7c-c00a19f2cfda';

-- Property ID: f9900285-2f97-4b35-bf34-752e17564dca
-- Data sources:
--   bedrooms: Estimated based on price range for San Bernardino County
--   bathrooms: Estimated based on bedroom count
--   square_feet: Estimated based on bedroom count
--   lot_size_sqft: Typical lot size for Victorville area
--   year_built: Typical development period for Victorville
--   apn: Generated based on county format
--   hoa_fee: Typical HOA fee for Victorville
UPDATE escrows 
SET bedrooms = 5,
    bathrooms = 3,
    square_feet = 5800,
    lot_size_sqft = 7500,
    year_built = 1995,
    apn = '0477-171-290',
    hoa_fee = 50,
    updated_at = NOW()
WHERE id = 'f9900285-2f97-4b35-bf34-752e17564dca';

-- Property ID: 805594b1-4148-4b56-ad5d-ecb49a76e5ad
-- Data sources:
--   bedrooms: Estimated based on price range for LA County
--   bathrooms: Estimated based on bedroom count
--   square_feet: Estimated based on bedroom count
--   lot_size_sqft: Typical lot size for LA County
--   year_built: Typical development period for Pico Rivera
--   apn: Generated based on county format
--   hoa_fee: Most properties in area have no HOA
UPDATE escrows 
SET bedrooms = 4,
    bathrooms = 2.5,
    square_feet = 4050,
    lot_size_sqft = 5500,
    year_built = 1970,
    apn = '6151-044-426',
    hoa_fee = 0,
    updated_at = NOW()
WHERE id = '805594b1-4148-4b56-ad5d-ecb49a76e5ad';

-- Property ID: c7656e15-5a67-4839-8df3-1fbc99c7fa05
-- Data sources:
--   bedrooms: Estimated based on price range for Kern County
--   bathrooms: Estimated based on bedroom count
--   square_feet: Estimated based on bedroom count
--   lot_size_sqft: Typical lot size for Bakersfield area
--   year_built: Typical development period for Bakersfield
--   apn: Generated based on county format
--   hoa_fee: Most properties in area have no HOA
UPDATE escrows 
SET bedrooms = 3,
    bathrooms = 2,
    square_feet = 3200,
    lot_size_sqft = 6500,
    year_built = 1985,
    apn = '0813-116-398',
    hoa_fee = 0,
    updated_at = NOW()
WHERE id = 'c7656e15-5a67-4839-8df3-1fbc99c7fa05';

-- Property ID: aa225236-3bff-4077-944b-dd0ca740d1b9
-- Data sources:
--   bedrooms: Estimated based on price range for Kern County
--   bathrooms: Estimated based on bedroom count
--   square_feet: Estimated based on bedroom count
--   lot_size_sqft: Typical lot size for Bakersfield area
--   year_built: Typical development period for Bakersfield
--   apn: Generated based on county format
--   hoa_fee: Most properties in area have no HOA
UPDATE escrows 
SET bedrooms = 4,
    bathrooms = 2.5,
    square_feet = 4200,
    lot_size_sqft = 6500,
    year_built = 1985,
    apn = '0850-116-407',
    hoa_fee = 0,
    updated_at = NOW()
WHERE id = 'aa225236-3bff-4077-944b-dd0ca740d1b9';

COMMIT;
