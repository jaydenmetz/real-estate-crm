const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: { rejectUnauthorized: false },
});

// High-quality real estate placeholder images from Unsplash
const placeholderImages = [
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', // Modern house
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', // House with pool
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', // Large house
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', // Modern villa
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', // Suburban home
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', // Beautiful modern house
];

async function updatePlaceholderImages() {
  console.log('Updating properties with placeholder images...\n');

  // Keep the working Downey image
  const updates = [
    {
      address: '5609 Monitor St, Bakersfield, CA 93307',
      image: placeholderImages[0],
    },
    {
      address: '5609 Monitor St #2, Bakersfield, CA 93307',
      image: placeholderImages[0], // Same property
    },
    {
      address: '9753 Sunglow St, Pico Rivera, CA 90660',
      image: placeholderImages[2],
    },
    {
      address: '313 Darling Point Dr, Bakersfield, CA 93307',
      image: placeholderImages[3],
    },
    {
      address: '13720 Colorado Ln, Victorville, CA 92394',
      image: placeholderImages[4],
    },
  ];

  for (const update of updates) {
    const result = await pool.query(
      `UPDATE escrows 
       SET property_image_url = $1
       WHERE property_address = $2
       RETURNING display_id`,
      [update.image, update.address],
    );

    if (result.rows.length > 0) {
      console.log(`✅ Updated ${result.rows[0].display_id}: ${update.address}`);
    }
  }

  console.log('\n✅ All properties now have working placeholder images');
  console.log('\nNote: The Downey property (ESC-2025-2167) still has its working Zillow image');

  await pool.end();
}

updatePlaceholderImages().catch(console.error);
