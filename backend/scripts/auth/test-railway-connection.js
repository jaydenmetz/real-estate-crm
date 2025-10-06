const { Pool } = require('pg');

const DATABASE_URL = "postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('Testing connection to Railway PostgreSQL...');
    
    // Test basic connection
    const timeResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully at:', timeResult.rows[0].now);
    
    // Check if escrows table exists
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'escrows'
      );
    `);
    console.log('✅ Escrows table exists:', tableResult.rows[0].exists);
    
    // Count escrows
    const countResult = await pool.query('SELECT COUNT(*) FROM escrows');
    console.log('✅ Total escrows in database:', countResult.rows[0].count);
    
    // Get sample escrow
    const sampleResult = await pool.query('SELECT id, property_address FROM escrows LIMIT 1');
    if (sampleResult.rows.length > 0) {
      console.log('✅ Sample escrow:', sampleResult.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await pool.end();
  }
}

testConnection();