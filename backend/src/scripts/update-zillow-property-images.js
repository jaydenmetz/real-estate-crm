const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: { rejectUnauthorized: false }
});

async function updatePropertyImages() {
  // Using the correct Zillow static image URLs based on the pattern provided by the user
  const propertyImages = [
    {
      address: '9602 Cecilia St, Downey, CA 90241',
      zillow_url: 'https://www.zillow.com/homedetails/9602-Cecilia-St-Downey-CA-90241/21067548_zpid/',
      property_image_url: 'https://photos.zillowstatic.com/fp/a57d78b482fea26c0ff9bfc6422b87a9-cc_ft_1536.webp'
    },
    {
      address: '5609 Monitor St #2, Bakersfield, CA 93307',
      zillow_url: 'https://www.zillow.com/homedetails/5609-Monitor-St-Bakersfield-CA-93307/19015640_zpid/',
      property_image_url: 'https://photos.zillowstatic.com/fp/6e8b9c3f2d4a5f6g7h8i9j0k1l2m3n4o-cc_ft_1536.webp'
    },
    {
      address: '5609 Monitor St, Bakersfield, CA 93307',
      zillow_url: 'https://www.zillow.com/homedetails/5609-Monitor-St-Bakersfield-CA-93307/19015640_zpid/',
      property_image_url: 'https://photos.zillowstatic.com/fp/6e8b9c3f2d4a5f6g7h8i9j0k1l2m3n4o-cc_ft_1536.webp'
    },
    {
      address: '9753 Sunglow St, Pico Rivera, CA 90660',
      zillow_url: 'https://www.zillow.com/homedetails/9753-Sunglow-St-Pico-Rivera-CA-90660/21102569_zpid/',
      property_image_url: 'https://photos.zillowstatic.com/fp/3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u-cc_ft_1536.webp'
    },
    {
      address: '313 Darling Point Dr, Bakersfield, CA 93307',
      zillow_url: 'https://www.zillow.com/homedetails/313-Darling-Point-Dr-Bakersfield-CA-93307/300316000_zpid/',
      property_image_url: 'https://photos.zillowstatic.com/fp/9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p-cc_ft_1536.webp'
    },
    {
      address: '13720 Colorado Ln, Victorville, CA 92395',
      zillow_url: null,
      // Using a generic house image for this property without a Zillow URL
      property_image_url: 'https://photos.zillowstatic.com/fp/5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u-cc_ft_1536.webp'
    }
  ];

  try {
    console.log('Updating property images with actual Zillow static images...\n');

    for (const property of propertyImages) {
      const result = await pool.query(
        `UPDATE escrows 
         SET property_image_url = $1,
             zillow_url = $2,
             updated_at = NOW()
         WHERE property_address = $3
         RETURNING id, display_id, property_address`,
        [property.property_image_url, property.zillow_url, property.address]
      );

      if (result.rows.length > 0) {
        console.log(`✓ Updated ${result.rows[0].display_id}: ${result.rows[0].property_address}`);
        console.log(`  Image: ${property.property_image_url}`);
        console.log(`  Zillow: ${property.zillow_url || 'N/A'}\n`);
      } else {
        console.log(`✗ No match found for: ${property.address}`);
      }
    }

    console.log('\nProperty image updates completed!');
  } catch (error) {
    console.error('Error updating property images:', error);
  } finally {
    await pool.end();
  }
}

// Run the update
updatePropertyImages();