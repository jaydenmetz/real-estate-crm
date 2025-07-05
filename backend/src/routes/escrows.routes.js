// backend/src/routes/escrows.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const escrowsController = require('../controllers/escrows.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
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
    body('propertyAddress').notEmpty().withMessage('Property address is required'),
    body('purchasePrice').isNumeric().withMessage('Purchase price must be a number'),
    body('buyers').isArray({ min: 1 }).withMessage('Buyers must be a non-empty array'),
    body('sellers').isArray({ min: 1 }).withMessage('Sellers must be a non-empty array'),
    body('acceptanceDate').isISO8601().withMessage('Invalid acceptance date'),
    body('closingDate').isISO8601().withMessage('Invalid closing date')
  ],
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

module.exports = router;