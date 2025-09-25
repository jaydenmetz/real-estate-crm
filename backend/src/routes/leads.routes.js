const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const leadsController = require('../controllers/leads.controller.simple');
const { authenticate } = require('../middleware/apiKey.middleware');
const { requirePermission } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('leadSource').optional().isString().withMessage('Lead source is required'),
  body('leadType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor', 'buyer', 'seller', 'both', 'investor']),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isString().withMessage('Invalid phone number')
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('leadType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor', 'buyer', 'seller', 'both', 'investor']),
  body('status').optional().isString()
];

// Routes
router.get('/', requirePermission('leads'), leadsController.getLeads);
router.get('/:id', requirePermission('leads'), leadsController.getLead);
router.post('/', requirePermission('leads'), createValidation, validate, leadsController.createLead);
router.put('/:id', requirePermission('leads'), updateValidation, validate, leadsController.updateLead);
router.post('/:id/convert', requirePermission('leads'), leadsController.convertToClient);
router.post('/:id/activities', requirePermission('leads'), leadsController.recordActivity);

// Archive and Delete endpoints - Added for health dashboard testing
// Archive endpoint: Soft deletes by setting status to 'archived'
router.put('/:id/archive', requirePermission('leads'), leadsController.archiveLead);
// Delete endpoint: Hard delete
router.delete('/:id', requirePermission('leads'), leadsController.deleteLead);

module.exports = router;