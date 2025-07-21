const express = require('express');
const router = express.Router();

// Ultra simple test endpoint
router.get('/env', (req, res) => {
  res.json({
    success: true,
    data: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      REDIS_URL: process.env.REDIS_URL ? 'SET' : 'NOT SET',
      PORT: process.env.PORT || 'not set'
    }
  });
});

// Test database with inline pool
router.get('/db', async (req, res) => {
  const { Pool } = require('pg');
  let pool;
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const result = await pool.query('SELECT COUNT(*) as count FROM escrows');
    
    res.json({
      success: true,
      data: {
        escrowCount: result.rows[0].count,
        message: 'Database connection successful'
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN',
        stack: error.stack.split('\n').slice(0, 3)
      }
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
});

module.exports = router;