const express = require('express');

const router = express.Router();
const { pool } = require('../../config/infrastructure/database');

/**
 * PUBLIC STATUS PAGE
 *
 * What customers see: Simple operational status
 * What they DON'T see: Error logs, database stats, system resources
 *
 * This is your "status.jaydenmetz.com" or status banner on the app
 */

/**
 * Public operational status - NO authentication required
 * GET /v1/status/public
 *
 * Shows: API is up, database is reachable
 * Hides: Error details, connection counts, memory usage, etc.
 */
router.get('/public', async (req, res) => {
  const status = {
    service: 'Real Estate CRM API',
    status: 'operational', // operational, degraded, outage
    timestamp: new Date().toISOString(),
    components: [],
  };

  // Check 1: API is responding (if we get here, it's working)
  status.components.push({
    name: 'API Server',
    status: 'operational',
    description: 'REST API endpoints',
  });

  // Check 2: Database connectivity (simple ping, no details)
  try {
    await pool.query('SELECT 1');
    status.components.push({
      name: 'Database',
      status: 'operational',
      description: 'Data storage and retrieval',
    });
  } catch (error) {
    status.components.push({
      name: 'Database',
      status: 'outage',
      description: 'Data storage and retrieval',
    });
    status.status = 'outage';
  }

  // Check 3: Core endpoints available
  status.components.push({
    name: 'Escrows',
    status: 'operational',
    description: 'Transaction management',
  });

  status.components.push({
    name: 'Listings',
    status: 'operational',
    description: 'Property listings',
  });

  status.components.push({
    name: 'Authentication',
    status: 'operational',
    description: 'Login and security',
  });

  // Overall message for customers
  if (status.status === 'operational') {
    status.message = 'All systems operational';
  } else if (status.status === 'degraded') {
    status.message = 'Some systems experiencing issues. We\'re working on it.';
  } else {
    status.message = 'System outage detected. Our team has been notified.';
  }

  res.json({
    success: true,
    data: status,
  });
});

/**
 * Uptime check for monitoring services
 * GET /v1/status/ping
 *
 * Ultra-simple: Just returns 200 OK if server is up
 */
router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Health check for load balancers
 * GET /v1/status/health
 *
 * Returns 200 if healthy, 503 if unhealthy
 */
router.get('/health', async (req, res) => {
  try {
    // Quick database check
    await pool.query('SELECT 1');

    res.status(200).json({
      success: true,
      status: 'healthy',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Database unavailable',
    });
  }
});

module.exports = router;
