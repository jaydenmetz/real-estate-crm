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

  // Buyer nurture cycle every day at 8 AM
  cron.schedule('0 8 * * *', async () => {
    if (buyerManager.isEnabled()) {
      logger.info('Running buyer nurture cycle...');
      try {
        await buyerManager.runNurtureCycle();
      } catch (error) {
        logger.error('Buyer nurture cycle failed:', error);
      }
    }
  });

  // Listing marketing cycle every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    if (listingManager.isEnabled()) {
      logger.info('Running listing marketing cycle...');
      try {
        await listingManager.runMarketingCycle();
      } catch (error) {
        logger.error('Listing marketing cycle failed:', error);
      }
    }
  });

  // Daily operations (buyer, listing, transaction reminders) at midnight
  cron.schedule('0 0 * * *', async () => {
    if (operationsManager.isEnabled()) {
      logger.info('Running daily operations...');
      try {
        await operationsManager.runDailyOperations();
      } catch (error) {
        logger.error('Daily operations failed:', error);
      }
    }
  });

  // Transaction reminder monitor - every hour
  cron.schedule('0 * * * *', async () => {
    if (operationsManager.isEnabled()) {
      logger.info('Processing transaction reminders...');
      try {
        // transaction reminders are part of daily operations, but for hourly we can call:
        await operationsManager.runDailyOperations(); 
      } catch (error) {
        logger.error('Transaction reminder processing failed:', error);
      }
    }
  });

  logger.info('Cron jobs initialized');
}

module.exports = { startCronJobs };