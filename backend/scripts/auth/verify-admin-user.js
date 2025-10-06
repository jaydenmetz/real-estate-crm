const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying admin user...\n');
    
    // Check if admin user exists
    const userQuery = await client.query(
      'SELECT id, email, first_name, last_name, role, is_active, password_hash FROM users WHERE email = $1',
      ['admin@jaydenmetz.com']
    );
    
    if (userQuery.rows.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    const user = userQuery.rows[0];
    console.log('✅ Found admin user:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.is_active}`);
    console.log(`   Has password: ${user.password_hash ? 'Yes' : 'No'}`);
    
    // Test password
    if (user.password_hash) {
      const testPassword = 'AdminPassword123!';
      const isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log(`\n🔐 Password test with '${testPassword}': ${isValid ? 'VALID' : 'INVALID'}`);
      
      // If invalid, reset the password
      if (!isValid) {
        console.log('\n🔧 Resetting admin password...');
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(testPassword, salt);
        
        await client.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
          [newHash, user.id]
        );
        
        console.log('✅ Password reset successfully!');
      }
    } else {
      console.log('\n⚠️  No password hash found! Setting password...');
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash('AdminPassword123!', salt);
      
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newHash, user.id]
      );
      
      console.log('✅ Password set successfully!');
    }
    
    // Check all users
    console.log('\n📊 All users in database:');
    const allUsers = await client.query('SELECT email, role, is_active FROM users ORDER BY created_at');
    allUsers.rows.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) ${u.is_active ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyAdminUser();