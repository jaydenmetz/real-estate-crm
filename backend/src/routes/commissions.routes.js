const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const commissionsController = require('../controllers/commissions.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

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
router.get('/stats', commissionsController.getStats);
router.get('/', commissionsController.getCommissions);
router.get('/:id', commissionsController.getCommission);
router.post('/', createValidation, validate, commissionsController.createCommission);
router.put('/:id', updateValidation, validate, commissionsController.updateCommission);
router.patch('/:id/status', statusUpdateValidation, validate, commissionsController.updateStatus);
router.delete('/:id', commissionsController.deleteCommission);

module.exports = router;