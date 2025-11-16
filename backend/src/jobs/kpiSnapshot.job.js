/**
 * KPI Snapshot Job
 * Stores monthly KPI snapshots for all active users
 *
 * PHASE 4: Multi-Tenant Admin System - KPI Calculation
 *
 * Runs on the 1st of each month at 3 AM
 * Calculates and stores KPIs for the previous month
 */

const KPIService = require('../modules/system/stats/services/kpi.service');

/**
 * Store monthly KPI snapshots for all users
 * @returns {Promise<Object>} Job result
 */
async function storeMonthlyKPISnapshots() {
  try {
    // console.log('📊 Starting monthly KPI snapshot job...');

    // Store snapshots for all users (no broker_id = all brokerages)
    const summary = await KPIService.storeMonthlySnapshots();

    // console.log('✅ Monthly KPI snapshot job completed:');
    // console.log(`  - Total users processed: ${summary.totalUsers}`);
    // console.log(`  - Successful snapshots: ${summary.successful}`);
    // console.log(`  - Failed snapshots: ${summary.failed}`);
    // console.log(`  - Period: ${summary.period.start.toISOString().split('T')[0]} to ${summary.period.end.toISOString().split('T')[0]}`);

    if (summary.failed > 0) {
      console.error('⚠️  Failed users:', summary.failedUsers.map(u => u.userId).join(', '));
    }

    return {
      success: true,
      summary,
    };
  } catch (error) {
    console.error('❌ Error in monthly KPI snapshot job:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  storeMonthlyKPISnapshots,
};
