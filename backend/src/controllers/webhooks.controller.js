

// backend/src/controllers/webhooks.controller.js

const smsService = require('../services/sms.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * POST /v1/webhooks/sms
 * Handle incoming SMS webhook from Twilio.
 */
exports.handleSmsWebhook = async (req, res, next) => {
  try {
    // Twilio sends form-encoded data in req.body
    const smsData = req.body;
    await smsService.processIncomingSms(smsData);

    // Respond with empty TwiML to acknowledge receipt
    res.type('text/xml').send('<Response></Response>');
  } catch (error) {
    logger.error('Error handling SMS webhook', error);
    next(error);
  }
};

/**
 * POST /v1/webhooks/email
 * Handle inbound email webhook (e.g. AWS SES).
 */
exports.handleEmailWebhook = async (req, res, next) => {
  try {
    const emailData = req.body;
    await emailService.processIncomingEmail(emailData);

    // Acknowledge receipt
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error handling email webhook', error);
    next(error);
  }
};

/**
 * POST /v1/webhooks/notifications
 * Generic notification webhook (if needed).
 */
exports.handleNotificationWebhook = async (req, res, next) => {
  try {
    const notification = req.body;
    // You could route to a notification service here
    // await notificationService.process(notification);

    logger.info('Received generic webhook notification', notification);
    res.status(204).send();
  } catch (error) {
    logger.error('Error handling generic webhook', error);
    next(error);
  }
};