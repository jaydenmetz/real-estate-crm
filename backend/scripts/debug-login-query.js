const { Pool } = require('pg');
const bcryptjs = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:password123@localhost:5432/real_estate_crm'
});

async function debugLogin() {
  const loginEmail = 'admin';
  const password = 'Password123!';
  
  try {
    // Same query as auth controller
    const userQuery = `
      SELECT id, email, password_hash, first_name, last_name, role, is_active
      FROM users
      WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)
    `;
    
    console.log('Query:', userQuery);
    console.log('Login value:', loginEmail);
    
    const userResult = await pool.query(userQuery, [loginEmail]);
    console.log('Found users:', userResult.rows.length);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('User:', {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      });
      
      console.log('Password hash from DB:', user.password_hash);
      console.log('Password to check:', password);
      
      const isValid = await bcryptjs.compare(password, user.password_hash);
      console.log('Password valid:', isValid);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

debugLogin();