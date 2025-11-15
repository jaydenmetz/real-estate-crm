const express = require('express');

const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../../../../middleware/auth/auth.middleware');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleSignIn); // Google OAuth sign-in
router.post('/refresh', AuthController.refresh); // Refresh access token (uses httpOnly cookie)
router.get('/check-username/:username', AuthController.checkUsername); // Check username availability

// Protected routes (require JWT authentication)
router.get('/verify', authenticate, AuthController.getProfile); // Verify token endpoint
router.get('/verify-role', authenticate, AuthController.verifyRole); // PHASE 3.5: Verify user role (server-side)
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/logout', AuthController.logout); // No auth required (uses cookie)
router.post('/logout-all', authenticate, AuthController.logoutAll); // Logout from all devices
router.get('/sessions', authenticate, AuthController.getSessions); // List active sessions
router.post('/cleanup-tokens', AuthController.cleanupExpiredTokens); // Cleanup expired refresh tokens (cron job endpoint)

// Export for backward compatibility
const authenticateToken = authenticate;

module.exports = { router, authenticateToken };
