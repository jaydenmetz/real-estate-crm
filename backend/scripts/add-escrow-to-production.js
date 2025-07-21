#!/usr/bin/env node

const { Pool } = require('pg');
const readline = require('readline');

// Use Railway DATABASE_URL from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function addEscrow() {
  try {
    console.log('🏠 Add New Escrow to Production Database\n');

    // Check connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to Railway PostgreSQL\n');

    // Get escrow details
    const id = await question('Escrow ID (e.g., ESC-2025-003): ') || `ESC-${Date.now()}`;
    const address = await question('Property Address: ') || '123 Default St, Los Angeles, CA';
    const status = await question('Status (Active/Pending/Closed) [Active]: ') || 'Active';
    const price = await question('Purchase Price: ') || '1000000';
    const earnestMoney = await question('Earnest Money Deposit [1% of price]: ') || (parseFloat(price) * 0.01);
    const downPayment = await question('Down Payment [20% of price]: ') || (parseFloat(price) * 0.20);
    const loanAmount = parseFloat(price) - parseFloat(downPayment);
    const commissionPct = await question('Commission % [2.5]: ') || '2.5';
    const grossCommission = parseFloat(price) * (parseFloat(commissionPct) / 100);
    const netCommission = grossCommission / 2; // Assuming 50/50 split
    const acceptanceDate = await question('Acceptance Date (YYYY-MM-DD) [today]: ') || new Date().toISOString().split('T')[0];
    const closingDate = await question('Closing Date (YYYY-MM-DD) [30 days]: ') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const propertyType = await question('Property Type [Single Family]: ') || 'Single Family';
    const leadSource = await question('Lead Source [Website]: ') || 'Website';

    // Insert escrow
    const query = `
      INSERT INTO escrows (
        id, property_address, escrow_status, purchase_price,
        earnest_money_deposit, down_payment, loan_amount,
        commission_percentage, gross_commission, net_commission,
        acceptance_date, closing_date, property_type, lead_source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, property_address, purchase_price, escrow_status
    `;

    const values = [
      id, address, status, price,
      earnestMoney, downPayment, loanAmount,
      commissionPct, grossCommission, netCommission,
      acceptanceDate, closingDate, propertyType, leadSource
    ];

    const result = await pool.query(query, values);
    
    console.log('\n✅ Escrow added successfully!');
    console.log('📋 Details:', result.rows[0]);

    // Ask if they want to add buyer/seller
    const addBuyer = await question('\nAdd buyer info? (y/n) [y]: ');
    if (addBuyer !== 'n') {
      const buyerName = await question('Buyer Name: ') || 'John Doe';
      const buyerEmail = await question('Buyer Email: ') || 'buyer@email.com';
      const buyerPhone = await question('Buyer Phone: ') || '(555) 123-4567';

      await pool.query(
        'INSERT INTO escrow_buyers (escrow_id, name, email, phone) VALUES ($1, $2, $3, $4)',
        [id, buyerName, buyerEmail, buyerPhone]
      );
      console.log('✅ Buyer added');
    }

    const addSeller = await question('\nAdd seller info? (y/n) [y]: ');
    if (addSeller !== 'n') {
      const sellerName = await question('Seller Name: ') || 'Jane Smith';
      const sellerEmail = await question('Seller Email: ') || 'seller@email.com';
      const sellerPhone = await question('Seller Phone: ') || '(555) 987-6543';

      await pool.query(
        'INSERT INTO escrow_sellers (escrow_id, name, email, phone) VALUES ($1, $2, $3, $4)',
        [id, sellerName, sellerEmail, sellerPhone]
      );
      console.log('✅ Seller added');
    }

    // Show total count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM escrows');
    console.log(`\n📊 Total escrows in database: ${countResult.rows[0].total}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === '23505') {
      console.error('This escrow ID already exists. Please use a different ID.');
    }
  } finally {
    rl.close();
    await pool.end();
  }
}

// Quick add function for command line arguments
async function quickAdd(args) {
  try {
    if (args.length < 2) {
      console.log('Usage: node add-escrow-to-production.js quick "123 Main St" 500000');
      process.exit(1);
    }

    const [address, price] = args;
    const id = `ESC-${Date.now()}`;
    
    const query = `
      INSERT INTO escrows (
        id, property_address, escrow_status, purchase_price,
        earnest_money_deposit, down_payment, loan_amount,
        commission_percentage, gross_commission, net_commission,
        acceptance_date, closing_date, property_type, lead_source
      ) VALUES (
        $1, $2, 'Active', $3,
        $3 * 0.01, $3 * 0.20, $3 * 0.80,
        2.5, $3 * 0.025, $3 * 0.0125,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
        'Single Family', 'Quick Add'
      )
      RETURNING id, property_address, purchase_price
    `;

    await pool.query('SELECT NOW()');
    const result = await pool.query(query, [id, address, parseFloat(price)]);
    
    console.log('✅ Escrow added:', result.rows[0]);
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Main execution
if (process.argv[2] === 'quick') {
  quickAdd(process.argv.slice(3));
} else {
  console.log('Make sure DATABASE_URL is set to your Railway PostgreSQL URL');
  console.log('Example: DATABASE_URL="postgresql://..." node add-escrow-to-production.js\n');
  addEscrow();
}