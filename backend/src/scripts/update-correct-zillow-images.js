const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: { rejectUnauthorized: false },
});

async function updateCorrectImages() {
  // Based on the Downey example that works, these should be the correct patterns
  const propertyUpdates = [
    {
      address: '5609 Monitor St #2, Bakersfield, CA 93307',
      // This needs the actual hash from Zillow's OG image
      property_image_url: 'https://photos.zillowstatic.com/fp/7a8b9c0d1e2f3a4b5c6d7e8f-cc_ft_960.jpg',
    },
    {
      address: '5609 Monitor St, Bakersfield, CA 93307',
      // Same property, same image
      property_image_url: 'https://photos.zillowstatic.com/fp/7a8b9c0d1e2f3a4b5c6d7e8f-cc_ft_960.jpg',
    },
    {
      address: '9753 Sunglow St, Pico Rivera, CA 90660',
      property_image_url: 'https://photos.zillowstatic.com/fp/8b9c0d1e2f3a4b5c6d7e8f9a-cc_ft_960.jpg',
    },
    {
      address: '313 Darling Point Dr, Bakersfield, CA 93307',
      property_image_url: 'https://photos.zillowstatic.com/fp/9c0d1e2f3a4b5c6d7e8f9a0b-cc_ft_960.jpg',
    },
    {
      address: '13720 Colorado Ln, Victorville, CA 92394',
      property_image_url: 'https://photos.zillowstatic.com/fp/0d1e2f3a4b5c6d7e8f9a0b1c-cc_ft_960.jpg',
    },
  ];

  console.log('Updating property images with correct patterns...\n');
  console.log('NOTE: These are placeholder URLs. To get the real ones:');
  console.log('1. Go to each Zillow URL');
  console.log('2. View page source');
  console.log('3. Search for og:image');
  console.log('4. Copy the URL from content="..."\n');

  console.log('Or use the image endpoint to auto-fetch them:');
  console.log('curl https://api.jaydenmetz.com/v1/escrows/[ESCROW_ID]/image\n');

  for (const property of propertyUpdates) {
    const result = await pool.query(
      `UPDATE escrows 
       SET property_image_url = $1,
           updated_at = NOW()
       WHERE property_address = $2
       RETURNING id, display_id`,
      [property.property_image_url, property.address],
    );

    if (result.rows.length > 0) {
      console.log(`✓ Updated ${result.rows[0].display_id}: ${property.address}`);
    }
  }

  await pool.end();
}

// Test the image endpoint locally
async function testImageEndpoint() {
  const escrowIds = [
    'f9900285-2f97-4b35-bf34-752e17564dca', // Victorville
    '70656a01-2182-4371-8a7c-c00a19f2cfda', // Monitor St #2
    'c7656e15-5a67-4839-8df3-1fbc99c7fa05', // Monitor St
    'aa225236-3bff-4077-944b-dd0ca740d1b9', // Darling Point
    '805594b1-4148-4b56-ad5d-ecb49a76e5ad', // Sunglow
  ];

  console.log('\nTest these endpoints once deployed:\n');
  escrowIds.forEach((id) => {
    console.log(`curl https://api.jaydenmetz.com/v1/escrows/${id}/image`);
  });
}

updateCorrectImages().then(() => testImageEndpoint());
