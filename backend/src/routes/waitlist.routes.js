const express = require('express');
const router = express.Router();
const WaitlistController = require('../controllers/waitlist.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// DEBUG: Log what we received from the controller
console.log('🔍 [WAITLIST ROUTES] WaitlistController type:', typeof WaitlistController);
console.log('🔍 [WAITLIST ROUTES] WaitlistController.addToWaitlist type:', typeof WaitlistController.addToWaitlist);
console.log('🔍 [WAITLIST ROUTES] WaitlistController.checkUsername type:', typeof WaitlistController.checkUsername);
console.log('🔍 [WAITLIST ROUTES] WaitlistController.getWaitlist type:', typeof WaitlistController.getWaitlist);
console.log('🔍 [WAITLIST ROUTES] authenticate type:', typeof authenticate);
console.log('🔍 [WAITLIST ROUTES] requireRole type:', typeof requireRole);

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
console.log('🔍 [WAITLIST ROUTES] Registering POST / with handler type:', typeof WaitlistController.addToWaitlist);
router.post('/', WaitlistController.addToWaitlist);

console.log('🔍 [WAITLIST ROUTES] Registering GET /check-username/:username with handler type:', typeof WaitlistController.checkUsername);
router.get('/check-username/:username', WaitlistController.checkUsername);

// Admin routes
console.log('🔍 [WAITLIST ROUTES] Registering GET /admin with handler type:', typeof WaitlistController.getWaitlist);
router.get(
  '/admin',
  authenticate,
  requireRole('system_admin'),
  WaitlistController.getWaitlist
);

module.exports = router;
