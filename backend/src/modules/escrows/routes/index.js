// backend/src/modules/escrows/routes/index.js
// Main routes aggregator - imports and mounts all modular route groups

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/apiKey.middleware');

// All routes require authentication
router.use(authenticate);

// Mount modular route groups
router.use('/', require('./dashboard'));           // Core CRUD operations
router.use('/', require('./details'));             // Detail views
router.use('/', require('./checklists'));          // Checklist operations
router.use('/', require('./people'));              // People management
router.use('/', require('./financials'));          // Financial data
router.use('/', require('./timeline'));            // Timeline events

module.exports = router;
