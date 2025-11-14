/**
 * GDPR Compliance Routes
 * Handles data export and deletion requests for security events
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const SecurityEventService = require('../services/securityEvent.service');

// All routes require authentication
router.use(authenticate);

/**
 * GET /v1/gdpr/security-events/export
 * Export user's security events as CSV
 * Users can export their own data, admins can export any user's data
 */
router.get('/security-events/export', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    // Determine which user's data to export
    let targetUserId = req.user.id;

    // Admins can export any user's data
    // Normalize role - it might be a string or an array
    const userRole = Array.isArray(req.user.role) ? req.user.role[0] : req.user.role;
    if (userId && userRole === 'system_admin') {
      targetUserId = userId;
    } else if (userId && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only export your own security events',
        },
      });
    }

    // Query events
    const events = await SecurityEventService.queryEvents({
      userId: targetUserId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      limit: 100000, // Large limit for export
      offset: 0,
    });

    // Convert to CSV
    const csv = convertToCSV(events);

    // Get user info for filename
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [targetUserId]
    );
    const userEmail = userResult.rows[0]?.email || targetUserId;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="security-events-${userEmail}-${new Date().toISOString().split('T')[0]}.csv"`
    );

    res.send(csv);
  } catch (error) {
    console.error('Error exporting security events:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_FAILED',
        message: 'Failed to export security events',
      },
    });
  }
});

/**
 * DELETE /v1/gdpr/security-events/user/:userId
 * Delete all security events for a specific user (GDPR right to erasure)
 * Only admins can delete user data
 */
router.delete('/security-events/user/:userId', requireRole('system_admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const user = userResult.rows[0];

    // Count events before deletion
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM security_events WHERE user_id = $1',
      [userId]
    );
    const eventCount = parseInt(countResult.rows[0].count);

    // Delete all events for this user
    const deleteResult = await pool.query(
      'DELETE FROM security_events WHERE user_id = $1',
      [userId]
    );

    // Log the deletion (admin action)
    SecurityEventService.logEvent({
      eventType: 'data_deleted',
      eventCategory: 'data_access',
      severity: 'warning',
      userId: req.user.id,
      email: req.user.email,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestPath: req.originalUrl,
      requestMethod: req.method,
      success: true,
      message: `Admin deleted ${eventCount} security events for user ${user.email}`,
      metadata: {
        target_user_id: userId,
        target_user_email: user.email,
        events_deleted: eventCount,
        admin_user_id: req.user.id,
      },
    }).catch(console.error);

    res.json({
      success: true,
      data: {
        userId,
        userEmail: user.email,
        eventsDeleted: deleteResult.rowCount,
      },
      message: 'Security events deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting security events:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete security events',
      },
    });
  }
});

/**
 * POST /v1/gdpr/security-events/anonymize/:userId
 * Anonymize user's security events (replace PII with hashed values)
 * Alternative to deletion for audit trail preservation
 */
router.post('/security-events/anonymize/:userId', requireRole('system_admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const user = userResult.rows[0];

    // Anonymize events (keep event, remove PII)
    const anonymizeResult = await pool.query(`
      UPDATE security_events
      SET
        email = 'anonymized@redacted.com',
        username = 'anonymized_user',
        user_agent = 'Anonymized',
        metadata = CASE
          WHEN metadata IS NOT NULL THEN '{"anonymized": true}'::jsonb
          ELSE NULL
        END
      WHERE user_id = $1
    `, [userId]);

    // Log the anonymization
    SecurityEventService.logEvent({
      eventType: 'data_updated',
      eventCategory: 'data_access',
      severity: 'warning',
      userId: req.user.id,
      email: req.user.email,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestPath: req.originalUrl,
      requestMethod: req.method,
      success: true,
      message: `Admin anonymized security events for user ${user.email}`,
      metadata: {
        target_user_id: userId,
        target_user_email: user.email,
        events_anonymized: anonymizeResult.rowCount,
        admin_user_id: req.user.id,
      },
    }).catch(console.error);

    res.json({
      success: true,
      data: {
        userId,
        eventsAnonymized: anonymizeResult.rowCount,
      },
      message: 'Security events anonymized successfully',
    });
  } catch (error) {
    console.error('Error anonymizing security events:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANONYMIZE_FAILED',
        message: 'Failed to anonymize security events',
      },
    });
  }
});

/**
 * Helper function to convert events to CSV format
 */
function convertToCSV(events) {
  if (!events || events.length === 0) {
    return 'No events found';
  }

  // CSV headers
  const headers = [
    'Timestamp',
    'Event Type',
    'Category',
    'Severity',
    'Success',
    'IP Address',
    'User Agent',
    'Request Path',
    'Request Method',
    'Message',
    'Metadata',
  ];

  // Convert events to rows
  const rows = events.map(event => [
    new Date(event.created_at).toISOString(),
    event.event_type,
    event.event_category,
    event.severity,
    event.success ? 'Yes' : 'No',
    event.ip_address || '',
    event.user_agent || '',
    event.request_path || '',
    event.request_method || '',
    event.message || '',
    event.metadata ? JSON.stringify(event.metadata) : '',
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape commas and quotes in CSV
      const escaped = String(cell).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')),
  ].join('\n');

  return csvContent;
}

module.exports = router;
