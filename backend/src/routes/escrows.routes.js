// backend/src/routes/escrows.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const escrowsController = require('../controllers/escrows.controller');
const { authenticate } = require('../middleware/apiKey.middleware');
const { requirePermission } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

// All routes require authentication and escrows permission
router.use(authenticate);
router.use(requirePermission('escrows'));

// GET /v1/escrows?status&page&limit&minPrice&maxPrice&closingDateStart&closingDateEnd
router.get(
  '/',
  [
    query('status').optional().isString().withMessage('Status must be a string'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number').toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number').toFloat(),
    query('closingDateStart').optional().isISO8601().withMessage('Invalid closingDateStart format'),
    query('closingDateEnd').optional().isISO8601().withMessage('Invalid closingDateEnd format'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer').toInt(),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer').toInt()
  ],
  validationMiddleware,
  escrowsController.getEscrows
);

// GET /v1/escrows/:id
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrow
);

// POST /v1/escrows
router.post(
  '/',
  [
    // Support both camelCase and snake_case field names using oneOf
    body('propertyAddress').optional().notEmpty(),
    body('property_address').optional().notEmpty(),
    body('purchasePrice').optional().isNumeric(),
    body('purchase_price').optional().isNumeric(),
    body('buyers').optional().isArray({ min: 1 }),
    body('sellers').optional().isArray({ min: 1 }),
    body('acceptanceDate').optional().isISO8601(),
    body('acceptance_date').optional().isISO8601(),
    body('closingDate').optional().isISO8601(),
    body('closing_date').optional().isISO8601(),
    body('escrow_status').optional().isString(),
    body('escrowStatus').optional().isString(),
    body('city').optional().isString(),
    body('state').optional().isString(),
    body('zip_code').optional().isString(),
    body('zipCode').optional().isString()
  ],
  // Custom middleware to ensure at least one address field is provided
  (req, res, next) => {
    if (!req.body.propertyAddress && !req.body.property_address) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Property address is required',
          details: [{ field: 'property_address', message: 'Property address is required' }]
        }
      });
    }
    next();
  },
  validationMiddleware,
  escrowsController.createEscrow
);

// PUT /v1/escrows/:id
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('purchasePrice').optional().isNumeric().withMessage('Purchase price must be a number'),
    body('closingDate').optional().isISO8601().withMessage('Invalid closing date')
  ],
  validationMiddleware,
  escrowsController.updateEscrow
);

// DELETE /v1/escrows/:id
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.deleteEscrow
);

// PATCH /v1/escrows/:id/checklist
router.patch(
  '/:id/checklist',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('item').notEmpty().withMessage('Checklist item is required'),
    body('value').isBoolean().withMessage('Value must be boolean'),
    body('note').optional().isString().withMessage('Note must be a string')
  ],
  validationMiddleware,
  escrowsController.updateChecklist
);

// GET /v1/escrows/:id/timeline
router.get(
  '/:id/timeline',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowTimeline
);

// GET /v1/escrows/:id/people
router.get(
  '/:id/people',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowPeople
);

// GET /v1/escrows/:id/financials
router.get(
  '/:id/financials',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowFinancials
);

// GET /v1/escrows/:id/checklists
router.get(
  '/:id/checklists',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowChecklists
);

// GET /v1/escrows/:id/details
router.get(
  '/:id/details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowDetails
);

// GET /v1/escrows/:id/property-details
router.get(
  '/:id/property-details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowPropertyDetails
);

// GET /v1/escrows/:id/checklist-loan
router.get(
  '/:id/checklist-loan',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowChecklistLoan
);

// GET /v1/escrows/:id/checklist-house
router.get(
  '/:id/checklist-house',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowChecklistHouse
);

// GET /v1/escrows/:id/checklist-admin
router.get(
  '/:id/checklist-admin',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowChecklistAdmin
);

// GET /v1/escrows/:id/documents
router.get(
  '/:id/documents',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowDocuments
);

// GET /v1/escrows/:id/notes
router.get(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowNotes
);

// POST /v1/escrows/:id/notes
router.post(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('note').notEmpty().withMessage('Note content is required'),
    body('type').optional().isString().withMessage('Note type must be a string')
  ],
  validationMiddleware,
  escrowsController.addEscrowNote
);

module.exports = router;