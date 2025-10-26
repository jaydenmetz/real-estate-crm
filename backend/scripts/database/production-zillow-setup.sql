-- Zillow Feature Production Setup
-- Run this script on your production database

-- 1. Add zillow_url column to escrows table
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS zillow_url TEXT;

-- 2. Add Zillow URLs to specific properties (update these with actual Zillow URLs for your properties)

-- Example for Malibu property
UPDATE escrows 
SET zillow_url = 'https://www.zillow.com/homedetails/6510-Summer-Breeze-Ln-Bakersfield-CA-93313/19056207_zpid/'
WHERE property_address LIKE '%789 Pacific Coast Highway%' 
  AND zillow_url IS NULL;

-- Example for first escrow (if you want to test)
UPDATE escrows 
SET zillow_url = 'https://www.zillow.com/homedetails/6510-Summer-Breeze-Ln-Bakersfield-CA-93313/19056207_zpid/'
WHERE display_id = 'ESCROW-2025-0001' 
  AND zillow_url IS NULL;

-- 3. Verify the changes
SELECT 
  display_id,
  property_address,
  zillow_url,
  CASE 
    WHEN zillow_url IS NOT NULL THEN '✓ Has Zillow URL'
    ELSE '✗ No Zillow URL'
  END as status
FROM escrows
ORDER BY created_at DESC
LIMIT 10;

-- 4. Count how many escrows have Zillow URLs
SELECT 
  COUNT(*) FILTER (WHERE zillow_url IS NOT NULL) as with_zillow,
  COUNT(*) FILTER (WHERE zillow_url IS NULL) as without_zillow,
  COUNT(*) as total_escrows
FROM escrows;