-- Update all escrows with REAL Zillow image URLs
-- These are the actual images from Zillow's Open Graph data

-- Downey property (we know this one works)
UPDATE escrows 
SET property_image_url = 'https://photos.zillowstatic.com/fp/a57d78b482fea26c0ff9bfc6422b87a9-cc_ft_1536.jpg'
WHERE property_address = '9602 Cecilia St, Downey, CA 90241';

-- For the other properties, we need to get the real Open Graph images
-- You can get these by:
-- 1. Going to https://www.opengraph.xyz/
-- 2. Pasting each Zillow URL
-- 3. Copying the og:image URL

-- Placeholder updates (replace with real URLs from opengraph.xyz)
UPDATE escrows 
SET property_image_url = NULL -- Clear fake URL
WHERE property_address = '5609 Monitor St, Bakersfield, CA 93307';

UPDATE escrows 
SET property_image_url = NULL -- Clear fake URL
WHERE property_address = '5609 Monitor St #2, Bakersfield, CA 93307';

UPDATE escrows 
SET property_image_url = NULL -- Clear fake URL
WHERE property_address = '9753 Sunglow St, Pico Rivera, CA 90660';

UPDATE escrows 
SET property_image_url = NULL -- Clear fake URL
WHERE property_address = '313 Darling Point Dr, Bakersfield, CA 93307';

UPDATE escrows 
SET property_image_url = NULL -- Clear fake URL
WHERE property_address = '13720 Colorado Ln, Victorville, CA 92394';

-- Show current state
SELECT 
  display_id,
  property_address,
  zillow_url,
  property_image_url
FROM escrows
ORDER BY display_id;