const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkContactsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking contacts table structure...\n');
    
    // Check columns
    const columnsQuery = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'contacts'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Contacts table columns:');
    columnsQuery.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
    });
    
    // Check sample data
    const sampleQuery = await client.query('SELECT id, first_name, last_name, email FROM contacts LIMIT 5');
    console.log(`\n📊 Sample contacts (${sampleQuery.rows.length} rows):`);
    sampleQuery.rows.forEach(row => {
      console.log(`  - ${row.first_name} ${row.last_name} (${row.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkContactsTable();