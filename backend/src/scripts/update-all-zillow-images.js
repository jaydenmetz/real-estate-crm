const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: { rejectUnauthorized: false },
});

// Real Zillow image URLs obtained from opengraph.xyz
// These are the actual Open Graph images from each property
const realZillowImages = [
  {
    address: '9602 Cecilia St, Downey, CA 90241',
    image: 'https://photos.zillowstatic.com/fp/a57d78b482fea26c0ff9bfc6422b87a9-cc_ft_1536.jpg',
  },
  {
    address: '5609 Monitor St, Bakersfield, CA 93307',
    image: 'https://photos.zillowstatic.com/fp/5b0e3403b9f59d71fb3889b0ce65e740-cc_ft_1536.jpg',
  },
  {
    address: '5609 Monitor St #2, Bakersfield, CA 93307',
    image: 'https://photos.zillowstatic.com/fp/5b0e3403b9f59d71fb3889b0ce65e740-cc_ft_1536.jpg', // Same as above
  },
  {
    address: '9753 Sunglow St, Pico Rivera, CA 90660',
    image: 'https://photos.zillowstatic.com/fp/2e7497cbb7c6f89a83b6cd21658bfedd-cc_ft_1536.jpg',
  },
  {
    address: '313 Darling Point Dr, Bakersfield, CA 93307',
    image: 'https://photos.zillowstatic.com/fp/eb77c6e2aec13d27d9b0e36d00d5eb4b-cc_ft_1536.jpg',
  },
  {
    address: '13720 Colorado Ln, Victorville, CA 92394',
    image: 'https://photos.zillowstatic.com/fp/79e15ad6f7ad6378b3d67ce5fa8ce67f-cc_ft_1536.jpg',
  },
];

async function updateAllZillowImages() {
  console.log('Updating all escrows with real Zillow images...\n');

  for (const property of realZillowImages) {
    try {
      const result = await pool.query(
        `UPDATE escrows 
         SET property_image_url = $1, updated_at = NOW()
         WHERE property_address = $2
         RETURNING id, display_id, property_address`,
        [property.image, property.address],
      );

      if (result.rows.length > 0) {
        console.log(`✅ Updated ${result.rows[0].display_id}: ${property.address}`);
        console.log(`   Image: ${property.image}\n`);
      } else {
        console.log(`⚠️  No escrow found for: ${property.address}\n`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${property.address}:`, error.message);
    }
  }

  // Show final results
  console.log('\nFinal status:');
  const checkResult = await pool.query(`
    SELECT display_id, property_address, 
           CASE 
             WHEN property_image_url IS NULL THEN 'No image'
             WHEN property_image_url LIKE '%placeholder%' THEN 'Placeholder'
             WHEN property_image_url LIKE '%unsplash%' THEN 'Stock image'
             WHEN property_image_url LIKE '%zillowstatic%' THEN 'Real Zillow image ✅'
             ELSE 'Other'
           END as image_status
    FROM escrows
    ORDER BY display_id
  `);

  checkResult.rows.forEach((row) => {
    console.log(`${row.display_id}: ${row.image_status}`);
  });

  await pool.end();
}

// Note: To get real Zillow images for new properties:
// 1. Go to https://www.opengraph.xyz/
// 2. Paste the Zillow URL
// 3. Look for the og:image URL (it will be photos.zillowstatic.com)
// 4. Add it to the realZillowImages array above

updateAllZillowImages().catch(console.error);
