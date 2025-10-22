/**
 * Job Scheduler
 * Manages cron jobs for background tasks
 *
 * Jobs:
 * - Security Event Retention: Daily at 2 AM (deletes events > 90 days)
 * - KPI Monthly Snapshots: 1st of each month at 3 AM (stores monthly KPIs)
 *
 * Usage in app.js:
 *   require('./jobs/scheduler');
 */

const cron = require('node-cron');
const { deleteOldSecurityEvents } = require('./securityEventRetention.job');
const { storeMonthlyKPISnapshots } = require('./kpiSnapshot.job');

// Security Event Retention Job - Daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  // console.log('🕐 Running scheduled job: Security Event Retention');
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

// KPI Monthly Snapshots Job - 1st of each month at 3 AM
cron.schedule('0 3 1 * *', async () => {
  // console.log('🕐 Running scheduled job: Monthly KPI Snapshots');
  try {
    const result = await storeMonthlyKPISnapshots();
    if (!result.success) {
      console.error('Monthly KPI Snapshots job failed:', result.error);
    }
  } catch (error) {
    console.error('Error running Monthly KPI Snapshots job:', error);
  }
}, {
  timezone: 'America/Los_Angeles', // Adjust to your timezone
});

// console.log('✅ Job Scheduler initialized');
// console.log('📅 Scheduled jobs:');
// console.log('  - Security Event Retention: Daily at 2 AM PST');
// console.log('  - Monthly KPI Snapshots: 1st of each month at 3 AM PST');

module.exports = {};
