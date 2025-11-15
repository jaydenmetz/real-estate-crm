const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const webhooksController = require('../controllers/webhooks.controller');
const { authenticate, requireRole } = require('../../../../middleware/auth.middleware');
const { validate } = require('../../../../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const registerValidation = [
  body('url').isURL().withMessage('Valid URL required'),
  body('events').isArray().withMessage('Events must be an array'),
  body('secret').isLength({ min: 10 }).withMessage('Secret must be at least 10 characters'),
];

// Routes
router.get('/', requireRole('master', 'executive'), webhooksController.getWebhooks);
router.post('/', requireRole('master', 'executive'), registerValidation, validate, webhooksController.register);
router.delete('/:id', requireRole('master', 'executive'), webhooksController.deleteWebhook);

module.exports = router;
