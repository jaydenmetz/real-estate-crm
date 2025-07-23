// Script to add a new escrow with auto-incrementing ID
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addNewEscrow(escrowData) {
  try {
    // Get the next ID
    const idResult = await pool.query(
      'SELECT COALESCE(MAX(id::integer), 0) + 1 as next_id FROM escrows'
    );
    const nextId = idResult.rows[0].next_id;
    
    // Insert the new escrow
    const insertQuery = `
      INSERT INTO escrows (
        id, property_address, escrow_status, purchase_price,
        earnest_money_deposit, down_payment, loan_amount,
        commission_percentage, gross_commission, net_commission,
        acceptance_date, closing_date, property_type, lead_source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      nextId.toString(),
      escrowData.property_address,
      escrowData.escrow_status || 'Active',
      escrowData.purchase_price,
      escrowData.earnest_money_deposit || escrowData.purchase_price * 0.01,
      escrowData.down_payment || escrowData.purchase_price * 0.2,
      escrowData.loan_amount || escrowData.purchase_price * 0.8,
      escrowData.commission_percentage || 2.5,
      escrowData.gross_commission || escrowData.purchase_price * 0.025,
      escrowData.net_commission || escrowData.purchase_price * 0.025 * 0.5,
      escrowData.acceptance_date || new Date().toISOString().split('T')[0],
      escrowData.closing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      escrowData.property_type || 'Single Family',
      escrowData.lead_source || 'Website'
    ];
    
    const result = await pool.query(insertQuery, values);
    console.log('✅ New escrow added successfully!');
    console.log('ID:', result.rows[0].id);
    console.log('Property:', result.rows[0].property_address);
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error adding escrow:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Example usage:
if (require.main === module) {
  // You can run this script directly to add a test escrow
  addNewEscrow({
    property_address: '456 Test Street, Los Angeles, CA 90001',
    purchase_price: 950000,
    commission_percentage: 2.5
  }).then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { addNewEscrow };