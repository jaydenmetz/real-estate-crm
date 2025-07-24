const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testStatsQuery() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing stats query...\n');
    
    // Test basic stats query
    console.log('1. Testing basic stats query:');
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE escrow_status = 'Active') as active,
          COUNT(*) FILTER (WHERE escrow_status = 'Pending') as pending,
          COUNT(*) FILTER (WHERE escrow_status = 'Closed') as closed,
          COUNT(*) as total,
          SUM(purchase_price) as total_volume,
          SUM(net_commission) as total_commission
        FROM escrows
      `;
      const result = await client.query(statsQuery);
      console.log('✅ Basic stats:', result.rows[0]);
    } catch (e) {
      console.log('❌ Basic stats failed:', e.message);
    }
    
    // Test month extraction
    console.log('\n2. Testing month extraction:');
    try {
      const monthQuery = `
        SELECT 
          COUNT(*) as count,
          EXTRACT(MONTH FROM closing_date) as month,
          EXTRACT(YEAR FROM closing_date) as year
        FROM escrows
        WHERE escrow_status = 'Closed'
        AND closing_date IS NOT NULL
        GROUP BY month, year
      `;
      const result = await client.query(monthQuery);
      console.log('✅ Month extraction works:', result.rows);
    } catch (e) {
      console.log('❌ Month extraction failed:', e.message);
    }
    
    // Test date arithmetic
    console.log('\n3. Testing date arithmetic:');
    try {
      const dateQuery = `
        SELECT 
          COUNT(*) as count,
          AVG(closing_date - acceptance_date) as avg_interval
        FROM escrows
        WHERE escrow_status = 'Closed'
        AND closing_date IS NOT NULL
        AND acceptance_date IS NOT NULL
      `;
      const result = await client.query(dateQuery);
      console.log('✅ Date arithmetic works:', result.rows[0]);
    } catch (e) {
      console.log('❌ Date arithmetic failed:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testStatsQuery();