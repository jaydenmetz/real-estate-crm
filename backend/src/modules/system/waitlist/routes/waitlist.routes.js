const express = require('express');
const router = express.Router();
const WaitlistController = require('../controllers/waitlist.controller');
const { authenticate, requireRole } = require('../../../../middleware/auth/auth.middleware');

/**
 * Waitlist Routes
 *
 * PUBLIC routes (no auth required):
 * - POST /api/v1/waitlist - Join waitlist
 * - GET /api/v1/waitlist/check-username/:username - Check username availability
 *
 * ADMIN routes (system_admin only):
 * - GET /api/v1/waitlist/admin - View all waitlist entries
 */

// Public routes
router.post('/', WaitlistController.addToWaitlist);
router.get('/check-username/:username', WaitlistController.checkUsername);

// Admin routes
router.get(
  '/admin',
  authenticate,
  requireRole('system_admin'),
  WaitlistController.getWaitlist
);

module.exports = router;
