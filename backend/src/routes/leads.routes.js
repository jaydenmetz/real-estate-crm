const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const leadsController = require('../controllers/leads.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const handleValidationErrors = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('leadSource').notEmpty().withMessage('Lead source is required'),
  body('leadType').isIn(['Buyer', 'Seller', 'Both', 'Investor']),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number')
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('leadType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor']),
  body('leadStatus').optional().isIn(['New', 'Contacted', 'Qualified', 'Nurture', 'Appointment Set', 'Met', 'Converted', 'Lost'])
];

// Routes
router.get('/', requirePermission('leads'), leadsController.getLeads);
router.get('/:id', requirePermission('leads'), leadsController.getLead);
router.post('/', requirePermission('leads'), createValidation, handleValidationErrors, leadsController.createLead);
router.put('/:id', requirePermission('leads'), updateValidation, handleValidationErrors, leadsController.updateLead);
router.post('/:id/convert', requirePermission('leads'), leadsController.convertLead);
router.post('/:id/activities', requirePermission('leads'), leadsController.logActivity);

module.exports = router;