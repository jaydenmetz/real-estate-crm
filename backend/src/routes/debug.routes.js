const express = require('express');
const router = express.Router();
const { pool } = require('../config/infrastructure/database');
const { authenticate, requireRole } = require('../middleware/auth/auth.middleware');

// Security check - disable debug routes in production
if (process.env.NODE_ENV === 'production') {
  router.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Debug routes are disabled in production'
      }
    });
  });

  module.exports = router;
  return;
}

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

// Database status endpoint - admin only
// SECURITY: Using requireRole middleware instead of inline check
router.get('/db-status', authenticate, requireRole('system_admin', 'broker'), async (req, res) => {
  try {
    // Check if we want Railway database status
    const checkRailway = req.query.railway === 'true';
    const targetPool = checkRailway && process.env.RAILWAY_DATABASE_URL ? 
      new (require('pg').Pool)({ connectionString: process.env.RAILWAY_DATABASE_URL }) : 
      pool;

    // Get database name and basic info
    const dbInfo = await pool.query(`
      SELECT 
        current_database() as database_name,
        version() as version,
        pg_database_size(current_database()) as size
    `);

    // Get record counts for key tables
    const recordCounts = {};
    const tables = ['teams', 'users', 'escrows', 'listings', 'clients', 'leads', 'appointments'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        recordCounts[table] = parseInt(result.rows[0].count);
      } catch (err) {
        recordCounts[table] = 'N/A';
      }
    }

    // Get connection stats
    const connectionStats = await pool.query(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    // Format size for display
    const sizeInBytes = parseInt(dbInfo.rows[0].size);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    const sizeInGB = (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2);
    
    const sizeDisplay = sizeInGB > 1 
      ? `${sizeInGB} GB` 
      : `${sizeInMB} MB`;

    res.json({
      success: true,
      data: {
        status: 'connected',
        database: dbInfo.rows[0].database_name,
        environment: process.env.NODE_ENV || 'development',
        recordCounts,
        dbSize: {
          size: sizeInBytes,
          size_pretty: sizeDisplay
        },
        activeConnections: {
          total: parseInt(connectionStats.rows[0].total),
          active: parseInt(connectionStats.rows[0].active),
          idle: parseInt(connectionStats.rows[0].idle)
        },
        version: dbInfo.rows[0].version.split(' ')[0] + ' ' + dbInfo.rows[0].version.split(' ')[1]
      }
    });
  } catch (error) {
    console.error('Database status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DB_STATUS_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router;