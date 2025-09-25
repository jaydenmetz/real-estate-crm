
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const clientsController = require('../controllers/clients.controller.simple');
const { authenticate } = require('../middleware/apiKey.middleware');
const { validate } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('clientType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor', 'Referral']),
  body('phone').optional().isString().withMessage('Invalid phone number')
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('clientType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor', 'Referral']),
  body('status').optional().isIn(['active', 'inactive', 'archived'])
];

// Routes (removed requirePermission middleware that doesn't exist)
router.get('/', clientsController.getAllClients);
router.get('/:id', clientsController.getClientById);
router.post('/', createValidation, validate, clientsController.createClient);
router.put('/:id', updateValidation, validate, clientsController.updateClient);

// Archive and Delete endpoints - Added for health dashboard testing
// Archive endpoint: Soft deletes by setting status to 'archived'
router.put('/:id/archive', clientsController.archiveClient);
// Delete endpoint: Hard delete - only works if client is already archived
router.delete('/:id', clientsController.deleteClient);

router.post('/:id/notes', clientsController.addNote);
router.patch('/:id/tags', clientsController.bulkUpdateTags);

module.exports = router;