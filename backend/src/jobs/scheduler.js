/**
 * Job Scheduler
 * Manages cron jobs for background tasks
 *
 * Jobs:
 * - Security Event Retention: Daily at 2 AM (deletes events > 90 days)
 *
 * Usage in app.js:
 *   require('./jobs/scheduler');
 */

const cron = require('node-cron');
const { deleteOldSecurityEvents } = require('./securityEventRetention.job');

// Security Event Retention Job - Daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('🕐 Running scheduled job: Security Event Retention');
  try {
    const result = await deleteOldSecurityEvents();
    if (!result.success) {
      console.error('Security Event Retention job failed:', result.error);
    }
  } catch (error) {
    console.error('Error running Security Event Retention job:', error);
  }
}, {
  timezone: 'America/Los_Angeles', // Adjust to your timezone
});

console.log('✅ Job Scheduler initialized');
console.log('📅 Scheduled jobs:');
console.log('  - Security Event Retention: Daily at 2 AM PST');

module.exports = {};
