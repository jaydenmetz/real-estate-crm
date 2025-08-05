-- Add zillow_image_url field to escrows table
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS zillow_image_url TEXT;

-- Update existing escrow with known Zillow image
UPDATE escrows 
SET zillow_image_url = 'https://photos.zillowstatic.com/fp/b8d7a052c4ec5d11b5d0e087d8eb70fe-cc_ft_1536.jpg'
WHERE display_id = 'ESCROW-2025-0001' AND zillow_url IS NOT NULL;

-- Example of how to update other escrows with their Zillow images
-- UPDATE escrows 
-- SET zillow_image_url = 'YOUR_ZILLOW_IMAGE_URL_HERE'
-- WHERE display_id = 'YOUR_ESCROW_ID';