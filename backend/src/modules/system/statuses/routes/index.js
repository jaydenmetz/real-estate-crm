const express = require('express');

const router = express.Router();

// Status routes
router.use('/', require('./statuses.routes'));

module.exports = router;
