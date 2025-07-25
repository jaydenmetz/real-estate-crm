const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTableStructures() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking table structures...\n');
    
    const tables = ['escrows', 'listings', 'clients', 'leads', 'appointments'];
    
    for (const table of tables) {
      console.log(`\n📋 ${table} table columns:`);
      
      const columns = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
        LIMIT 10
      `, [table]);
      
      if (columns.rows.length > 0) {
        columns.rows.forEach(col => {
          console.log(`   ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('   Table not found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTableStructures();