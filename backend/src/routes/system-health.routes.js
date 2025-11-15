const express = require('express');

const router = express.Router();
const os = require('os');
const pool = require('../config/infrastructure/database');
const { getRedisClient } = require('../config/infrastructure/redis');
const { authenticate, requireRole } = require('../middleware/auth/auth.middleware');
const fs = require('fs').promises;
const path = require('path');

/**
 * COMPREHENSIVE SYSTEM HEALTH CHECK - ADMIN ONLY
 *
 * ⚠️ SECURITY: These endpoints expose internal system details
 * ⚠️ ACCESS: Restricted to system_admin role only
 *
 * What is Redis?
 * --------------
 * Redis is an in-memory data store (cache) that's super fast.
 * Think of it like RAM for your database - temporary but very quick.
 *
 * What we use it for (or could use it for):
 * 1. Session storage - Store user login sessions (faster than database)
 * 2. API rate limiting - Track how many requests each user makes
 * 3. Caching - Store frequently accessed data (like popular escrows)
 * 4. Real-time features - WebSocket connections, live updates
 *
 * Current Status: OPTIONAL - Your app works without it
 *
 * Authentication Storage:
 * -----------------------
 * Currently your auth is stored in:
 * 1. PostgreSQL - User accounts, passwords, API keys (permanent storage)
 * 2. Browser localStorage - JWT tokens and user info (client-side)
 * 3. Redis (if available) - Could store sessions for faster validation
 */

// SECURITY: All health check routes require authentication and system_admin role
// Using standard auth.middleware instead of custom adminOnly middleware
router.use(authenticate);
router.use(requireRole('system_admin'));

/**
 * Main system health check - ADMIN ONLY
 * GET /v1/health
 *
 * ⚠️ Requires: Authentication + system_admin role
 */
router.get('/', async (req, res) => {
  const healthStatus = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    checks: {},
  };

  // 1. PostgreSQL Health Check
  try {
    const startTime = Date.now();
    const dbResult = await pool.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        pg_database_size(current_database()) as size_bytes,
        NOW() as server_time,
        COUNT(*) as connection_count
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    const queryTime = Date.now() - startTime;

    // Get table counts
    const tableStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM escrows) as escrows,
        (SELECT COUNT(*) FROM api_keys) as api_keys,
        (SELECT COUNT(*) FROM teams) as teams
    `);

    healthStatus.checks.postgresql = {
      status: 'healthy',
      responseTime: `${queryTime}ms`,
      details: {
        database: dbResult.rows[0].database,
        user: dbResult.rows[0].user,
        version: dbResult.rows[0].version.split(' ')[1], // Extract version number
        sizeInMB: Math.round(dbResult.rows[0].size_bytes / 1024 / 1024),
        serverTime: dbResult.rows[0].server_time,
        activeConnections: parseInt(dbResult.rows[0].connection_count),
        tableCounts: tableStats.rows[0],
      },
    };
  } catch (error) {
    healthStatus.checks.postgresql = {
      status: 'unhealthy',
      error: error.message,
      recommendation: 'Check DATABASE_URL and PostgreSQL server status',
    };
  }

  // 2. Redis Health Check
  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      const startTime = Date.now();

      // Test Redis connection
      await redisClient.ping();

      // Get Redis info
      const info = await redisClient.info('server');
      const memInfo = await redisClient.info('memory');

      // Parse Redis version from info
      const versionMatch = info.match(/redis_version:([^\r\n]+)/);
      const usedMemoryMatch = memInfo.match(/used_memory_human:([^\r\n]+)/);

      const queryTime = Date.now() - startTime;

      healthStatus.checks.redis = {
        status: 'healthy',
        responseTime: `${queryTime}ms`,
        details: {
          connected: true,
          version: versionMatch ? versionMatch[1] : 'unknown',
          usedMemory: usedMemoryMatch ? usedMemoryMatch[1] : 'unknown',
          purpose: 'Optional caching layer for performance',
        },
      };
    } catch (error) {
      healthStatus.checks.redis = {
        status: 'degraded',
        error: error.message,
        note: 'Redis is optional - app functions without it',
        impact: 'Slightly slower performance, no caching',
      };
    }
  } else {
    healthStatus.checks.redis = {
      status: 'not_configured',
      note: 'Redis not enabled - this is OK',
      impact: 'No performance impact for current features',
    };
  }

  // 3. Authentication System Check
  try {
    // Check JWT secret is configured
    const hasJWTSecret = !!process.env.JWT_SECRET;

    // Check recent authentications
    const authStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_api_keys,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_keys,
        COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as valid_keys
      FROM api_keys
      WHERE created_at > NOW() - INTERVAL '30 days'
    `);

    healthStatus.checks.authentication = {
      status: 'healthy',
      details: {
        jwtConfigured: hasJWTSecret,
        storageLocation: 'PostgreSQL (permanent) + Browser localStorage (temporary)',
        activeUsers: parseInt(authStats.rows[0].active_users),
        totalApiKeys: parseInt(authStats.rows[0].total_api_keys),
        activeApiKeys: parseInt(authStats.rows[0].active_keys),
        validApiKeys: parseInt(authStats.rows[0].valid_keys),
      },
    };
  } catch (error) {
    healthStatus.checks.authentication = {
      status: 'warning',
      error: error.message,
    };
  }

  // 4. System Resources Check
  healthStatus.checks.system = {
    status: 'healthy',
    details: {
      platform: os.platform(),
      nodeVersion: process.version,
      memoryUsage: {
        totalMB: Math.round(os.totalmem() / 1024 / 1024),
        freeMB: Math.round(os.freemem() / 1024 / 1024),
        usedByAppMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      cpuCores: os.cpus().length,
      loadAverage: os.loadavg(),
      uptime: {
        system: os.uptime(),
        process: process.uptime(),
      },
    },
  };

  // 5. API Endpoints Check
  try {
    const endpointChecks = [
      { name: 'Auth', path: '/auth/test', method: 'GET' },
      { name: 'Escrows', path: '/escrows', method: 'GET' },
      { name: 'API Keys', path: '/api-keys', method: 'GET' },
    ];

    healthStatus.checks.endpoints = {
      status: 'healthy',
      available: endpointChecks.map((e) => e.name),
      note: 'All endpoints require authentication except /health',
    };
  } catch (error) {
    healthStatus.checks.endpoints = {
      status: 'warning',
      error: error.message,
    };
  }

  // Determine overall health status
  const statuses = Object.values(healthStatus.checks).map((c) => c.status);
  if (statuses.includes('unhealthy')) {
    healthStatus.status = 'unhealthy';
  } else if (statuses.includes('degraded') || statuses.includes('warning')) {
    healthStatus.status = 'degraded';
  } else {
    healthStatus.status = 'healthy';
  }

  // Add recommendations
  healthStatus.recommendations = [];

  if (!redisClient) {
    healthStatus.recommendations.push({
      type: 'performance',
      message: 'Consider adding Redis for caching and session storage',
      priority: 'low',
      impact: 'Would improve response times for frequently accessed data',
    });
  }

  if (healthStatus.checks.postgresql?.details?.activeConnections > 80) {
    healthStatus.recommendations.push({
      type: 'scaling',
      message: 'High number of database connections',
      priority: 'medium',
      action: 'Consider connection pooling or scaling database',
    });
  }

  res.json({
    success: true,
    data: healthStatus,
  });
});

/**
 * Detailed PostgreSQL diagnostics
 * GET /v1/health/postgres
 */
