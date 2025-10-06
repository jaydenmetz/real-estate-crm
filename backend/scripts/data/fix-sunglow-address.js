const { Pool } = require('pg');

async function fixSunglowAddress() {
  // Update production database
  const prodPool = new Pool({
    connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('=== Updating Production Database ===');
    const prodResult = await prodPool.query(
      'UPDATE escrows SET property_address = $1 WHERE display_id = $2 RETURNING display_id, property_address',
      ['9753 Sunglow St, Pico Rivera, CA 90660', 'ESC-2025-8841'],
    );

    if (prodResult.rowCount > 0) {
      console.log(`✅ Updated ${prodResult.rows[0].display_id}: ${prodResult.rows[0].property_address}`);
    }
  } catch (error) {
    console.error('❌ Error updating production:', error.message);
  } finally {
    await prodPool.end();
  }

  // Update local database
  const localPool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/real_estate_crm',
    ssl: false,
  });

  try {
    console.log('\n=== Updating Local Database ===');
    const localResult = await localPool.query(
      'UPDATE escrows SET property_address = $1 WHERE display_id = $2 RETURNING display_id, property_address',
      ['9753 Sunglow St, Pico Rivera, CA 90660', 'ESCROW-2025-0017'],
    );

    if (localResult.rowCount > 0) {
      console.log(`✅ Updated ${localResult.rows[0].display_id}: ${localResult.rows[0].property_address}`);
    }
  } catch (error) {
    console.error('❌ Error updating local:', error.message);
  } finally {
    await localPool.end();
  }
}

fixSunglowAddress().catch(console.error);
