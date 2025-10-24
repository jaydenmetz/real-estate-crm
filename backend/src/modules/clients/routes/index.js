const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const clientsController = require('../controllers/clients.controller');
const { authenticate } = require('../../../middleware/apiKey.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const {
  canAccessScope,
  requireOwnership,
  requireModifyPermission,
  requireDeletePermission
} = require('../../../middleware/authorization.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('clientType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor', 'Referral', 'buyer', 'seller', 'both', 'investor', 'referral']),
  body('phone').optional().isString().withMessage('Invalid phone number'),
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('clientType').optional().isIn(['Buyer', 'Seller', 'Both', 'Investor', 'Referral', 'buyer', 'seller', 'both', 'investor', 'referral']),
  body('status').optional().isIn(['active', 'inactive', 'archived']),
];

// Routes with Phase 2 authorization
router.get('/', canAccessScope, clientsController.getAllClients);
router.get('/:id', requireOwnership('client'), clientsController.getClientById);
router.post('/', createValidation, validate, clientsController.createClient);
router.put('/:id', updateValidation, validate, requireModifyPermission('client'), clientsController.updateClient);

// Archive and Delete endpoints
router.put('/:id/archive', requireModifyPermission('client'), clientsController.archiveClient);
router.delete('/:id', requireDeletePermission('client'), clientsController.deleteClient);
// Batch delete endpoint: Delete multiple archived clients
router.post(
  '/batch-delete',
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
  body('ids.*').isString().withMessage('Each ID must be a string'),
  validate,
  clientsController.batchDeleteClients,
);

router.post('/:id/notes', clientsController.addNote);
router.patch('/:id/tags', clientsController.bulkUpdateTags);

module.exports = router;
