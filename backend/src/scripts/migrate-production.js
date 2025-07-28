const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use production DATABASE_URL directly
const PRODUCTION_DATABASE_URL = 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway';

const pool = new Pool({
  connectionString: PRODUCTION_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runProductionMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Connected to Railway production database');
    console.log('📦 Running production fix migration...\n');
    
    // Read the production fix SQL
    const sqlPath = path.join(__dirname, '../../migrations/production-fix.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Run the migration
    await client.query('BEGIN');
    console.log('🔄 Starting transaction...');
    
    await client.query(sql);
    console.log('✅ Migration executed successfully');
    
    await client.query('COMMIT');
    console.log('✅ Transaction committed\n');
    
    // Verify the results
    console.log('🔍 Verifying database structure...');
    
    const verifyResult = await client.query(`
      SELECT 
        COUNT(*) as total_escrows,
        MIN(numeric_id) as min_numeric_id,
        MAX(numeric_id) as max_numeric_id
      FROM escrows
    `);
    
    console.log('📊 Database summary:');
    console.log(`   Total escrows: ${verifyResult.rows[0].total_escrows}`);
    console.log(`   Numeric ID range: ${verifyResult.rows[0].min_numeric_id} - ${verifyResult.rows[0].max_numeric_id}`);
    
    // Show sample data
    const sampleResult = await client.query(`
      SELECT id::text, numeric_id, display_id, property_address
      FROM escrows
      ORDER BY numeric_id
      LIMIT 5
    `);
    
    console.log('\n📋 Sample escrows after migration:');
    sampleResult.rows.forEach(row => {
      console.log(`   ${row.numeric_id}. ${row.display_id} - ${row.property_address}`);
      console.log(`      ID: ${row.id}`);
    });
    
    console.log('\n✅ Production database migration completed successfully!');
    console.log('🎉 Escrows should now appear correctly in the application.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error('🔙 Transaction rolled back');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
console.log('🚀 Starting Railway production database migration...\n');
runProductionMigration()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });