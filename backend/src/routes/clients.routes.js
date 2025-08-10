
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
  body('clientType').isIn(['Buyer', 'Seller', 'Both', 'Investor', 'Referral']),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number')
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('clientType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor', 'Referral']),
  body('clientStatus').optional().isIn(['Active', 'Past Client', 'Prospect', 'Archived'])
];

// Routes
router.get('/', requirePermission('clients'), clientsController.getClients);
router.get('/:id', requirePermission('clients'), clientsController.getClient);
router.post('/', requirePermission('clients'), createValidation, handleValidationErrors, clientsController.createClient);
router.put('/:id', requirePermission('clients'), updateValidation, handleValidationErrors, clientsController.updateClient);
router.delete('/:id', requirePermission('clients'), clientsController.deleteClient);
router.post('/:id/notes', requirePermission('clients'), clientsController.addNote);
router.patch('/:id/tags', requirePermission('clients'), clientsController.bulkUpdateTags);

module.exports = router;