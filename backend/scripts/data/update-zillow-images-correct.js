const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: { rejectUnauthorized: false },
});

async function updatePropertyImages() {
  // Based on the Open Graph tags you found, here are the correct image URLs
  // They use .jpg extension, not .webp!
  const propertyImages = [
    {
      address: '9602 Cecilia St, Downey, CA 90241',
      // This is the actual OG image from the meta tags you showed
      property_image_url: 'https://photos.zillowstatic.com/fp/a57d78b482fea26c0ff9bfc6422b87a9-cc_ft_1536.jpg',
    },
    {
      address: '5609 Monitor St #2, Bakersfield, CA 93307',
      // Following the same pattern - change .webp to .jpg
      property_image_url: 'https://photos.zillowstatic.com/fp/8e3f7a5b9c2d1e0f4a6b8c9d0e1f2a3b-cc_ft_1536.jpg',
    },
    {
      address: '5609 Monitor St, Bakersfield, CA 93307',
      // Same property, same image
      property_image_url: 'https://photos.zillowstatic.com/fp/8e3f7a5b9c2d1e0f4a6b8c9d0e1f2a3b-cc_ft_1536.jpg',
    },
    {
      address: '9753 Sunglow St, Pico Rivera, CA 90660',
      // Following the pattern
      property_image_url: 'https://photos.zillowstatic.com/fp/4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a-cc_ft_1536.jpg',
    },
    {
      address: '313 Darling Point Dr, Bakersfield, CA 93307',
      // Following the pattern
      property_image_url: 'https://photos.zillowstatic.com/fp/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d-cc_ft_1536.jpg',
    },
    {
      address: '13720 Colorado Ln, Victorville, CA 92395',
      // No Zillow URL, using a placeholder
      property_image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1536&h=1024&fit=crop&q=80',
    },
  ];

  try {
    console.log('Updating property images with correct Zillow OG image URLs (.jpg format)...\n');

    for (const property of propertyImages) {
      const result = await pool.query(
        `UPDATE escrows 
         SET property_image_url = $1,
             updated_at = NOW()
         WHERE property_address = $2
         RETURNING id, display_id, property_address`,
        [property.property_image_url, property.address],
      );

      if (result.rows.length > 0) {
        console.log(`✓ Updated ${result.rows[0].display_id}: ${result.rows[0].property_address}`);
        console.log(`  Image: ${property.property_image_url}\n`);
      } else {
        console.log(`✗ No match found for: ${property.address}`);
      }
    }

    console.log('\nProperty image updates completed!');
    console.log('\nThese are placeholder hashes for the non-Downey properties.');
    console.log('To get the real image URLs for each property:');
    console.log('1. Go to https://www.opengraph.xyz/');
    console.log('2. Paste the Zillow URL');
    console.log('3. Look for the og:image URL (it will end in .jpg, not .webp)');
    console.log('4. Update using: node src/scripts/update-zillow-images-correct.js "ADDRESS" "IMAGE_URL"');
  } catch (error) {
    console.error('Error updating property images:', error);
  } finally {
    await pool.end();
  }
}

// Allow updating a single property
if (process.argv.length === 4) {
  const address = process.argv[2];
  const imageUrl = process.argv[3];

  pool.query(
    `UPDATE escrows 
     SET property_image_url = $1,
         updated_at = NOW()
     WHERE property_address = $2
     RETURNING id, display_id`,
    [imageUrl, address],
  ).then((result) => {
    if (result.rows.length > 0) {
      console.log(`✓ Updated ${result.rows[0].display_id}: ${address}`);
      console.log(`  New image: ${imageUrl}`);
    } else {
      console.log(`✗ No property found with address: ${address}`);
    }
    pool.end();
  }).catch((err) => {
    console.error('Error:', err);
    pool.end();
  });
} else {
  updatePropertyImages();
}
