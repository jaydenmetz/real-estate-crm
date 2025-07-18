const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const clientsController = require('../controllers/clients.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const handleValidationErrors = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('clientType').optional().isIn(['Buyer', 'Seller', 'Both', 'Past Client']).withMessage('Invalid client type'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('status').optional().isIn(['Active', 'Inactive', 'Archived']).withMessage('Invalid status'),
  body('sendWelcomeEmail').optional().isBoolean()
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('clientType').optional().isIn(['Buyer', 'Seller', 'Both', 'Past Client']),
  body('status').optional().isIn(['Active', 'Inactive', 'Archived']),
  body('phone').optional().isMobilePhone('any')
];

const communicationValidation = [
  body('type').isIn(['Email', 'Phone', 'Text', 'Meeting', 'Video Call', 'Other']).withMessage('Invalid communication type'),
  body('notes').notEmpty().withMessage('Notes are required'),
  body('direction').optional().isIn(['Inbound', 'Outbound']).withMessage('Invalid direction')
];

const statusValidation = [
  body('status').isIn(['Active', 'Inactive', 'Archived']).withMessage('Invalid status'),
  body('note').optional().isString()
];

const mergeValidation = [
  body('primaryClientId').notEmpty().withMessage('Primary client ID is required'),
  body('secondaryClientId').notEmpty().withMessage('Secondary client ID is required'),
  body('mergeStrategy').optional().isIn(['primary', 'secondary', 'newest']).withMessage('Invalid merge strategy')
];

const bulkUpdateValidation = [
  body('clientIds').isArray().withMessage('Client IDs must be an array'),
  body('clientIds.*').isMongoId().withMessage('Invalid client ID'),
  body('action').isIn(['add', 'remove', 'replace']).withMessage('Invalid action'),
  body('tags').isArray().withMessage('Tags must be an array')
];

const propertyLinkValidation = [
  body('propertyId').notEmpty().withMessage('Property ID is required'),
  body('relationshipType').isIn(['Interested', 'Viewed', 'Made Offer', 'Under Contract', 'Purchased', 'Sold', 'Rejected']).withMessage('Invalid relationship type'),
  body('notes').optional().isString()
];

const noteValidation = [
  body('content').notEmpty().withMessage('Note content is required'),
  body('category').optional().isString(),
  body('isPrivate').optional().isBoolean()
];

const convertToLeadValidation = [
  body('reason').optional().isString(),
  body('leadScore').optional().isInt({ min: 0, max: 100 }).withMessage('Lead score must be between 0 and 100')
];

// Main routes
router.get('/stats', requirePermission('clients'), clientsController.getStats);
router.get('/birthdays', requirePermission('clients'), clientsController.getUpcomingBirthdays);
router.get('/anniversaries', requirePermission('clients'), clientsController.getUpcomingAnniversaries);

router.get('/', requirePermission('clients'), [
  query('type').optional().isIn(['Buyer', 'Seller', 'Both', 'Past Client']),
  query('status').optional().isIn(['Active', 'Inactive', 'Archived']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['name', 'createdAt', 'lastContactDate', 'totalTransactionValue', 'transactionCount']),
  query('order').optional().isIn(['asc', 'desc'])
], handleValidationErrors, clientsController.getClients);

router.get('/:id', requirePermission('clients'), clientsController.getClient);
router.get('/:id/stats', requirePermission('clients'), clientsController.getClientStats);
router.get('/:id/export', requirePermission('clients'), clientsController.exportClientData);

router.post('/', requirePermission('clients'), createValidation, handleValidationErrors, clientsController.createClient);
router.post('/merge', requirePermission('clients'), mergeValidation, handleValidationErrors, clientsController.mergeClients);

router.put('/:id', requirePermission('clients'), updateValidation, handleValidationErrors, clientsController.updateClient);

router.patch('/:id/status', requirePermission('clients'), statusValidation, handleValidationErrors, clientsController.updateStatus);
router.patch('/:id/preferences', requirePermission('clients'), clientsController.updatePreferences);
router.patch('/bulk-update', requirePermission('clients'), bulkUpdateValidation, handleValidationErrors, clientsController.bulkUpdateTags);

router.delete('/:id', requirePermission('clients'), clientsController.deleteClient);

// Communication endpoints
router.post('/:id/communications', requirePermission('clients'), communicationValidation, handleValidationErrors, clientsController.addCommunicationLog);

// Property relationship endpoints
router.post('/:id/properties', requirePermission('clients'), propertyLinkValidation, handleValidationErrors, clientsController.linkToProperty);

// Note endpoints
router.post('/:id/notes', requirePermission('clients'), noteValidation, handleValidationErrors, clientsController.addNote);

// Tag management
router.post('/:id/tags', requirePermission('clients'), [
  body('tag').notEmpty().withMessage('Tag is required')
], handleValidationErrors, clientsController.addTag);

router.delete('/:id/tags/:tag', requirePermission('clients'), clientsController.removeTag);

// Lead conversion
router.post('/:id/convert-to-lead', requirePermission('clients'), convertToLeadValidation, handleValidationErrors, clientsController.convertToLead);

module.exports = router;