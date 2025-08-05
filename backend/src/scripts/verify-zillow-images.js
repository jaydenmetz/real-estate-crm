const { Pool } = require('pg');
const https = require('https');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: { rejectUnauthorized: false }
});

// Test if a Zillow image URL is valid
async function testImageUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function verifyAllZillowImages() {
  console.log('Verifying all Zillow image URLs...\n');
  
  const result = await pool.query(`
    SELECT id, display_id, property_address, property_image_url, zillow_url
    FROM escrows
    WHERE property_image_url IS NOT NULL
    ORDER BY display_id
  `);
  
  for (const escrow of result.rows) {
    if (!escrow.property_image_url || !escrow.property_image_url.includes('zillowstatic.com')) {
      console.log(`⚠️  ${escrow.display_id}: Using placeholder image`);
      continue;
    }
    
    const isValid = await testImageUrl(escrow.property_image_url);
    
    if (!isValid) {
      console.log(`❌ ${escrow.display_id}: Zillow image not accessible (404)`);
      console.log(`   URL: ${escrow.property_image_url}`);
      console.log(`   Zillow listing: ${escrow.zillow_url || 'Not set'}`);
      
      // Update with placeholder for now
      await pool.query(
        `UPDATE escrows SET property_image_url = $1 WHERE id = $2`,
        ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', escrow.id]
      );
      console.log(`   ✅ Updated to placeholder image\n`);
    } else {
      console.log(`✅ ${escrow.display_id}: Zillow image is valid`);
    }
  }
  
  console.log('\nTo get valid Zillow images:');
  console.log('1. Go to the Zillow listing URL');
  console.log('2. Right-click on the main property image');
  console.log('3. Select "Copy image address"');
  console.log('4. The URL should look like: https://photos.zillowstatic.com/fp/[hash]-cc_ft_1536.jpg');
  console.log('\nOR use opengraph.xyz to extract the og:image URL');
  
  await pool.end();
}

verifyAllZillowImages().catch(console.error);