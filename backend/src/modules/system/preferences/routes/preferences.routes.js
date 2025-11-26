const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const preferencesController = require('../controllers/preferences.controller');

// All routes require authentication
router.use(authenticate);

// Get all preferences for current user
router.get('/', preferencesController.getAllPreferences);

// Get specific preference
router.get('/:key', preferencesController.getPreference);

// Set specific preference
router.put('/:key', preferencesController.setPreference);

// Bulk set preferences
router.post('/bulk', preferencesController.setPreferences);

// Delete preference
router.delete('/:key', preferencesController.deletePreference);

module.exports = router;
