const express = require('express');

const router = express.Router();
const { pool } = require('../config/infrastructure/database');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW() as time, COUNT(*) as user_count FROM users');

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          time: dbResult.rows[0].time,
          userCount: dbResult.rows[0].user_count,
        },
        environment: process.env.NODE_ENV,
        version: process.env.API_VERSION,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'UNHEALTHY',
        message: 'Service unhealthy',
        details: error.message,
      },
    });
  }
});

module.exports = router;
