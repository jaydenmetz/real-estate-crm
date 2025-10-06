const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/real_estate_crm'
});

async function checkData() {
  try {
    // Check escrows
    const escrowsResult = await pool.query('SELECT COUNT(*) as count FROM escrows WHERE deleted_at IS NULL');
    console.log('Escrows in database:', escrowsResult.rows[0].count);
    
    // Get sample escrow data
    const sampleEscrows = await pool.query('SELECT id, escrow_number, property_address, escrow_status FROM escrows WHERE deleted_at IS NULL LIMIT 5');
    console.log('\nSample escrows:');
    sampleEscrows.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Number: ${row.escrow_number}, Address: ${row.property_address}, Status: ${row.escrow_status}`);
    });
    
    // Check listings
    const listingsResult = await pool.query('SELECT COUNT(*) as count FROM listings WHERE deleted_at IS NULL');
    console.log('\nListings in database:', listingsResult.rows[0].count);
    
    // Get sample listing data
    const sampleListings = await pool.query('SELECT id, mls_number, property_address, status FROM listings WHERE deleted_at IS NULL LIMIT 5');
    console.log('\nSample listings:');
    sampleListings.rows.forEach(row => {
      console.log(`- ID: ${row.id}, MLS: ${row.mls_number}, Address: ${row.property_address}, Status: ${row.status}`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();