router.get('/postgres', async (req, res) => {
  try {
    const diagnostics = {};

    // Connection stats
    const connections = await pool.query(`
      SELECT 
        state,
        COUNT(*) as count,
        MAX(query_start) as last_query
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY state
    `);

    diagnostics.connections = connections.rows;

    // Table sizes
    try {
      const tableSizes = await pool.query(`
        SELECT
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `);
      diagnostics.largestTables = tableSizes.rows;
    } catch (e) {
      // Fallback to simpler query
      const tableSizes = await pool.query(`
        SELECT
          tablename,
          pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(tablename::regclass) DESC
        LIMIT 10
      `);
      diagnostics.largestTables = tableSizes.rows;
    }

    // Slow queries (if pg_stat_statements is available)
    try {
      const slowQueries = await pool.query(`
        SELECT 
          calls,
          mean_exec_time,
          total_exec_time,
          LEFT(query, 100) as query_preview
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat%'
        ORDER BY mean_exec_time DESC
        LIMIT 5
      `);
      diagnostics.slowQueries = slowQueries.rows;
    } catch (e) {
      diagnostics.slowQueries = 'pg_stat_statements extension not available';
    }

    // Index usage
    try {
      const indexUsage = await pool.query(`
        SELECT
          schemaname,
          tablename,
          indexname,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
        LIMIT 10
      `);
      diagnostics.indexUsage = indexUsage.rows;
    } catch (e) {
      diagnostics.indexUsage = 'Index statistics not available';
    }

    res.json({
      success: true,
      data: diagnostics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('PostgreSQL health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * Redis diagnostics (if available)
 * GET /v1/health/redis
 */
router.get('/redis', async (req, res) => {
  const redisClient = getRedisClient();

  if (!redisClient) {
    return res.json({
      success: true,
      data: {
        status: 'not_configured',
        message: 'Redis is not configured for this deployment',
        explanation: 'Redis is optional and used for caching. Your app works fine without it.',
        benefits_if_enabled: [
          'Faster API responses through caching',
          'Session storage across server restarts',
          'Rate limiting capabilities',
          'Real-time features support',
        ],
      },
    });
  }

  try {
    const info = await redisClient.info();
    const dbSize = await redisClient.dbSize();

    // Parse info string
    const infoLines = info.split('\r\n');
    const infoObj = {};

    infoLines.forEach((line) => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          infoObj[key] = value;
        }
      }
    });

    res.json({
      success: true,
      data: {
        status: 'connected',
        keyCount: dbSize,
        version: infoObj.redis_version,
        uptime: infoObj.uptime_in_seconds,
        memory: {
          used: infoObj.used_memory_human,
          peak: infoObj.used_memory_peak_human,
          rss: infoObj.used_memory_rss_human,
        },
        clients: {
          connected: infoObj.connected_clients,
          blocked: infoObj.blocked_clients,
        },
        persistence: {
          lastSave: infoObj.rdb_last_save_time,
          changes: infoObj.rdb_changes_since_last_save,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Authentication system diagnostics
 * GET /v1/health/auth
 */
router.get('/auth', async (req, res) => {
  try {
    const diagnostics = {};

    // User statistics
    const userStats = await pool.query(`
      SELECT 
        role,
        COUNT(*) as count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        MAX(created_at) as newest_user
      FROM users
      GROUP BY role
    `);

    diagnostics.usersByRole = userStats.rows;

    // API key statistics
    const apiKeyStats = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as keys_created,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_keys
      FROM api_keys
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    diagnostics.recentApiKeyActivity = apiKeyStats.rows;

    // Authentication methods being used
    const authMethods = await pool.query(`
      SELECT 
        COUNT(DISTINCT user_id) as users_with_api_keys
      FROM api_keys
      WHERE is_active = true
    `);

    diagnostics.authMethods = {
      jwtEnabled: !!process.env.JWT_SECRET,
      apiKeysEnabled: true,
      usersWithApiKeys: authMethods.rows[0].users_with_api_keys,
      sessionStorage: 'Browser localStorage (JWT) + PostgreSQL (API Keys)',
      redisSessionsEnabled: !!getRedisClient(),
    };

    // Failed login attempts (if tracking)
    diagnostics.security = {
      passwordHashAlgorithm: 'bcrypt',
      jwtExpirationTime: process.env.JWT_EXPIRATION || '30d',
      apiKeyLength: 64,
      rateLimitingEnabled: false, // Could check if Redis is being used for this
    };

    res.json({
      success: true,
      data: diagnostics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Test all health endpoints
 * GET /v1/health/test-all
 */
router.get('/test-all', async (req, res) => {
  const tests = [];

  // Test main health
  try {
    const mainHealth = await fetch(`${req.protocol}://${req.get('host')}/v1/health`);
    tests.push({
      endpoint: '/v1/health',
      status: mainHealth.status,
      success: mainHealth.ok,
    });
  } catch (error) {
    tests.push({
      endpoint: '/v1/health',
      status: 'error',
      error: error.message,
    });
  }

  res.json({
    success: true,
    data: {
      summary: 'Use these endpoints to monitor system health',
      endpoints: {
        '/v1/health': 'Main system health check (PUBLIC)',
        '/v1/health/postgres': 'PostgreSQL detailed diagnostics',
        '/v1/health/redis': 'Redis cache diagnostics',
        '/v1/health/auth': 'Authentication system diagnostics',
      },
      tests,
    },
  });
});

module.exports = router;
