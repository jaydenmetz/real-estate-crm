const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkProductionSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking production database schema...\n');
    
    // Check all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in production database:');
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Check escrow_timeline columns
    console.log('\n📅 escrow_timeline columns:');
    const timelineColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'escrow_timeline' 
      ORDER BY ordinal_position
    `);
    timelineColumns.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
    
    // Check escrow_financials columns
    console.log('\n💰 escrow_financials columns:');
    const financialColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'escrow_financials' 
      ORDER BY ordinal_position
    `);
    financialColumns.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
    
    // Check escrow_documents columns
    console.log('\n📄 escrow_documents columns:');
    const documentColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'escrow_documents' 
      ORDER BY ordinal_position
    `);
    documentColumns.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
    
    // Check escrow_checklists columns
    console.log('\n✅ escrow_checklists columns:');
    const checklistColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'escrow_checklists' 
      ORDER BY ordinal_position
    `);
    checklistColumns.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
    
    // Check escrow_people columns
    console.log('\n👥 escrow_people columns:');
    const peopleColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'escrow_people' 
      ORDER BY ordinal_position
    `);
    peopleColumns.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkProductionSchema();