const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('railway.app') ? {
    rejectUnauthorized: false
  } : false
});

async function checkPrefixes() {
  try {
    console.log('Checking escrows for prefixes...\n');
    
    const result = await pool.query(`
      SELECT id, display_id, property_address,
             CASE 
               WHEN id::text LIKE 'escrow-%' THEN 'Has prefix'
               WHEN id::text LIKE 'esc%' THEN 'Has short prefix'
               ELSE 'No prefix'
             END as prefix_status
      FROM escrows
      ORDER BY id
    `);
    
    console.log('Current escrows:');
    result.rows.forEach(row => {
      console.log(`\n${row.display_id} - ${row.property_address}`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Status: ${row.prefix_status}`);
    });
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN id::text LIKE 'escrow-%' THEN 1 END) as with_escrow_prefix,
        COUNT(CASE WHEN id::text LIKE 'esc%' THEN 1 END) as with_esc_prefix,
        COUNT(CASE WHEN id::text NOT LIKE 'escrow-%' AND id::text NOT LIKE 'esc%' THEN 1 END) as without_prefix
      FROM escrows
    `);
    
    console.log('\n\nSummary:');
    console.log(`Total escrows: ${stats.rows[0].total}`);
    console.log(`With 'escrow-' prefix: ${stats.rows[0].with_escrow_prefix}`);
    console.log(`With 'esc' prefix: ${stats.rows[0].with_esc_prefix}`);
    console.log(`Without prefix: ${stats.rows[0].without_prefix}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPrefixes();