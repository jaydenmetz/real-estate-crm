// backend/src/services/cron.service.js
const cron = require('node-cron');
const logger = require('../utils/logger');
const backupService = require('./backup.service');

module.exports = {
  start: () => {
    // Daily backup at 2 AM Pacific Time
    cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('🔄 Starting scheduled daily backup...');
        const result = await backupService.createBackup();
        logger.info(`✅ Daily backup completed: ${result.filename} (${result.size} MB)`);
      } catch (error) {
        logger.error('❌ Daily backup failed:', error);
      }
    }, {
      timezone: 'America/Los_Angeles'
    });

    // Backup status check every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      try {
        const status = await backupService.getBackupStatus();
        if (status.status === 'critical') {
          logger.warn(`⚠️ BACKUP WARNING: ${status.message}`);
        }
      } catch (error) {
        logger.error('Failed to check backup status:', error);
      }
    });

    logger.info('✅ Cron jobs initialized:');
    logger.info('  - Daily backup at 2:00 AM PT');
    logger.info('  - Backup status check every 6 hours');
  }
};