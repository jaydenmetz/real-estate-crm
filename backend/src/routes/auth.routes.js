const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh); // Refresh access token (uses httpOnly cookie)

// Protected routes (require JWT authentication)
router.get('/verify', authenticate, AuthController.getProfile); // Verify token endpoint
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/logout', AuthController.logout); // No auth required (uses cookie)
router.post('/logout-all', authenticate, AuthController.logoutAll); // Logout from all devices
router.get('/sessions', authenticate, AuthController.getSessions); // List active sessions

// Export for backward compatibility
const authenticateToken = authenticate;

module.exports = { router, authenticateToken };