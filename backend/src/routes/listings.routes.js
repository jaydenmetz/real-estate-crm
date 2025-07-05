// backend/src/routes/listings.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const listingsController = require('../controllers/listings.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

// All routes require authentication and 'listings' permission
router.use(authenticate);
router.use(requirePermission('listings'));

/**
 * GET /v1/listings
 * List listings with optional pagination: ?page=&limit=
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer').toInt(),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer').toInt()
  ],
  validationMiddleware,
  listingsController.getListings
);

/**
 * GET /v1/listings/:id
 * Retrieve a single listing by ID
 */
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Listing ID is required')
  ],
  validationMiddleware,
  listingsController.getListing
);

/**
 * POST /v1/listings
 * Create a new listing
 */
router.post(
  '/',
  [
    body('address').notEmpty().withMessage('Address is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('status').optional().isString().withMessage('Status must be a string'),
    body('agentId').optional().isString().withMessage('Agent ID must be a string')
  ],
  validationMiddleware,
  listingsController.createListing
);

/**
 * PUT /v1/listings/:id
 * Update an existing listing
 */
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Listing ID is required'),
    body('address').optional().notEmpty().withMessage('Address must not be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('status').optional().isString().withMessage('Status must be a string'),
    body('agentId').optional().isString().withMessage('Agent ID must be a string')
  ],
  validationMiddleware,
  listingsController.updateListing
);

/**
 * DELETE /v1/listings/:id
 * Remove a listing
 */
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('Listing ID is required')
  ],
  validationMiddleware,
  listingsController.deleteListing
);

/**
 * POST /v1/listings/:id/price-reduction
 * Reduce the price of a listing by a specified amount
 */
router.post(
  '/:id/price-reduction',
  [
    param('id').notEmpty().withMessage('Listing ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number')
  ],
  validationMiddleware,
  listingsController.priceReduction
);

/**
 * POST /v1/listings/:id/showings
 * Log a new showing for a listing
 */
router.post(
  '/:id/showings',
  [
    param('id').notEmpty().withMessage('Listing ID is required'),
    body('showingDate').isISO8601().withMessage('Invalid showing date'),
    body('agentId').notEmpty().withMessage('Agent ID is required'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  validationMiddleware,
  listingsController.logShowing
);

module.exports = router;
