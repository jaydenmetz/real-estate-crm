const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUsersTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking users table...\n');
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist');
      return;
    }
    
    console.log('✅ Users table exists');
    
    // Check columns
    const columnsQuery = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Users table columns:');
    columnsQuery.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
    });
    
    // Check if there are any users
    const countQuery = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Total users: ${countQuery.rows[0].count}`);
    
    // Get sample user
    const sampleQuery = await client.query('SELECT id, email, name, role FROM users LIMIT 1');
    if (sampleQuery.rows.length > 0) {
      console.log('\n📌 Sample user:');
      console.log(sampleQuery.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkUsersTable();