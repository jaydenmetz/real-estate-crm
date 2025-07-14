const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const EscrowController = require('../controllers/escrowController');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { teamContext } = require('../middleware/team.middleware');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Validation rules
const escrowValidation = {
  create: [
    body('address').isObject().withMessage('Address must be an object'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters'),
    body('address.zipCode').matches(/^\d{5}(-\d{4})?$/).withMessage('Invalid zip code'),
    body('purchase_price').isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
    body('property_type').isIn(['single_family', 'condo', 'townhouse', 'multi_family', 'land', 'commercial'])
      .withMessage('Invalid property type'),
    body('closing_date').isISO8601().withMessage('Closing date must be a valid date'),
    body('parties').optional().isArray().withMessage('Parties must be an array'),
    body('parties.*.party_type').isIn(['buyer', 'seller', 'buyer_agent', 'seller_agent'])
      .withMessage('Invalid party type'),
    body('parties.*.name').notEmpty().withMessage('Party name is required'),
    body('parties.*.email').optional().isEmail().withMessage('Invalid email')
  ],
  update: [
    param('escrowId').notEmpty().withMessage('Escrow ID is required'),
    body('address').optional().isObject().withMessage('Address must be an object'),
    body('purchase_price').optional().isFloat({ min: 0 }).withMessage('Purchase price must be positive'),
    body('status').optional().isIn(['active', 'pending', 'closed', 'cancelled', 'archived'])
      .withMessage('Invalid status'),
    body('stage').optional().notEmpty().withMessage('Stage cannot be empty'),
    body('closing_date').optional().isISO8601().withMessage('Closing date must be a valid date')
  ],
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('status').optional().matches(/^[a-z,]+$/).withMessage('Invalid status format'),
    query('min_price').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
    query('max_price').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
    query('closing_date_min').optional().isISO8601().withMessage('Invalid date format'),
    query('closing_date_max').optional().isISO8601().withMessage('Invalid date format')
  ],
  batch: [
    body('operations').isArray({ min: 1, max: 100 }).withMessage('Operations must be array (1-100 items)'),
    body('operations.*.method').isIn(['create', 'update', 'delete']).withMessage('Invalid operation method'),
    body('operations.*.data').optional().isObject().withMessage('Operation data must be object')
  ]
};

// Apply authentication and team context to all routes
router.use(authenticate);
router.use(teamContext);

// Routes with team context
router.get(
  '/teams/:teamId/escrows',
  requirePermission('escrows', 'read'),
  escrowValidation.list,
  EscrowController.getAll
);

router.get(
  '/teams/:teamId/escrows/stats',
  requirePermission('escrows', 'read'),
  EscrowController.getStats
);

router.get(
  '/teams/:teamId/escrows/:escrowId',
  requirePermission('escrows', 'read'),
  EscrowController.getById
);

router.post(
  '/teams/:teamId/escrows',
  requirePermission('escrows', 'create'),
  escrowValidation.create,
  EscrowController.create
);

router.post(
  '/teams/:teamId/escrows/batch',
  requirePermission('escrows', 'create'),
  escrowValidation.batch,
  EscrowController.batch
);

router.post(
  '/teams/:teamId/escrows/parse-rpa',
  requirePermission('escrows', 'create'),
  upload.single('rpa'),
  EscrowController.parseRPA
);

router.put(
  '/teams/:teamId/escrows/:escrowId',
  requirePermission('escrows', 'update'),
  escrowValidation.update,
  EscrowController.update
);

router.patch(
  '/teams/:teamId/escrows/:escrowId/checklist/:itemKey',
  requirePermission('escrows', 'update'),
  [
    param('itemKey').notEmpty().withMessage('Item key is required'),
    body('is_completed').isBoolean().withMessage('is_completed must be boolean'),
    body('notes').optional().isString().withMessage('Notes must be string')
  ],
  EscrowController.updateChecklistItem
);

router.delete(
  '/teams/:teamId/escrows/:escrowId',
  requirePermission('escrows', 'delete'),
  EscrowController.delete
);

// Timeline and document endpoints
router.post(
  '/teams/:teamId/escrows/:escrowId/timeline',
  requirePermission('escrows', 'update'),
  [
    body('event_type').notEmpty().withMessage('Event type is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('event_date').isISO8601().withMessage('Event date must be valid')
  ],
  EscrowController.addTimelineEvent
);

router.post(
  '/teams/:teamId/escrows/:escrowId/documents',
  requirePermission('escrows', 'update'),
  upload.single('document'),
  [
    body('document_type').notEmpty().withMessage('Document type is required'),
    body('name').notEmpty().withMessage('Document name is required')
  ],
  EscrowController.uploadDocument
);

module.exports = router;