const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.production') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateEscrowFinancialData() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to production database');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Check current state of ESCROW-2025-0002
    const checkResult = await client.query(`
      SELECT 
        id,
        display_id,
        property_address,
        purchase_price,
        down_payment,
        loan_amount,
        net_commission
      FROM escrows 
      WHERE display_id = 'ESCROW-2025-0002'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('\nCurrent state of ESCROW-2025-0002:');
      console.log(checkResult.rows[0]);
      
      // Update with financial data
      const updateResult = await client.query(`
        UPDATE escrows
        SET
          purchase_price = 1250000,
          down_payment = 250000,
          loan_amount = 1000000,
          earnest_money = 25000,
          earnest_money_deposit = 25000,
          commission_percentage = 2.5,
          buyer_side_commission = 2.5,
          listing_side_commission = 2.5,
          gross_commission = 31250,
          total_commission = 31250,
          net_commission = 31250,
          updated_at = NOW()
        WHERE display_id = 'ESCROW-2025-0002'
        RETURNING *
      `);
      
      console.log('\nUpdated ESCROW-2025-0002 with financial data');
      console.log('New values:', {
        purchase_price: updateResult.rows[0].purchase_price,
        down_payment: updateResult.rows[0].down_payment,
        loan_amount: updateResult.rows[0].loan_amount,
        net_commission: updateResult.rows[0].net_commission
      });
      
      // Update other escrows with 0 or NULL purchase_price
      const updateOthersResult = await client.query(`
        UPDATE escrows
        SET 
          purchase_price = CASE
            WHEN property_type = 'Condo' THEN 850000 + (RANDOM() * 500000)::integer
            WHEN property_type = 'Single Family' THEN 1200000 + (RANDOM() * 800000)::integer
            WHEN property_type = 'Townhouse' THEN 950000 + (RANDOM() * 400000)::integer
            ELSE 1000000 + (RANDOM() * 500000)::integer
          END,
          down_payment = purchase_price * 0.2,
          loan_amount = purchase_price * 0.8,
          earnest_money = 25000,
          earnest_money_deposit = 25000,
          commission_percentage = 2.5,
          buyer_side_commission = 2.5,
          gross_commission = purchase_price * 0.025,
          total_commission = purchase_price * 0.025,
          net_commission = purchase_price * 0.025,
          updated_at = NOW()
        WHERE (purchase_price IS NULL OR purchase_price = 0)
          AND display_id != 'ESCROW-2025-0002'
      `);
      
      console.log(`\nUpdated ${updateOthersResult.rowCount} other escrows with financial data`);
      
      // Commit transaction
      await client.query('COMMIT');
      console.log('\nTransaction committed successfully');
      
      // Show final results
      const finalResult = await client.query(`
        SELECT 
          display_id,
          property_address,
          purchase_price,
          down_payment,
          loan_amount,
          net_commission
        FROM escrows
        ORDER BY display_id
        LIMIT 10
      `);
      
      console.log('\nFinal escrow financial data:');
      finalResult.rows.forEach(row => {
        console.log(`${row.display_id}: $${row.purchase_price?.toLocaleString() || 0} (Commission: $${row.net_commission?.toLocaleString() || 0})`);
      });
      
    } else {
      console.log('ESCROW-2025-0002 not found');
      await client.query('ROLLBACK');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating escrow financial data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
updateEscrowFinancialData()
  .then(() => {
    console.log('\nFinancial data update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nUpdate failed:', error.message);
    process.exit(1);
  });