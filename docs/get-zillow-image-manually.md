# How to Get Real Zillow Images

## For Monitor St Property (ESC-2025-2305)

1. Go to: https://www.zillow.com/homedetails/5609-Monitor-St-Bakersfield-CA-93307/19015640_zpid/

2. Right-click on the main property photo

3. Select "Open image in new tab"

4. Copy the URL from the new tab (should start with https://photos.zillowstatic.com/)

5. Update the database:
```sql
UPDATE escrows 
SET property_image_url = 'PASTE_THE_ZILLOW_IMAGE_URL_HERE'
WHERE id = '70656a01-2182-4371-8a7c-c00a19f2cfda';
```

## Alternative Method Using opengraph.xyz

1. Go to https://www.opengraph.xyz/

2. Paste the Zillow URL: https://www.zillow.com/homedetails/5609-Monitor-St-Bakersfield-CA-93307/19015640_zpid/

3. Look for "og:image" in the results

4. Copy the image URL (will be photos.zillowstatic.com)

5. Update the database with the correct URL

## Current Status

- Downey (ESC-2025-2167): ✅ Has real Zillow image
- Monitor St (ESC-2025-2305): 🖼️ Using placeholder
- Pico Rivera (ESC-2025-8841): 🖼️ Using placeholder  
- Darling Point (ESC-2025-8173): 🖼️ Using placeholder
- Victorville (ESC-2025-4069): 🖼️ Using placeholder

The placeholder images are high-quality real estate photos from Unsplash that will display properly.