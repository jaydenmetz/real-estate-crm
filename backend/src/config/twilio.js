// backend/src/config/twilio.js
const twilio = require('twilio');

// Only initialize if credentials are available
let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} else {
  console.warn('Twilio credentials not found. SMS functionality will be disabled.');
}

module.exports = client;