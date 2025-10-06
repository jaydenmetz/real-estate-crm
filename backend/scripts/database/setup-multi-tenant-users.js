const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupMultiTenantUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🏢 Setting up multi-tenant user structure...\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    // 1. Update admin account to have no personal data
    console.log('1️⃣ Updating admin account for system administration...');
    await client.query(`
      UPDATE users 
      SET 
        first_name = 'System',
        last_name = 'Admin',
        role = 'system_admin',
        updated_at = NOW()
      WHERE username = 'admin'
    `);
    console.log('✅ Admin account updated for system administration');
    
    // 2. Create jaydenmetz personal realtor account
    console.log('\n2️⃣ Creating personal realtor account...');
    
    // Check if jaydenmetz account exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      ['jaydenmetz', 'realtor@jaydenmetz.com']
    );
    
    if (existingUser.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Password123!', salt);
      
      const createResult = await client.query(`
        INSERT INTO users (
          username, email, password_hash, first_name, last_name, 
          role, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        RETURNING id, username, email
      `, ['jaydenmetz', 'realtor@jaydenmetz.com', passwordHash, 'Jayden', 'Metz', 'admin']);
      
      console.log('✅ Personal realtor account created:', createResult.rows[0]);
    } else {
      console.log('⚠️  Account already exists, updating password...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Password123!', salt);
      
      await client.query(`
        UPDATE users 
        SET 
          password_hash = $1,
          username = 'jaydenmetz',
          email = 'realtor@jaydenmetz.com',
          first_name = 'Jayden',
          last_name = 'Metz',
          role = 'admin',
          is_active = true,
          updated_at = NOW()
        WHERE username = 'jaydenmetz' OR email = 'realtor@jaydenmetz.com'
      `, [passwordHash]);
      console.log('✅ Personal realtor account updated');
    }
    
    // 3. Show all users
    console.log('\n📋 Current user structure:');
    const allUsers = await client.query(`
      SELECT username, email, first_name, last_name, role 
      FROM users 
      ORDER BY created_at
    `);
    
    console.log('╔════════════╤══════════════════════════╤═══════════════════╤═══════════════╗');
    console.log('║ Username   │ Email                    │ Name              │ Role          ║');
    console.log('╠════════════╪══════════════════════════╪═══════════════════╪═══════════════╣');
    allUsers.rows.forEach(user => {
      console.log(`║ ${user.username.padEnd(10)} │ ${user.email.padEnd(24)} │ ${(user.first_name + ' ' + user.last_name).padEnd(17)} │ ${user.role.padEnd(13)} ║`);
    });
    console.log('╚════════════╧══════════════════════════╧═══════════════════╧═══════════════╝');
    
    await client.query('COMMIT');
    
    console.log('\n✅ Setup complete! Login credentials:');
    console.log('\n🔑 System Admin (for managing all teams):');
    console.log('   Username: admin');
    console.log('   Password: AdminPassword123!');
    console.log('\n🏡 Personal Realtor Account:');
    console.log('   Username: jaydenmetz');
    console.log('   Email: realtor@jaydenmetz.com');
    console.log('   Password: Password123!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupMultiTenantUsers();