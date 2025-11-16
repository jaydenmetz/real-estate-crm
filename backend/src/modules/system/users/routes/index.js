const express = require('express');

const router = express.Router();

// User profile routes
router.use('/profiles', require('./profiles.routes'));

// User settings routes
router.use('/settings', require('./settings.routes'));

module.exports = router;
