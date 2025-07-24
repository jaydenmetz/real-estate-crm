const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.get('/test', AuthController.test);
router.post('/simple-login', AuthController.simpleLogin);
router.post('/debug-login', AuthController.debugLogin);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/verify', authenticate, AuthController.getProfile); // Verify token endpoint
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/logout', authenticate, AuthController.logout);

// Export for backward compatibility
const authenticateToken = authenticate;

module.exports = { router, authenticateToken };