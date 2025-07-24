const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkClientsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking clients table structure...\n');
    
    // Check columns
    const columnsQuery = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Clients table columns:');
    columnsQuery.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
    });
    
    // Check sample data
    const sampleQuery = await client.query('SELECT * FROM clients LIMIT 3');
    console.log(`\n📊 Sample data (${sampleQuery.rows.length} rows):`);
    console.log(sampleQuery.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkClientsTable();