// backend/src/routes/escrows.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const escrowsController = require('../controllers/escrows.controller');
const { authenticate } = require('../middleware/apiKey.middleware');
const { validate, escrowValidationRules, paginationValidationRules, idValidationRules } = require('../middleware/validation.middleware');
const { validateEscrowRules } = require('../middleware/businessRules.middleware');

// All routes require authentication
router.use(authenticate);

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
  validate,
  escrowsController.getEscrows
);

// GET /v1/escrows/:id
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrow
);

// POST /v1/escrows
router.post(
  '/',
  // Custom middleware to normalize field names before validation
  (req, res, next) => {
    // Normalize snake_case to camelCase if needed
    if (req.body.property_address && !req.body.propertyAddress) {
      req.body.propertyAddress = req.body.property_address;
    }
    if (req.body.purchase_price && !req.body.purchasePrice) {
      req.body.purchasePrice = req.body.purchase_price;
    }
    if (req.body.acceptance_date && !req.body.acceptanceDate) {
      req.body.acceptanceDate = req.body.acceptance_date;
    }
    if (req.body.closing_date && !req.body.closingDate) {
      req.body.closingDate = req.body.closing_date;
    }
    if (req.body.escrow_status && !req.body.escrowStatus) {
      req.body.escrowStatus = req.body.escrow_status;
    }
    if (req.body.zip_code && !req.body.zipCode) {
      req.body.zipCode = req.body.zip_code;
    }
    next();
  },
  [
    // Now validate only camelCase fields
    body('propertyAddress').notEmpty().withMessage('Property address is required'),
    body('purchasePrice').optional().isNumeric().withMessage('Purchase price must be a number'),
    body('buyers').optional().isArray({ min: 1 }).withMessage('Buyers must be an array'),
    body('sellers').optional().isArray({ min: 1 }).withMessage('Sellers must be an array'),
    body('acceptanceDate').optional().isISO8601().withMessage('Invalid acceptance date'),
    body('closingDate').optional().isISO8601().withMessage('Invalid closing date'),
    body('escrowStatus').optional().isString().withMessage('Escrow status must be a string'),
    body('city').optional().isString().withMessage('City must be a string'),
    body('state').optional().isString().withMessage('State must be a string'),
    body('zipCode').optional().isString().withMessage('Zip code must be a string')
  ],
  validate,
  validateEscrowRules,
  escrowsController.createEscrow
);

// PUT /v1/escrows/:id
router.put(
  '/:id',
  // Normalize field names before validation (remove snake_case versions after copying)
  (req, res, next) => {
    if (req.body.purchase_price && !req.body.purchasePrice) {
      req.body.purchasePrice = req.body.purchase_price;
      delete req.body.purchase_price;
    }
    if (req.body.closing_date && !req.body.closingDate) {
      req.body.closingDate = req.body.closing_date;
      delete req.body.closing_date;
    }
    if (req.body.escrow_status && !req.body.escrowStatus) {
      req.body.escrowStatus = req.body.escrow_status;
      delete req.body.escrow_status;
    }
    if (req.body.escrow_officer_name && !req.body.escrowOfficerName) {
      req.body.escrowOfficerName = req.body.escrow_officer_name;
      delete req.body.escrow_officer_name;
    }
    next();
  },
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('purchasePrice').optional().isNumeric().withMessage('Purchase price must be a number'),
    body('closingDate').optional().isISO8601().withMessage('Invalid closing date'),
    body('escrowStatus').optional().isString().withMessage('Escrow status must be a string')
  ],
  validate,
  validateEscrowRules,
  escrowsController.updateEscrow
);

// Archive (soft delete) escrow - PUT /v1/escrows/:id/archive
router.put(
  '/:id/archive',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.archiveEscrow
);

// Restore archived escrow - PUT /v1/escrows/:id/restore
router.put(
  '/:id/restore',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.restoreEscrow
);

// Permanently delete escrow (only archived ones) - DELETE /v1/escrows/:id
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.deleteEscrow
);

// Batch delete multiple escrows (only archived ones) - POST /v1/escrows/batch-delete
router.post(
  '/batch-delete',
  [
    body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
    body('ids.*').isString().withMessage('Each ID must be a string')
  ],
  validate,
  escrowsController.batchDeleteEscrows
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
  validate,
  escrowsController.updateChecklist
);

// GET /v1/escrows/:id/timeline
router.get(
  '/:id/timeline',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowTimeline
);

// GET /v1/escrows/:id/people
router.get(
  '/:id/people',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowPeople
);

// GET /v1/escrows/:id/financials
router.get(
  '/:id/financials',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowFinancials
);

// GET /v1/escrows/:id/checklists
router.get(
  '/:id/checklists',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowChecklists
);

// GET /v1/escrows/:id/details
router.get(
  '/:id/details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowDetails
);

// GET /v1/escrows/:id/property-details
router.get(
  '/:id/property-details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowPropertyDetails
);

// GET /v1/escrows/:id/checklist-loan
router.get(
  '/:id/checklist-loan',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowChecklistLoan
);

// GET /v1/escrows/:id/checklist-house
router.get(
  '/:id/checklist-house',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowChecklistHouse
);

// GET /v1/escrows/:id/checklist-admin
router.get(
  '/:id/checklist-admin',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowChecklistAdmin
);

// GET /v1/escrows/:id/documents
router.get(
  '/:id/documents',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.getEscrowDocuments
);

// GET /v1/escrows/:id/notes
router.get(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
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
  validate,
  escrowsController.addEscrowNote
);

// Additional PUT endpoints for updating specific escrow sections

// PUT /v1/escrows/:id/details
router.put(
  '/:id/details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.updateEscrowDetails
);

// PUT /v1/escrows/:id/people
router.put(
  '/:id/people',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.updateEscrowPeople
);

// PUT /v1/escrows/:id/timeline
router.put(
  '/:id/timeline',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.updateEscrowTimeline || escrowsController.updateEscrow
);

// PUT /v1/escrows/:id/financials
router.put(
  '/:id/financials',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.updateEscrowFinancials
);

// PUT /v1/escrows/:id/property-details
router.put(
  '/:id/property-details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.updateEscrowPropertyDetails
);

// PUT /v1/escrows/:id/checklist-loan
router.put(
  '/:id/checklist-loan',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.updateEscrowChecklistLoan
);

// PUT /v1/escrows/:id/checklist-house
router.put(
  '/:id/checklist-house',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.updateEscrowChecklistHouse
);

// PUT /v1/escrows/:id/checklist-admin
router.put(
  '/:id/checklist-admin',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validate,
  escrowsController.updateEscrowChecklistAdmin
);

// PUT /v1/escrows/:id/documents
router.put(
  '/:id/documents',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body().isArray().withMessage('Documents must be an array')
  ],
  validate,
  escrowsController.updateEscrowDocuments
);

module.exports = router;