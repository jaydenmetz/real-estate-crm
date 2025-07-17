const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const commissionsController = require('../controllers/commissions.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const handleValidationErrors = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('escrowId').notEmpty().withMessage('Escrow ID is required'),
  body('escrowNumber').notEmpty().withMessage('Escrow number is required'),
  body('propertyAddress').notEmpty().withMessage('Property address is required'),
  body('transactionType').isIn(['Sale', 'Lease']).withMessage('Invalid transaction type'),
  body('side').isIn(['Listing', 'Buyer', 'Both']).withMessage('Invalid side'),
  body('agentId').notEmpty().withMessage('Agent ID is required'),
  body('agentName').notEmpty().withMessage('Agent name is required'),
  body('salePrice').isNumeric().withMessage('Sale price must be a number'),
  body('commissionRate').isNumeric().withMessage('Commission rate must be a number'),
  body('brokerageSplit').isInt({ min: 0, max: 100 }).withMessage('Brokerage split must be between 0 and 100')
];

const updateValidation = [
  body('salePrice').optional().isNumeric(),
  body('commissionRate').optional().isNumeric(),
  body('brokerageSplit').optional().isInt({ min: 0, max: 100 }),
  body('status').optional().isIn(['Pending', 'Processing', 'Paid', 'Cancelled']),
  body('referralFee').optional().isNumeric(),
  body('transactionFee').optional().isNumeric()
];

const statusUpdateValidation = [
  body('status').isIn(['Pending', 'Processing', 'Paid', 'Cancelled']).withMessage('Invalid status'),
  body('paymentDetails.payoutDate').optional().isISO8601(),
  body('paymentDetails.checkNumber').optional().notEmpty(),
  body('paymentDetails.depositAccount').optional().notEmpty()
];

// Routes
router.get('/stats', requirePermission('commissions'), commissionsController.getStats);
router.get('/', requirePermission('commissions'), commissionsController.getCommissions);
router.get('/:id', requirePermission('commissions'), commissionsController.getCommission);
router.post('/', requirePermission('commissions'), createValidation, handleValidationErrors, commissionsController.createCommission);
router.put('/:id', requirePermission('commissions'), updateValidation, handleValidationErrors, commissionsController.updateCommission);
router.patch('/:id/status', requirePermission('commissions'), statusUpdateValidation, handleValidationErrors, commissionsController.updateStatus);
router.delete('/:id', requirePermission('commissions'), commissionsController.deleteCommission);

module.exports = router;