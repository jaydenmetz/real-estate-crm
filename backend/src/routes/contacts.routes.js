const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Contact routes
router.get('/', contactsController.list);
router.get('/:id', contactsController.getById);
router.post('/', contactsController.create);
router.put('/:id', contactsController.update);
router.patch('/:id/archive', contactsController.archive);
router.patch('/:id/unarchive', contactsController.unarchive);
router.delete('/:id', contactsController.delete);

module.exports = router;