// backend/src/routes/communications.routes.js
const express = require('express');
const router = express.Router();

// You’ll need a controller that actually handles communications:
const communicationsController = require('../controllers/communications.controller');

// Example CRUD endpoints
router.get('/',   communicationsController.list);
router.post('/',  communicationsController.create);
router.get('/:id',communicationsController.get);
router.put('/:id',communicationsController.update);
router.delete('/:id', communicationsController.remove);

module.exports = router;