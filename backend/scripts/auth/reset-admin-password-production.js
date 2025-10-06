const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetAdminPassword() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Resetting admin password in production...\n');
    
    const email = 'admin@jaydenmetz.com';
    const newPassword = 'AdminPassword123!';
    
    // Check if user exists
    const userResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Admin user not found! Creating new admin user...');
      
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      
      const createResult = await client.query(`
        INSERT INTO users (
          email, password_hash, first_name, last_name, role, 
          is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING id, email
      `, [email, passwordHash, 'Admin', 'User', 'admin']);
      
      console.log('✅ Admin user created:', createResult.rows[0]);
    } else {
      console.log('✅ Found admin user:', userResult.rows[0].email);
      
      // Reset password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, userResult.rows[0].id]
      );
      
      console.log('✅ Password reset successfully!');
    }
    
    console.log('\n📋 Admin credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    
    // Test the password
    const testResult = await client.query(
      'SELECT password_hash FROM users WHERE email = $1',
      [email]
    );
    
    const isValid = await bcrypt.compare(newPassword, testResult.rows[0].password_hash);
    console.log('\n🔑 Password verification:', isValid ? 'VALID ✅' : 'INVALID ❌');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

resetAdminPassword();