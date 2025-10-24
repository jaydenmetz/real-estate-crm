/**
 * Security Event Retention Job
 * Deletes security events older than 90 days (configurable)
 *
 * Run schedule: Daily at 2 AM (low traffic time)
 * Retention period: 90 days (configurable via environment)
 *
 * Usage:
 *   node src/jobs/securityEventRetention.job.js
 *
 * Or add to crontab:
 *   0 2 * * * cd /app && node src/jobs/securityEventRetention.job.js >> /var/log/retention.log 2>&1
 */

const { pool } = require('../config/database');

// Retention period in days (default 90, configurable via env)
const RETENTION_DAYS = parseInt(process.env.SECURITY_EVENT_RETENTION_DAYS) || 90;

async function deleteOldSecurityEvents() {
  const startTime = Date.now();
  // // console.log(`\n=== Security Event Retention Job Started ===`);
  // // console.log(`Timestamp: ${new Date().toISOString()}`);
  // // console.log(`Retention Period: ${RETENTION_DAYS} days`);

  try {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    // // console.log(`Deleting events older than: ${cutoffDate.toISOString()}`);

    // Count events to be deleted
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM security_events WHERE created_at < $1',
      [cutoffDate]
    );
    const eventsToDelete = parseInt(countResult.rows[0].count);
    // // console.log(`Events to delete: ${eventsToDelete}`);

    if (eventsToDelete === 0) {
      // // console.log('✅ No events to delete. Job complete.');
      return {
        success: true,
        eventsDeleted: 0,
        duration: Date.now() - startTime,
      };
    }

    // Delete old events
    const deleteResult = await pool.query(
      'DELETE FROM security_events WHERE created_at < $1',
      [cutoffDate]
    );

    const eventsDeleted = deleteResult.rowCount;
    const duration = Date.now() - startTime;

    // // console.log(`✅ Successfully deleted ${eventsDeleted} events`);
    // // console.log(`Duration: ${duration}ms`);
    // // console.log(`=== Security Event Retention Job Complete ===\n`);

    return {
      success: true,
      eventsDeleted,
      cutoffDate: cutoffDate.toISOString(),
      duration,
    };
  } catch (error) {
    console.error('❌ Security Event Retention Job Failed:', error);
    console.error('Error Details:', {
      message: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

// Run if executed directly
if (require.main === module) {
  deleteOldSecurityEvents()
    .then((result) => {
      // // console.log('Job Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = { deleteOldSecurityEvents };
