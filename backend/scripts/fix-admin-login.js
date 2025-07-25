const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAdminLogin() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing admin login...\n');
    
    // First, let's see all users
    console.log('📋 Current users in database:');
    const allUsers = await client.query('SELECT id, email, first_name, last_name, role, is_active FROM users ORDER BY created_at');
    
    if (allUsers.rows.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      allUsers.rows.forEach(user => {
        console.log(`- ${user.email} (${user.first_name} ${user.last_name}) - Role: ${user.role} - Active: ${user.is_active}`);
      });
    }
    
    // Check for admin user
    const adminEmail = 'admin@jaydenmetz.com';
    const adminResult = await client.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
      [adminEmail]
    );
    
    let userId;
    
    if (adminResult.rows.length === 0) {
      console.log('\n❌ Admin user not found! Creating new admin user...');
      
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('AdminPassword123!', salt);
      
      const createResult = await client.query(`
        INSERT INTO users (
          email, password_hash, first_name, last_name, role, 
          is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING id
      `, [adminEmail, passwordHash, 'Admin', 'User', 'admin']);
      
      userId = createResult.rows[0].id;
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('\n✅ Admin user found:', adminResult.rows[0].email);
      userId = adminResult.rows[0].id;
      
      // Reset password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('AdminPassword123!', salt);
      
      await client.query(
        'UPDATE users SET password_hash = $1, is_active = true, updated_at = NOW() WHERE id = $2',
        [passwordHash, userId]
      );
      
      console.log('✅ Password reset successfully!');
    }
    
    // Check if there's a Jayden user
    const jaydenResult = await client.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email LIKE $1 OR first_name ILIKE $2',
      ['%jayden%', 'jayden']
    );
    
    if (jaydenResult.rows.length > 0) {
      console.log('\n📋 Found Jayden user(s):');
      for (const user of jaydenResult.rows) {
        console.log(`- ${user.email} (${user.first_name} ${user.last_name})`);
        
        // Reset password for Jayden user too
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('AdminPassword123!', salt);
        
        await client.query(
          'UPDATE users SET password_hash = $1, is_active = true, role = $2, updated_at = NOW() WHERE id = $3',
          [passwordHash, 'admin', user.id]
        );
        
        console.log(`  ✅ Password reset and admin role granted for ${user.email}`);
      }
    }
    
    console.log('\n✅ All done! You can now login with:');
    console.log('   Email: admin@jaydenmetz.com');
    console.log('   Password: AdminPassword123!');
    
    if (jaydenResult.rows.length > 0) {
      console.log('\n   Or with your Jayden account using the same password');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAdminLogin();