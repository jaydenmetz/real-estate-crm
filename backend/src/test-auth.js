const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Direct database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Test endpoint
app.post('/test-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    res.json({
      received: { username, hasPassword: !!password },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDbUrl: !!process.env.DATABASE_URL || !!process.env.RAILWAY_DATABASE_URL
      }
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Real login
app.post('/real-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Query user
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.json({ error: 'Invalid password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      '69f1e69d189afcf71dbdba8b7fa4668566ba5491a',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email }
    });
    
  } catch (error) {
    res.json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

const PORT = process.env.TEST_PORT || 3456;
app.listen(PORT, () => {
  console.log(`Test auth server running on port ${PORT}`);
});