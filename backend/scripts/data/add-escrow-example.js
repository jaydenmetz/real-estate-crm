const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'real_estate_crm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function addEscrow() {
  try {
    const escrowData = {
      id: 'ESC-2025-003',
      property_address: '789 Pine Street, Los Angeles, CA 90003',
      escrow_status: 'Active',
      purchase_price: 925000.00,
      earnest_money_deposit: 46250.00,
      down_payment: 185000.00,
      loan_amount: 740000.00,
      commission_percentage: 2.5,
      gross_commission: 23125.00,
      net_commission: 21000.00,
      acceptance_date: '2025-01-20',
      closing_date: '2025-03-15',
      property_type: 'Single Family',
      lead_source: 'Referral'
    };

    const query = `
      INSERT INTO escrows (
        id, property_address, escrow_status, purchase_price,
        earnest_money_deposit, down_payment, loan_amount,
        commission_percentage, gross_commission, net_commission,
        acceptance_date, closing_date, property_type, lead_source
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *`;

    const values = [
      escrowData.id,
      escrowData.property_address,
      escrowData.escrow_status,
      escrowData.purchase_price,
      escrowData.earnest_money_deposit,
      escrowData.down_payment,
      escrowData.loan_amount,
      escrowData.commission_percentage,
      escrowData.gross_commission,
      escrowData.net_commission,
      escrowData.acceptance_date,
      escrowData.closing_date,
      escrowData.property_type,
      escrowData.lead_source
    ];

    const result = await pool.query(query, values);
    console.log('Escrow added successfully:', result.rows[0]);
  } catch (error) {
    console.error('Error adding escrow:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
addEscrow();