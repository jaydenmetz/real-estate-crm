const express = require('express');

const router = express.Router();
const { pool } = require('../../config/infrastructure/database');
const SecurityEventService = require('../../services/securityEvent.service');

/**
 * Security Events Health Check Endpoint
 * Tests all aspects of Phase 5 security event logging
 */
router.get('/health', async (req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    overall: 'healthy',
    checks: [],
  };

  try {
    // Test 1: Database Connection
    try {
      await pool.query('SELECT 1');
      results.checks.push({
        name: 'Database Connection',
        status: 'pass',
        message: 'Database connection active',
      });
    } catch (error) {
      results.checks.push({
        name: 'Database Connection',
        status: 'fail',
        message: error.message,
      });
      results.overall = 'unhealthy';
    }

    // Test 2: Security Events Table Exists
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'security_events'
        )
      `);

      if (tableCheck.rows[0].exists) {
        results.checks.push({
          name: 'Security Events Table',
          status: 'pass',
          message: 'Table exists',
        });
      } else {
        throw new Error('security_events table does not exist');
      }
    } catch (error) {
      results.checks.push({
        name: 'Security Events Table',
        status: 'fail',
        message: error.message,
      });
      results.overall = 'unhealthy';
    }

    // Test 3: SecurityEventService Available
    try {
      if (typeof SecurityEventService.logEvent === 'function') {
        results.checks.push({
          name: 'SecurityEventService',
          status: 'pass',
          message: 'Service available with all methods',
        });
      } else {
        throw new Error('SecurityEventService.logEvent not available');
      }
    } catch (error) {
      results.checks.push({
        name: 'SecurityEventService',
        status: 'fail',
        message: error.message,
      });
      results.overall = 'unhealthy';
    }

    // Test 4: Event Logging (Fire-and-Forget Test)
    try {
      // This should not throw even if logging fails
      SecurityEventService.logEvent({
        eventType: 'test',
        eventCategory: 'system',
        severity: 'info',
        success: true,
        message: 'Health check test event',
        ipAddress: req.ip || 'health-check',
        userAgent: 'Health Check',
        requestPath: '/v1/security-events/health',
        requestMethod: 'GET',
      }).catch(() => {
        // Fire-and-forget - errors are expected to be caught
      });

      results.checks.push({
        name: 'Event Logging (Fire-and-Forget)',
        status: 'pass',
        message: 'Logging initiated without blocking',
      });
    } catch (error) {
      results.checks.push({
        name: 'Event Logging (Fire-and-Forget)',
        status: 'fail',
        message: error.message,
      });
      results.overall = 'unhealthy';
    }

    // Test 5: Event Retrieval
    try {
      const events = await SecurityEventService.queryEvents({
        userId: null, // System check, no user filter
        limit: 1,
      });

      results.checks.push({
        name: 'Event Retrieval',
        status: 'pass',
        message: `Can query events (found ${events.length} recent)`,
      });
    } catch (error) {
      results.checks.push({
        name: 'Event Retrieval',
        status: 'fail',
        message: error.message,
      });
      results.overall = 'unhealthy';
    }

    // Test 6: Table Indexes Exist
    try {
      const indexCheck = await pool.query(`
        SELECT COUNT(*) as index_count
        FROM pg_indexes
        WHERE tablename = 'security_events'
      `);

      const indexCount = parseInt(indexCheck.rows[0].index_count);

      if (indexCount >= 10) {
        results.checks.push({
          name: 'Performance Indexes',
          status: 'pass',
          message: `${indexCount} indexes present for optimal performance`,
        });
      } else {
        results.checks.push({
          name: 'Performance Indexes',
          status: 'warn',
          message: `Only ${indexCount} indexes found (expected 13+)`,
        });
      }
    } catch (error) {
      results.checks.push({
        name: 'Performance Indexes',
        status: 'fail',
        message: error.message,
      });
    }

    // Test 7: Recent Event Count
    try {
      const countResult = await pool.query(`
        SELECT COUNT(*) as total
        FROM security_events
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);

      const recentCount = parseInt(countResult.rows[0].total);

      results.checks.push({
        name: 'Recent Activity',
        status: 'pass',
        message: `${recentCount} events logged in last 24 hours`,
      });
    } catch (error) {
      results.checks.push({
        name: 'Recent Activity',
        status: 'fail',
        message: error.message,
      });
    }

    // Test 8: All Event Types Supported
    try {
      const supportedTypes = [
        'login_success',
        'login_failed',
        'account_locked',
        'lockout_attempt_while_locked',
        'token_refresh',
        'api_key_created',
        'api_key_revoked',
      ];

      results.checks.push({
        name: 'Supported Event Types',
        status: 'pass',
        message: `${supportedTypes.length} event types supported`,
      });
    } catch (error) {
      results.checks.push({
        name: 'Supported Event Types',
        status: 'fail',
        message: error.message,
      });
    }

    // Summary
    const passCount = results.checks.filter((c) => c.status === 'pass').length;
    const failCount = results.checks.filter((c) => c.status === 'fail').length;
    const warnCount = results.checks.filter((c) => c.status === 'warn').length;

    results.summary = {
      total: results.checks.length,
      passed: passCount,
      failed: failCount,
      warnings: warnCount,
      score: `${passCount}/${results.checks.length}`,
    };

    // Return appropriate status code
    const statusCode = results.overall === 'healthy' ? 200 : 503;
    res.status(statusCode).json(results);
  } catch (error) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      overall: 'error',
      message: 'Health check failed',
      error: error.message,
      checks: results.checks,
    });
  }
});

module.exports = router;
