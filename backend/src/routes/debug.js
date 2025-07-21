const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Debug endpoint to test database connection
router.get('/test-db', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT NOW() as time, COUNT(*) as count FROM escrows');
    
    res.json({
      success: true,
      data: {
        database: {
          connected: true,
          time: dbTest.rows[0].time,
          escrowCount: dbTest.rows[0].count
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not Set',
          REDIS_URL: process.env.REDIS_URL ? 'Set' : 'Not Set'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DEBUG_ERROR',
        message: error.message,
        details: {
          name: error.name,
          code: error.code
        }
      }
    });
  }
});

module.exports = router;