#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');

// Production database config (Railway)
const productionConfig = {
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: {
    rejectUnauthorized: false
  }
};

async function updateCommissions() {
  const client = new Client(productionConfig);

  try {
    console.log('🔄 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected to production database');

    // Update escrows with null buyer_side_commission
    console.log('\n📊 Updating escrow commissions...');
    
    const updateResult = await client.query(`
      UPDATE escrows 
      SET buyer_side_commission = 2.5 
      WHERE buyer_side_commission IS NULL
    `);
    
    console.log(`✅ Updated ${updateResult.rowCount} escrows with 2.5% commission`);

    // Verify the update
    const verifyResult = await client.query(`
      SELECT 
        display_id,
        purchase_price,
        buyer_side_commission,
        (purchase_price * buyer_side_commission / 100) as calculated_commission
      FROM escrows
      ORDER BY created_at DESC
    `);

    console.log('\n📋 Current escrow commissions:');
    verifyResult.rows.forEach(row => {
      console.log(`${row.display_id}: $${row.purchase_price.toLocaleString()} × ${row.buyer_side_commission}% = $${row.calculated_commission.toLocaleString()}`);
    });

    console.log('\n✅ Commission update complete!');

  } catch (error) {
    console.error('❌ Error updating commissions:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the update
console.log('🚀 Starting commission update...\n');
updateCommissions()
  .then(() => {
    console.log('\n✅ Update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Update failed:', error.message);
    process.exit(1);
  });