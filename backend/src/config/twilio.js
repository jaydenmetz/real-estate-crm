// backend/src/config/twilio.js
const twilio = require('twilio');

// Initialize from environment
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = client;