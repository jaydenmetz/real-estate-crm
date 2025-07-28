const { Pool } = require('pg');
require('dotenv').config();

// Use production DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function checkProductionDatabase() {
  console.log('\n=== Checking Production Database Structure ===\n');
  
  try {
    // Check what columns exist in escrows table
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' 
      AND column_name IN ('id', 'global_id', 'numeric_id', 'display_id', 'team_sequence_id', 'uuid')
      ORDER BY column_name
    `);
    
    console.log('Escrows table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if we have data
    const countResult = await pool.query('SELECT COUNT(*) as count FROM escrows');
    console.log(`\nTotal escrows in database: ${countResult.rows[0].count}`);
    
    // Check sample data
    const sampleResult = await pool.query(`
      SELECT id, global_id, display_id, property_address 
      FROM escrows 
      LIMIT 3
    `).catch(err => {
      // If id doesn't exist, try with global_id
      return pool.query(`
        SELECT global_id, display_id, property_address 
        FROM escrows 
        LIMIT 3
      `);
    });
    
    if (sampleResult.rows.length > 0) {
      console.log('\nSample escrows:');
      sampleResult.rows.forEach((row, idx) => {
        console.log(`  ${idx + 1}. ${row.display_id} - ${row.property_address}`);
        console.log(`     ID: ${row.id || row.global_id}`);
      });
    }
    
    // Check which migrations have been run
    const migrationsResult = await pool.query(`
      SELECT filename 
      FROM migrations 
      WHERE filename LIKE '%013%' OR filename LIKE '%014%'
      ORDER BY filename
    `);
    
    console.log('\nMigrations status:');
    const migration013 = migrationsResult.rows.find(r => r.filename.includes('013'));
    const migration014 = migrationsResult.rows.find(r => r.filename.includes('014'));
    
    console.log(`  - 013_rename_global_id_to_id.sql: ${migration013 ? '✓ Applied' : '✗ Not applied'}`);
    console.log(`  - 014_cleanup_escrow_columns.sql: ${migration014 ? '✓ Applied' : '✗ Not applied'}`);
    
    // Provide recommendations
    console.log('\n=== Recommendations ===\n');
    
    const hasGlobalId = columnsResult.rows.some(r => r.column_name === 'global_id');
    const hasId = columnsResult.rows.some(r => r.column_name === 'id');
    
    if (hasGlobalId && !hasId) {
      console.log('⚠️  Your production database is using global_id instead of id.');
      console.log('   You need to run migration 013 to rename global_id to id.');
      console.log('\n   Run this in Railway dashboard SQL tab:');
      console.log('   npm run migrate');
    } else if (hasId) {
      console.log('✓ Your production database correctly uses id as the primary key.');
    }
    
    if (!migration013 || !migration014) {
      console.log('\n⚠️  Some migrations have not been applied to production.');
      console.log('   Connect to your Railway dashboard and run: npm run migrate');
    }
    
  } catch (error) {
    console.error('Error checking database:', error.message);
    if (error.message.includes('connect')) {
      console.error('\n⚠️  Could not connect to production database.');
      console.error('   Make sure DATABASE_URL is set correctly in your .env file.');
    }
  } finally {
    await pool.end();
  }
}

// Run the check
checkProductionDatabase().catch(console.error);