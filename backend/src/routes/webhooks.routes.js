// backend/src/routes/webhooks.routes.js

const express = require('express');
const router = express.Router();
const webhooksController = require('../controllers/webhooks.controller');

/**
 * Webhook endpoints - no authentication (public endpoints handled via service-level security).
 */

// Handle incoming SMS from Twilio
router.post('/sms', webhooksController.handleSmsWebhook);

// Handle inbound emails (e.g. AWS SES)
router.post('/email', webhooksController.handleEmailWebhook);

// Generic notification webhook
router.post('/notifications', webhooksController.handleNotificationWebhook);

module.exports = router;
