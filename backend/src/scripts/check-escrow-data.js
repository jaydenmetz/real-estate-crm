const { Pool } = require('pg');
// Load environment based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '../../.env.production' : '../../.env';
require('dotenv').config({ path: envFile });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkEscrowData() {
  try {
    console.log('Connecting to database...');
    
    // Check specific escrow
    const escrowId = 'esc5334a-b582-430c-a5fe-f4fe7fb6355e';
    
    const result = await pool.query(`
      SELECT 
        id,
        display_id,
        property_address,
        purchase_price,
        down_payment,
        loan_amount,
        earnest_money,
        earnest_money_deposit,
        commission_percentage,
        buyer_side_commission,
        listing_side_commission,
        net_commission,
        gross_commission,
        total_commission,
        my_commission
      FROM escrows 
      WHERE id = $1 OR id = $2
    `, [escrowId, `escrow-${escrowId.substring(3)}`]);
    
    if (result.rows.length > 0) {
      console.log('\nEscrow found:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('\nNo escrow found with ID:', escrowId);
      
      // Try to find any escrows
      const anyEscrows = await pool.query(`
        SELECT id, display_id, property_address, purchase_price 
        FROM escrows 
        LIMIT 5
      `);
      
      console.log('\nSample escrows in database:');
      anyEscrows.rows.forEach(row => {
        console.log(`- ID: ${row.id}, Display: ${row.display_id}, Price: ${row.purchase_price}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEscrowData();