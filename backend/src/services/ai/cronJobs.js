const cron = require('node-cron');
const logger = require('../../utils/logger');
const alexService = require('./alex.service');
const buyerManager = require('./buyerManager.service');
const listingManager = require('./listingManager.service');
const operationsManager = require('./operationsManager.service');

function startCronJobs() {
  // Alex - Daily briefing at 7 AM
  cron.schedule('0 7 * * *', async () => {
    if (alexService.isEnabled()) {
      logger.info('Running daily briefing...');
      try {
        await alexService.generateDailyBriefing();
      } catch (error) {
        logger.error('Daily briefing failed:', error);
      }
    }
  });

  // Alex - Mid-day check at 12 PM
  cron.schedule('0 12 * * *', async () => {
    if (alexService.isEnabled()) {
      logger.info('Running mid-day priority check...');
      try {
        await alexService.midDayCheck();
      } catch (error) {
        logger.error('Mid-day check failed:', error);
      }
    }
  });

  // Alex - EOD summary at 5 PM
  cron.schedule('0 17 * * *', async () => {
    if (alexService.isEnabled()) {
      logger.info('Running EOD summary...');
      try {
        await alexService.generateEODSummary();
      } catch (error) {
        logger.error('EOD summary failed:', error);
      }
    }
  });

  // Manager status checks every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    logger.info('Running manager status checks...');
    
    const managers = [buyerManager, listingManager, operationsManager];
    
    for (const manager of managers) {
      if (manager.isEnabled()) {
        try {
          await manager.performStatusCheck();
        } catch (error) {
          logger.error(`${manager.name} status check failed:`, error);
        }
      }
    }
  });

  // Transaction deadline monitor - every hour
  cron.schedule('0 * * * *', async () => {
    if (operationsManager.isEnabled()) {
      logger.info('Checking transaction deadlines...');
      try {
        await operationsManager.checkDeadlines();
      } catch (error) {
        logger.error('Deadline check failed:', error);
      }
    }
  });

  logger.info('Cron jobs initialized');
}

module.exports = { startCronJobs };