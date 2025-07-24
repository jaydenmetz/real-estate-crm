// Script to reset both local and production databases
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Local database connection
const localPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Production database connection
const productionPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function clearDatabase(pool, environment) {
  const client = await pool.connect();
  
  try {
    // Don't use transactions for this operation
    // await client.query('BEGIN');
    
    console.log(`\n🗑️  Clearing ${environment} database...`);
    
    // Delete in correct order due to foreign key constraints
    // Use conditional deletes to handle missing tables
    const tables = [
      'escrow_checklists',
      'escrow_buyers', 
      'escrow_sellers',
      'escrows'
    ];
    
    for (const table of tables) {
      try {
        await client.query(`DELETE FROM ${table}`);
        console.log(`  ✓ Cleared ${table}`);
      } catch (e) {
        if (e.code !== '42P01') { // 42P01 is "table does not exist"
          throw e;
        }
        console.log(`  - Table ${table} doesn't exist, skipping`);
      }
    }
    
    // Reset sequences if they exist
    try {
      await client.query('ALTER SEQUENCE escrows_numeric_id_seq RESTART WITH 1');
    } catch (e) {
      // Sequence might not exist in all environments
    }
    
    // await client.query('COMMIT');
    console.log(`✅ ${environment} database cleared successfully`);
    
  } catch (error) {
    // await client.query('ROLLBACK');
    console.error(`❌ Error clearing ${environment} database:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function resetDatabases() {
  try {
    // Check if we have production database URL
    if (!process.env.RAILWAY_DATABASE_URL && !process.env.PRODUCTION_DATABASE_URL) {
      console.log('⚠️  No production database URL found. Please set RAILWAY_DATABASE_URL in .env.local');
      console.log('   You can find this in your Railway project settings');
      process.exit(1);
    }
    
    // Clear both databases
    await clearDatabase(localPool, 'LOCAL');
    await clearDatabase(productionPool, 'PRODUCTION');
    
    console.log('\n✅ Both databases have been cleared successfully');
    
  } catch (error) {
    console.error('❌ Failed to reset databases:', error);
  } finally {
    await localPool.end();
    await productionPool.end();
  }
}

// Run the script
resetDatabases();