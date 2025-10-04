const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'system_admin' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    });
  }
  next();
};

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Admin endpoints
router.get('/database-stats', AdminController.getDatabaseStats);
router.get('/users', AdminController.getAllUsers);
router.get('/api-keys', AdminController.getAllApiKeys);
router.get('/security-events', AdminController.getSecurityEvents);
router.get('/refresh-tokens', AdminController.getRefreshTokens);
router.get('/audit-logs', AdminController.getAuditLogs);

module.exports = router;
