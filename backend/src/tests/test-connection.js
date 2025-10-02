const express = require('express');

const router = express.Router();
const { Pool } = require('pg');

// Test endpoint that creates its own pool
router.get('/', async (req, res) => {
  let testPool;
  try {
    // Create a test pool with the DATABASE_URL
    testPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Test the connection
    const result = await testPool.query('SELECT COUNT(*) as count FROM escrows');

    res.json({
      success: true,
      data: {
        escrowCount: result.rows[0].count,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set',
        nodeEnv: process.env.NODE_ENV || 'not set',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set',
        nodeEnv: process.env.NODE_ENV || 'not set',
      },
    });
  } finally {
    if (testPool) {
      await testPool.end();
    }
  }
});

module.exports = router;
