const express = require('express');

const router = express.Router();
const SecurityEventService = require('../services/securityEvent.service');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// All security event routes require authentication
router.use(authenticate);

/**
 * GET /v1/security-events
 * Query security events with filters
 * Query params:
 *  - eventType: Filter by event type
 *  - eventCategory: Filter by category (authentication, authorization, api_key, account, suspicious)
 *  - severity: Filter by severity (info, warning, error, critical)
 *  - startDate: Filter events after this date (ISO 8601)
 *  - endDate: Filter events before this date (ISO 8601)
 *  - success: Filter by success status (true/false)
 *  - limit: Number of events to return (default 100, max 500)
 *  - offset: Pagination offset (default 0)
 */
router.get('/', async (req, res) => {
  try {
    const {
      eventType,
      eventCategory,
      severity,
      startDate,
      endDate,
      success,
      limit = 100,
      offset = 0,
    } = req.query;

    // Users can only view their own events (unless admin)
    const userId = req.user.role === 'system_admin' ? null : req.user.id;

    // Parse success parameter
    const successFilter = success !== undefined ? success === 'true' : null;

    // Limit maximum results
    const limitValue = Math.min(parseInt(limit) || 100, 500);
    const offsetValue = parseInt(offset) || 0;

    const events = await SecurityEventService.queryEvents({
      userId,
      eventType,
      eventCategory,
      severity,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      success: successFilter,
      limit: limitValue,
      offset: offsetValue,
    });

    res.json({
      success: true,
      data: events,
      pagination: {
        limit: limitValue,
        offset: offsetValue,
        count: events.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error querying security events:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to query security events',
      },
    });
  }
});

/**
 * GET /v1/security-events/stats
 * Get security event statistics for the current user
 * Query params:
 *  - daysBack: Number of days to look back (default 30, max 365)
 */
router.get('/stats', async (req, res) => {
  try {
    const { daysBack = 30 } = req.query;

    // Users can only view their own stats (unless admin)
    const userId = req.user.role === 'system_admin' ? null : req.user.id;

    // Limit maximum days back
    const daysValue = Math.min(parseInt(daysBack) || 30, 365);

    const stats = await SecurityEventService.getEventStats(userId, daysValue);

    res.json({
      success: true,
      data: {
        stats,
        period: {
          days: daysValue,
          startDate: new Date(Date.now() - daysValue * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting security event stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_FAILED',
        message: 'Failed to get security event statistics',
      },
    });
  }
});

/**
 * GET /v1/security-events/recent
 * Get recent security events for the current user (last 50)
 */
router.get('/recent', async (req, res) => {
  try {
    // Users can only view their own events (unless admin)
    const userId = req.user.role === 'system_admin' ? null : req.user.id;

    const events = await SecurityEventService.queryEvents({
      userId,
      limit: 50,
      offset: 0,
    });

    res.json({
      success: true,
      data: events,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting recent security events:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to get recent security events',
      },
    });
  }
});

/**
 * GET /v1/security-events/critical
 * Get critical security events (admin only)
 * Query params:
 *  - daysBack: Number of days to look back (default 7, max 90)
 */
router.get('/critical', requireRole('system_admin'), async (req, res) => {
  try {
    const { daysBack = 7 } = req.query;
    const daysValue = Math.min(parseInt(daysBack) || 7, 90);

    const startDate = new Date(Date.now() - daysValue * 24 * 60 * 60 * 1000);

    const events = await SecurityEventService.queryEvents({
      severity: 'critical',
      startDate,
      limit: 100,
      offset: 0,
    });

    res.json({
      success: true,
      data: events,
      period: {
        days: daysValue,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting critical security events:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to get critical security events',
      },
    });
  }
});

module.exports = router;
