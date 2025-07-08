// backend/src/services/cron.service.js
const cron = require('node-cron');

module.exports = {
  start: () => {
    // e.g. cron.schedule('0 * * * *', () => { /* your job */ });
    console.log('Cron jobs initialized');
  }
};