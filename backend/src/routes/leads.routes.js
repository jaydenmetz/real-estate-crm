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
  body('email').notEmpty().isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('source').notEmpty().withMessage('Lead source is required'),
  body('type').isIn(['Buyer', 'Seller', 'Investor', 'Renter']).withMessage('Invalid lead type')
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('type').optional().isIn(['Buyer', 'Seller', 'Investor', 'Renter']),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Nurturing', 'Converted', 'Lost'])
];

// Routes
router.get('/stats', requirePermission('leads'), leadsController.getStats);
router.get('/hot', requirePermission('leads'), leadsController.getHotLeads);
router.get('/', requirePermission('leads'), leadsController.getLeads);
router.get('/:id', requirePermission('leads'), leadsController.getLead);
router.post('/', requirePermission('leads'), createValidation, handleValidationErrors, leadsController.createLead);
router.put('/:id', requirePermission('leads'), updateValidation, handleValidationErrors, leadsController.updateLead);
router.delete('/:id', requirePermission('leads'), leadsController.deleteLead);

// Lead management endpoints
router.post('/:id/convert', requirePermission('leads'), [
  body('clientType').isIn(['Buyer', 'Seller', 'Past Client']).withMessage('Invalid client type')
], handleValidationErrors, leadsController.convertLead);

router.post('/:id/activity', requirePermission('leads'), [
  body('type').notEmpty().withMessage('Activity type is required'),
  body('subject').notEmpty().withMessage('Subject is required')
], handleValidationErrors, leadsController.logActivity);

router.patch('/:id/status', requirePermission('leads'), [
  body('status').isIn(['New', 'Contacted', 'Qualified', 'Nurturing', 'Converted', 'Lost']).withMessage('Invalid status')
], handleValidationErrors, leadsController.updateStatus);

router.patch('/:id/score', requirePermission('leads'), [
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('reason').notEmpty().withMessage('Reason is required')
], handleValidationErrors, leadsController.updateScore);

module.exports = router;