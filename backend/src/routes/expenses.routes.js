const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const expensesController = require('../controllers/expenses.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('category').notEmpty().withMessage('Category is required'),
  body('subcategory').notEmpty().withMessage('Subcategory is required'),
  body('vendor').notEmpty().withMessage('Vendor is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('taxDeductible').optional().isBoolean(),
  body('tags').optional().isArray(),
  body('mileage.start').optional().isNumeric(),
  body('mileage.end').optional().isNumeric(),
  body('mileage.rate').optional().isNumeric(),
];

const updateValidation = [
  body('category').optional().notEmpty(),
  body('subcategory').optional().notEmpty(),
  body('vendor').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('amount').optional().isNumeric().isFloat({ gt: 0 }),
  body('date').optional().isISO8601(),
  body('paymentMethod').optional().notEmpty(),
  body('taxDeductible').optional().isBoolean(),
  body('status').optional().isIn(['Pending', 'Paid', 'Approved', 'Rejected']),
];

const receiptValidation = [
  body('filename').notEmpty().withMessage('Filename is required'),
  body('url').notEmpty().withMessage('URL is required'),
];

const reportValidation = [
  body('year').optional().isInt({ min: 2000, max: 2100 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('category').optional().notEmpty(),
  body('taxDeductible').optional().isBoolean(),
];

// Routes
router.get('/stats', expensesController.getStats);
router.get('/categories', expensesController.getCategories);
router.get('/', expensesController.getExpenses);
router.get('/:id', expensesController.getExpense);
router.post('/', createValidation, validate, expensesController.createExpense);
router.post('/report', reportValidation, validate, expensesController.generateReport);
router.put('/:id', updateValidation, validate, expensesController.updateExpense);
router.post('/:id/receipt', receiptValidation, validate, expensesController.uploadReceipt);
router.patch('/:id/approve', expensesController.approveExpense);
router.delete('/:id', expensesController.deleteExpense);

module.exports = router;
