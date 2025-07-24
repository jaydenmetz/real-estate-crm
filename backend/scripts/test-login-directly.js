const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testLogin() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Testing login directly...\n');
    
    const email = 'admin@jaydenmetz.com';
    const password = 'AdminPassword123!';
    
    // Get user
    const userQuery = `
      SELECT id, email, password_hash, first_name, last_name, role, is_active
      FROM users
      WHERE email = $1
    `;
    
    const userResult = await client.query(userQuery, [email]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ User found:', user.email);
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password valid:', isValid);
    
    if (isValid) {
      // Generate token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || '69f1e69d189afcf71dbdba8b7fa4668566ba5491a',
        { expiresIn: '30d' }
      );
      
      console.log('\n✅ Login successful!');
      console.log('🎫 Token:', token.substring(0, 50) + '...');
      console.log('\n📋 Response would be:');
      console.log(JSON.stringify({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isActive: user.is_active
          },
          token: token
        }
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testLogin();