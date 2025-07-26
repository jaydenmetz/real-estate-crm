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

async function checkSchema() {
  const client = new Client(productionConfig);

  try {
    console.log('🔄 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected to production database');

    // Check escrow table columns
    console.log('\n📊 Checking escrows table schema...');
    
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Escrows table columns:');
    schemaResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

    // Check sample data
    const dataResult = await client.query(`
      SELECT display_id, purchase_price, escrow_status
      FROM escrows
      LIMIT 3;
    `);

    console.log('\n📋 Sample escrow data:');
    dataResult.rows.forEach(row => {
      console.log(`- ${row.display_id}: $${row.purchase_price} (${row.escrow_status})`);
    });

    console.log('\n✅ Schema check complete!');

  } catch (error) {
    console.error('❌ Error checking schema:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the check
console.log('🚀 Starting schema check...\n');
checkSchema()
  .then(() => {
    console.log('\n✅ Check completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error.message);
    process.exit(1);
  });