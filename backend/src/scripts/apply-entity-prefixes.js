const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('railway.app') ? {
    rejectUnauthorized: false
  } : false
});

async function applyPrefixes() {
  try {
    console.log('🚀 Applying entity prefixes to production database...\n');
    
    // Update escrows
    console.log('Updating escrows...');
    const escrowResult = await pool.query(`
      UPDATE escrows 
      SET id = CONCAT('escrow-', id)::uuid
      WHERE id::text NOT LIKE 'escrow-%' AND id::text NOT LIKE 'esc%'
    `);
    console.log(`✅ Updated ${escrowResult.rowCount} escrow records`);
    
    // Show the results
    const checkResult = await pool.query(`
      SELECT id, display_id, property_address
      FROM escrows
      ORDER BY numeric_id
    `);
    
    console.log('\nUpdated escrows:');
    checkResult.rows.forEach(row => {
      console.log(`  ${row.display_id}: ${row.id}`);
    });
    
    console.log('\n✅ Entity prefix migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('invalid input syntax for type uuid')) {
      console.error('\n⚠️  Cannot concatenate prefix with UUID type directly.');
      console.error('   The ID column needs to be TEXT type to add prefixes.');
      console.error('   Alternatively, we can update the backend to handle this.');
    }
  } finally {
    await pool.end();
  }
}

applyPrefixes();