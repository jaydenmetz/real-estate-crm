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

    // Update escrows with commission values
    console.log('\n📊 Updating escrow commissions...');
    
    // Set commission_percentage for escrows that don't have it
    const updatePercentageResult = await client.query(`
      UPDATE escrows 
      SET commission_percentage = 2.5 
      WHERE commission_percentage IS NULL OR commission_percentage = 0
    `);
    
    console.log(`✅ Updated ${updatePercentageResult.rowCount} escrows with 2.5% commission percentage`);

    // Calculate and set gross_commission
    const updateGrossResult = await client.query(`
      UPDATE escrows 
      SET gross_commission = purchase_price * commission_percentage / 100
      WHERE gross_commission IS NULL OR gross_commission = 0
    `);
    
    console.log(`✅ Updated ${updateGrossResult.rowCount} escrows with calculated gross commission`);

    // Set net_commission (same as gross for now)
    const updateNetResult = await client.query(`
      UPDATE escrows 
      SET net_commission = gross_commission
      WHERE net_commission IS NULL OR net_commission = 0
    `);
    
    console.log(`✅ Updated ${updateNetResult.rowCount} escrows with net commission`);

    // Verify the update
    const verifyResult = await client.query(`
      SELECT 
        display_id,
        purchase_price,
        commission_percentage,
        gross_commission,
        net_commission
      FROM escrows
      ORDER BY created_at DESC
    `);

    console.log('\n📋 Current escrow commissions:');
    verifyResult.rows.forEach(row => {
      console.log(`${row.display_id}: $${row.purchase_price.toLocaleString()} × ${row.commission_percentage}% = $${row.net_commission.toLocaleString()}`);
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