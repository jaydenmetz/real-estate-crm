const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: { rejectUnauthorized: false },
});

/**
 * Manual process to get Zillow Open Graph images
 *
 * Since Zillow blocks automated requests, here are manual methods:
 */

console.log('=== How to Get Zillow Open Graph Images ===\n');

console.log('Method 1: Using Browser Developer Tools');
console.log('1. Open the Zillow URL in Chrome/Firefox');
console.log('2. Right-click → Inspect → Network tab');
console.log('3. Refresh the page');
console.log('4. Search for "og:image" in the Response of the main HTML document');
console.log('5. Copy the image URL from content="..."\n');

console.log('Method 2: Using a Link Preview Tool');
console.log('1. Go to https://www.opengraph.xyz/');
console.log('2. Paste the Zillow URL');
console.log('3. It will show you the Open Graph image\n');

console.log('Method 3: Using Social Media');
console.log('1. Paste the Zillow URL in a Facebook/Twitter post draft');
console.log('2. Right-click the preview image → Copy image address');
console.log('3. Delete the draft without posting\n');

console.log('Method 4: Using cURL with proper headers');
console.log('Run this command for each URL:');
console.log('curl -H "User-Agent: facebookexternalhit/1.1" -H "Accept: text/html" [ZILLOW_URL] | grep -i "og:image"\n');

// Function to update a specific property with manual image URL
async function updatePropertyImage(address, imageUrl) {
  try {
    const result = await pool.query(
      `UPDATE escrows 
       SET property_image_url = $1,
           updated_at = NOW()
       WHERE property_address = $2
       RETURNING id, display_id`,
      [imageUrl, address],
    );

    if (result.rows.length > 0) {
      console.log(`✓ Updated ${result.rows[0].display_id}: ${address}`);
      console.log(`  New image: ${imageUrl}\n`);
    } else {
      console.log(`✗ No property found with address: ${address}\n`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Based on the Zillow URLs you provided, here are the typical OG image patterns:
const zillowImagePatterns = {
  '9602 Cecilia St, Downey, CA 90241': {
    zpid: '21067548',
    typical_pattern: 'https://photos.zillowstatic.com/fp/{hash}-cc_ft_960.webp',
    working_url: 'https://photos.zillowstatic.com/fp/a57d78b482fea26c0ff9bfc6422b87a9-cc_ft_1536.webp',
  },
  '5609 Monitor St, Bakersfield, CA 93307': {
    zpid: '19015640',
    typical_pattern: 'https://photos.zillowstatic.com/fp/{hash}-cc_ft_960.webp',
  },
  '9753 Sunglow St, Pico Rivera, CA 90660': {
    zpid: '21102569',
    typical_pattern: 'https://photos.zillowstatic.com/fp/{hash}-cc_ft_960.webp',
  },
  '313 Darling Point Dr, Bakersfield, CA 93307': {
    zpid: '300316000',
    typical_pattern: 'https://photos.zillowstatic.com/fp/{hash}-cc_ft_960.webp',
  },
};

console.log('\n=== Your Zillow Properties ===\n');

async function showProperties() {
  const result = await pool.query(
    `SELECT property_address, zillow_url, property_image_url 
     FROM escrows 
     WHERE zillow_url IS NOT NULL 
     ORDER BY property_address`,
  );

  for (const row of result.rows) {
    console.log(`Property: ${row.property_address}`);
    console.log(`Zillow URL: ${row.zillow_url}`);
    console.log(`Current Image: ${row.property_image_url}\n`);

    const pattern = zillowImagePatterns[row.property_address];
    if (pattern) {
      console.log(`ZPID: ${pattern.zpid}`);
      console.log(`Expected pattern: ${pattern.typical_pattern}`);
      if (pattern.working_url) {
        console.log(`Known working URL: ${pattern.working_url}`);
      }
    }
    console.log('---\n');
  }

  console.log('\nTo update an image manually:');
  console.log('node src/scripts/get-zillow-images-manual.js "ADDRESS" "IMAGE_URL"\n');
}

// Check command line arguments
if (process.argv.length === 4) {
  const address = process.argv[2];
  const imageUrl = process.argv[3];
  updatePropertyImage(address, imageUrl).then(() => pool.end());
} else {
  showProperties().then(() => pool.end());
}
