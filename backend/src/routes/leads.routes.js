const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const leadsController = require('../controllers/leads.controller');
const { authenticate } = require('../middleware/apiKey.middleware');
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
router.get('/', leadsController.getLeads);
router.get('/:id', leadsController.getLead);
router.post('/', createValidation, validate, leadsController.createLead);
router.put('/:id', updateValidation, validate, leadsController.updateLead);
router.post('/:id/convert', leadsController.convertToClient);
router.post('/:id/activities', leadsController.recordActivity);

// Archive and Delete endpoints - Added for health dashboard testing
// Archive endpoint: Soft deletes by setting status to 'archived'
router.put('/:id/archive', leadsController.archiveLead);
// Delete endpoint: Hard delete
router.delete('/:id', leadsController.deleteLead);
// Batch delete endpoint: Delete multiple archived leads
router.post('/batch-delete',
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
  body('ids.*').isString().withMessage('Each ID must be a string'),
  validate,
  leadsController.batchDeleteLeads
);

module.exports = router;