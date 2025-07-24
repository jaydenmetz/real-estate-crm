const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Use local database by default, Railway if specified
const isRailway = process.argv.includes('--railway');
const connectionString = isRailway ? process.env.RAILWAY_DATABASE_URL : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: isRailway ? { rejectUnauthorized: false } : false
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Creating admin user...\n');
    
    // Admin user details
    const email = 'admin@jaydenmetz.com';
    const password = 'AdminPassword123!'; // Change this!
    const firstName = 'Jayden';
    const lastName = 'Metz';
    const role = 'admin';
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists');
      
      // Update password if needed
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [passwordHash, email]
      );
      
      console.log('✅ Admin password updated');
      console.log('\n📧 Login credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('\n⚠️  IMPORTANT: Change this password after first login!');
      
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create admin user
    const createUserQuery = `
      INSERT INTO users (
        email, password_hash, first_name, last_name, role, 
        is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role
    `;
    
    const result = await client.query(createUserQuery, [
      email,
      passwordHash,
      firstName,
      lastName,
      role
    ]);
    
    const user = result.rows[0];
    
    console.log('✅ Admin user created successfully!');
    console.log('\n👤 User details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n📧 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    
    // Also create some test users
    console.log('\n🔧 Creating test users...');
    
    const testUsers = [
      { email: 'agent@test.com', firstName: 'Test', lastName: 'Agent', role: 'agent' },
      { email: 'broker@test.com', firstName: 'Test', lastName: 'Broker', role: 'broker' },
      { email: 'assistant@test.com', firstName: 'Test', lastName: 'Assistant', role: 'assistant' }
    ];
    
    for (const testUser of testUsers) {
      try {
        const testPasswordHash = await bcrypt.hash('TestPassword123!', salt);
        await client.query(createUserQuery, [
          testUser.email,
          testPasswordHash,
          testUser.firstName,
          testUser.lastName,
          testUser.role
        ]);
        console.log(`   ✅ Created ${testUser.role}: ${testUser.email}`);
      } catch (e) {
        console.log(`   ⚠️  ${testUser.email} already exists`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser();