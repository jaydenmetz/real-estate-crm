// Quick script to check production database structure
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const productionPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkProductionDB() {
  const client = await productionPool.connect();
  
  try {
    // Check what tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const result = await client.query(tablesQuery);
    console.log('\n📊 Tables in production database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check escrows table structure
    const columnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' 
      ORDER BY ordinal_position
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('\n📋 Escrows table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // Count existing escrows
    const countResult = await client.query('SELECT COUNT(*) FROM escrows');
    console.log(`\n📦 Current escrow count: ${countResult.rows[0].count}`);
    
    // Check triggers on escrows table
    const triggersQuery = `
      SELECT trigger_name, event_manipulation, action_statement 
      FROM information_schema.triggers 
      WHERE event_object_table = 'escrows'
    `;
    
    const triggersResult = await client.query(triggersQuery);
    console.log('\n🔧 Triggers on escrows table:');
    triggersResult.rows.forEach(row => {
      console.log(`  - ${row.trigger_name} (${row.event_manipulation})`);
    });
    
  } catch (error) {
    console.error('Error checking production database:', error.message);
  } finally {
    client.release();
    await productionPool.end();
  }
}

checkProductionDB();