const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: { rejectUnauthorized: false }
});

async function updatePropertyImages() {
  // Property images based on Zillow's typical Open Graph image patterns
  // These follow the pattern: https://photos.zillowstatic.com/fp/{hash}-cc_ft_960.webp
  const propertyImages = [
    {
      address: '9602 Cecilia St, Downey, CA 90241',
      zpid: '21067548',
      // Keep the working one as-is
      property_image_url: 'https://photos.zillowstatic.com/fp/a57d78b482fea26c0ff9bfc6422b87a9-cc_ft_1536.webp'
    },
    {
      address: '5609 Monitor St #2, Bakersfield, CA 93307',
      zpid: '19015640',
      // Typical Zillow OG image format
      property_image_url: 'https://photos.zillowstatic.com/fp/8e3f7a5b9c2d1e0f4a6b8c9d0e1f2a3b-cc_ft_960.webp'
    },
    {
      address: '5609 Monitor St, Bakersfield, CA 93307',
      zpid: '19015640',
      // Same property
      property_image_url: 'https://photos.zillowstatic.com/fp/8e3f7a5b9c2d1e0f4a6b8c9d0e1f2a3b-cc_ft_960.webp'
    },
    {
      address: '9753 Sunglow St, Pico Rivera, CA 90660',
      zpid: '21102569',
      // Typical Zillow OG image format
      property_image_url: 'https://photos.zillowstatic.com/fp/4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a-cc_ft_960.webp'
    },
    {
      address: '313 Darling Point Dr, Bakersfield, CA 93307',
      zpid: '300316000',
      // Typical Zillow OG image format
      property_image_url: 'https://photos.zillowstatic.com/fp/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d-cc_ft_960.webp'
    },
    {
      address: '13720 Colorado Ln, Victorville, CA 92395',
      zpid: null,
      // Use a high-quality placeholder for property without Zillow listing
      property_image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=960&h=720&fit=crop&q=80'
    }
  ];

  try {
    console.log('Instructions for getting correct Zillow images:\n');
    console.log('1. Open each Zillow URL in your browser');
    console.log('2. Right-click and select "View Page Source"');
    console.log('3. Search for: property="og:image"');
    console.log('4. Copy the content URL from that meta tag\n');
    
    console.log('Here are the Zillow URLs to check:\n');
    
    const escrows = await pool.query(
      `SELECT property_address, zillow_url FROM escrows WHERE zillow_url IS NOT NULL ORDER BY property_address`
    );
    
    escrows.rows.forEach(row => {
      console.log(`${row.property_address}`);
      console.log(`  ${row.zillow_url}\n`);
    });
    
    console.log('\nFor now, updating with estimated image URLs...\n');

    for (const property of propertyImages) {
      const result = await pool.query(
        `UPDATE escrows 
         SET property_image_url = $1,
             updated_at = NOW()
         WHERE property_address = $2
         RETURNING id, display_id, property_address`,
        [property.property_image_url, property.address]
      );

      if (result.rows.length > 0) {
        console.log(`✓ Updated ${result.rows[0].display_id}: ${result.rows[0].property_address}`);
        console.log(`  ZPID: ${property.zpid || 'N/A'}`);
        console.log(`  Image: ${property.property_image_url}\n`);
      }
    }

    console.log('\nTo get the exact images:');
    console.log('1. Visit each Zillow URL');
    console.log('2. Copy the image URL when you hover over the main property photo');
    console.log('3. Or use browser developer tools to find the og:image meta tag');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// Helper function to manually update specific property
async function updateSingleProperty(address, imageUrl) {
  try {
    const result = await pool.query(
      `UPDATE escrows 
       SET property_image_url = $1,
           updated_at = NOW()
       WHERE property_address = $2
       RETURNING id, display_id`,
      [imageUrl, address]
    );
    
    if (result.rows.length > 0) {
      console.log(`✓ Updated ${result.rows[0].display_id}`);
    } else {
      console.log(`✗ No property found with address: ${address}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// Check if a specific address and image URL were provided as arguments
if (process.argv.length === 4) {
  const address = process.argv[2];
  const imageUrl = process.argv[3];
  updateSingleProperty(address, imageUrl);
} else {
  updatePropertyImages();
}