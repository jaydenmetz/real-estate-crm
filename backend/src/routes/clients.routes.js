
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const clientsController = require('../controllers/clients.controller');
const { authenticateAny } = require('../middleware/combinedAuth.middleware');
const { validate } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticateAny);

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

// Routes (removed requirePermission middleware that doesn't exist)
router.get('/', clientsController.getClients);
router.get('/:id', clientsController.getClient);
router.post('/', createValidation, validate, clientsController.createClient);
router.put('/:id', updateValidation, validate, clientsController.updateClient);
router.delete('/:id', clientsController.deleteClient);
router.post('/:id/notes', clientsController.addNote);
router.patch('/:id/tags', clientsController.bulkUpdateTags);

module.exports = router;