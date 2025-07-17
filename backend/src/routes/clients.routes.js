
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const clientsController = require('../controllers/clients.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const handleValidationErrors = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('clientType').isIn(['Buyer', 'Seller', 'Lead', 'Past Client']).withMessage('Invalid client type'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number')
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('clientType').optional().isIn(['Buyer', 'Seller', 'Lead', 'Past Client']),
  body('status').optional().isIn(['New', 'Active', 'Hot Lead', 'Inactive', 'Archived'])
];

// Routes
router.get('/stats', requirePermission('clients'), clientsController.getStats);
router.get('/', requirePermission('clients'), clientsController.getClients);
router.get('/:id', requirePermission('clients'), clientsController.getClient);
router.post('/', requirePermission('clients'), createValidation, handleValidationErrors, clientsController.createClient);
router.put('/:id', requirePermission('clients'), updateValidation, handleValidationErrors, clientsController.updateClient);
router.delete('/:id', requirePermission('clients'), clientsController.deleteClient);

// Communication and status endpoints
router.post('/:id/communication', requirePermission('clients'), [
  body('type').isIn(['Email', 'Phone', 'Text', 'In-Person', 'Other']).withMessage('Invalid communication type'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('notes').notEmpty().withMessage('Notes are required')
], handleValidationErrors, clientsController.logCommunication);

router.patch('/:id/status', requirePermission('clients'), [
  body('status').isIn(['New', 'Active', 'Hot Lead', 'Inactive', 'Archived']).withMessage('Invalid status')
], handleValidationErrors, clientsController.updateStatus);

// Tag management
router.post('/:id/tags', requirePermission('clients'), [
  body('tag').notEmpty().withMessage('Tag is required')
], handleValidationErrors, clientsController.addTag);

router.delete('/:id/tags/:tag', requirePermission('clients'), clientsController.removeTag);

module.exports = router;