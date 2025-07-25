const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addUsernameColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding username column to users table...\n');
    
    // Check if username column already exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'username'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ Username column already exists');
    } else {
      // Add username column
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(50) UNIQUE
      `);
      console.log('✅ Username column added');
    }
    
    // Set username for admin user
    const updateResult = await client.query(`
      UPDATE users 
      SET username = 'admin' 
      WHERE email = 'admin@jaydenmetz.com'
      RETURNING id, email, username, first_name, last_name
    `);
    
    if (updateResult.rows.length > 0) {
      console.log('\n✅ Username updated for admin user:');
      console.log('   Email:', updateResult.rows[0].email);
      console.log('   Username:', updateResult.rows[0].username);
      console.log('   Name:', updateResult.rows[0].first_name, updateResult.rows[0].last_name);
    }
    
    // Set usernames for other test users
    await client.query(`UPDATE users SET username = 'agent' WHERE email = 'agent@test.com'`);
    await client.query(`UPDATE users SET username = 'broker' WHERE email = 'broker@test.com'`);
    await client.query(`UPDATE users SET username = 'assistant' WHERE email = 'assistant@test.com'`);
    
    console.log('\n📋 All users with usernames:');
    const allUsers = await client.query('SELECT email, username, role FROM users ORDER BY created_at');
    allUsers.rows.forEach(user => {
      console.log(`   ${user.username || 'N/A'} - ${user.email} (${user.role})`);
    });
    
    console.log('\n✅ Done! You can now login with:');
    console.log('   Username: admin');
    console.log('   Password: AdminPassword123!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addUsernameColumn();