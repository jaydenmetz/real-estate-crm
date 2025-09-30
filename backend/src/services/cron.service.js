// backend/src/services/cron.service.js
const cron = require('node-cron');
const logger = require('../utils/logger');

module.exports = {
  start: () => {
    // Placeholder for future cron jobs
    logger.info('✅ Cron service initialized (no active jobs)');
  }
};