const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const invoicesController = require('../controllers/invoices.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('type').isIn(['Commission', 'Service', 'Other']).withMessage('Invalid invoice type'),
  body('clientName').notEmpty().withMessage('Client name is required'),
  body('clientEmail').notEmpty().isEmail().withMessage('Valid client email is required'),
  body('clientPhone').notEmpty().withMessage('Client phone is required'),
  body('billingAddress.street').notEmpty().withMessage('Billing street address is required'),
  body('billingAddress.city').notEmpty().withMessage('Billing city is required'),
  body('billingAddress.state').notEmpty().withMessage('Billing state is required'),
  body('billingAddress.zipCode').notEmpty().withMessage('Billing zip code is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one invoice item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.amount').isNumeric().withMessage('Item amount must be a number'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format')
];

const updateValidation = [
  body('type').optional().isIn(['Commission', 'Service', 'Other']),
  body('clientEmail').optional().isEmail(),
  body('items').optional().isArray({ min: 1 }),
  body('items.*.amount').optional().isNumeric(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(['Pending', 'Paid', 'Overdue', 'Cancelled'])
];

const paymentValidation = [
  body('amount').isNumeric().isFloat({ gt: 0 }).withMessage('Payment amount must be positive'),
  body('method').notEmpty().withMessage('Payment method is required'),
  body('reference').optional().notEmpty(),
  body('date').optional().isISO8601()
];

// Routes
router.get('/stats', invoicesController.getStats);
router.get('/', invoicesController.getInvoices);
router.get('/:id', invoicesController.getInvoice);
router.get('/:id/download', invoicesController.downloadInvoice);
router.post('/', createValidation, validate, invoicesController.createInvoice);
router.put('/:id', updateValidation, validate, invoicesController.updateInvoice);
router.post('/:id/payment', paymentValidation, validate, invoicesController.recordPayment);
router.post('/:id/reminder', invoicesController.sendReminder);
router.delete('/:id', invoicesController.deleteInvoice);

module.exports = router;