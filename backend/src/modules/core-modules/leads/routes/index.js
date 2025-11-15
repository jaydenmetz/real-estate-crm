const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const leadsController = require('../controllers');
const { authenticate } = require('../../../middleware/apiKey.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const { validateLeadRules } = require('../../../middleware/businessRules.middleware');
const {
  canAccessScope,
  requireOwnership,
  requireModifyPermission,
  requireDeletePermission
} = require('../../../middleware/authorization.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('leadSource').optional().isString().withMessage('Lead source is required'),
  body('leadType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor', 'buyer', 'seller', 'both', 'investor']),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isString().withMessage('Invalid phone number'),
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('leadType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor', 'buyer', 'seller', 'both', 'investor']),
  body('status').optional().isString(),
];

// Routes with Phase 2 authorization + PRIVACY FILTERING
router.get('/', canAccessScope, leadsController.getLeads); // Filters out private leads for brokers
router.get('/:id', requireOwnership('lead'), leadsController.getLead); // Checks privacy
router.post('/', createValidation, validate, validateLeadRules, leadsController.createLead);
router.put('/:id', updateValidation, validate, requireModifyPermission('lead'), validateLeadRules, leadsController.updateLead);
router.post('/:id/convert', requireModifyPermission('lead'), leadsController.convertToClient);
router.post('/:id/activities', requireModifyPermission('lead'), leadsController.recordActivity);

// Archive and Delete endpoints
router.put('/:id/archive', requireModifyPermission('lead'), leadsController.archiveLead);
router.delete('/:id', requireDeletePermission('lead'), leadsController.deleteLead);
// Batch delete endpoint: Delete multiple archived leads
router.post(
  '/batch-delete',
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
  body('ids.*').isString().withMessage('Each ID must be a string'),
  validate,
  leadsController.batchDeleteLeads,
);

module.exports = router;
