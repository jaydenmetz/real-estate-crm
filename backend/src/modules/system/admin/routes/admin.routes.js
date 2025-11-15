const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../../../../middleware/auth.middleware');

// SECURITY: All admin routes require authentication and system_admin role
// Using standard requireRole middleware instead of custom requireAdmin
router.use(authenticate);
router.use(requireRole('system_admin'));

// Admin endpoints
router.get('/database-stats', AdminController.getDatabaseStats);
router.get('/users', AdminController.getAllUsers);
router.get('/api-keys', AdminController.getAllApiKeys);
router.get('/security-events', AdminController.getSecurityEvents);
router.get('/refresh-tokens', AdminController.getRefreshTokens);
router.get('/audit-logs', AdminController.getAuditLogs);

// Table CRUD operations
router.get('/table/:tableName', AdminController.getTableData);
router.post('/table/:tableName', AdminController.createRow);
router.delete('/table/:tableName/rows', AdminController.deleteRows);
router.delete('/table/:tableName/all', AdminController.deleteAllRows);

module.exports = router;
