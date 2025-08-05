-- Add zillow_url field to escrows table
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS zillow_url TEXT;

-- Add some example Zillow URLs to existing escrows
UPDATE escrows 
SET zillow_url = 'https://www.zillow.com/homedetails/6510-Summer-Breeze-Ln-Bakersfield-CA-93313/19056207_zpid/'
WHERE id = (SELECT id FROM escrows ORDER BY created_at ASC LIMIT 1);

-- You can add more default URLs for other escrows as needed