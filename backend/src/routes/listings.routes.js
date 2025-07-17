const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const listingsController = require('../controllers/listings.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);
router.use(requirePermission('listings'));

// GET /v1/listings - Get all listings with filters
router.get(
  '/',
  [
    query('status').optional().isString().withMessage('Status must be a string'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive').toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive').toFloat(),
    query('propertyType').optional().isString().withMessage('Property type must be a string'),
    query('minDaysOnMarket').optional().isInt({ min: 0 }).withMessage('Min days must be positive').toInt(),
    query('maxDaysOnMarket').optional().isInt({ min: 0 }).withMessage('Max days must be positive').toInt(),
    query('sortBy').optional().isIn(['created_at', 'list_price', 'listing_date', 'days_on_market']),
    query('sortOrder').optional().isIn(['ASC', 'DESC', 'asc', 'desc']),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100').toInt()
  ],
  validationMiddleware,
  listingsController.getListings
);

// GET /v1/listings/:id - Get single listing
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid listing ID')
  ],
  validationMiddleware,
  listingsController.getListing
);

// POST /v1/listings - Create new listing
router.post(
  '/',
  [
    body('propertyAddress').notEmpty().withMessage('Property address is required'),
    body('listPrice').isFloat({ min: 0 }).withMessage('List price must be positive'),
    body('propertyType').optional().isIn(['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial']),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be non-negative'),
    body('bathrooms').optional().isFloat({ min: 0 }).withMessage('Bathrooms must be non-negative'),
    body('squareFootage').optional().isInt({ min: 0 }).withMessage('Square footage must be positive'),
    body('lotSize').optional().isFloat({ min: 0 }).withMessage('Lot size must be non-negative'),
    body('yearBuilt').optional().isInt({ min: 1800, max: new Date().getFullYear() + 1 }),
    body('listingCommission').optional().isFloat({ min: 0, max: 10 }),
    body('buyerCommission').optional().isFloat({ min: 0, max: 10 })
  ],
  validationMiddleware,
  listingsController.createListing
);

// PUT /v1/listings/:id - Update listing
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid listing ID'),
    body('listPrice').optional().isFloat({ min: 0 }),
    body('propertyType').optional().isIn(['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial']),
    body('listingStatus').optional().isIn(['Coming Soon', 'Active', 'Pending', 'Sold', 'Expired', 'Withdrawn', 'Cancelled'])
  ],
  validationMiddleware,
  listingsController.updateListing
);

// PATCH /v1/listings/:id/status - Update listing status
router.patch(
  '/:id/status',
  [
    param('id').isUUID().withMessage('Invalid listing ID'),
    body('status').notEmpty().isIn(['Coming Soon', 'Active', 'Pending', 'Sold', 'Expired', 'Withdrawn', 'Cancelled'])
  ],
  validationMiddleware,
  listingsController.updateStatus
);

// POST /v1/listings/:id/price-change - Record price change
router.post(
  '/:id/price-change',
  [
    param('id').isUUID().withMessage('Invalid listing ID'),
    body('newPrice').isFloat({ min: 0 }).withMessage('New price must be positive'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  validationMiddleware,
  listingsController.recordPriceChange
);

// POST /v1/listings/:id/showings - Log a showing
router.post(
  '/:id/showings',
  [
    param('id').isUUID().withMessage('Invalid listing ID'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
    body('agentName').optional().isString(),
    body('agentEmail').optional().isEmail(),
    body('agentPhone').optional().isString(),
    body('feedback').optional().isString(),
    body('interested').optional().isBoolean()
  ],
  validationMiddleware,
  listingsController.logShowing
);

// PUT /v1/listings/:id/marketing-checklist - Update marketing checklist
router.put(
  '/:id/marketing-checklist',
  [
    param('id').isUUID().withMessage('Invalid listing ID'),
    body('checklistData').isArray().withMessage('Checklist data must be an array'),
    body('checklistData.*.checklistItem').notEmpty().withMessage('Checklist item is required'),
    body('checklistData.*.completed').isBoolean().withMessage('Completed must be boolean'),
    body('checklistData.*.notes').optional().isString()
  ],
  validationMiddleware,
  listingsController.updateMarketingChecklist
);

// GET /v1/listings/:id/analytics - Get listing analytics
router.get(
  '/:id/analytics',
  [
    param('id').isUUID().withMessage('Invalid listing ID')
  ],
  validationMiddleware,
  listingsController.getListingAnalytics
);

// POST /v1/listings/:id/analytics - Track analytics event
router.post(
  '/:id/analytics',
  [
    param('id').isUUID().withMessage('Invalid listing ID'),
    body('eventType').notEmpty().isIn(['view', 'favorite', 'share', 'inquiry'])
  ],
  validationMiddleware,
  listingsController.trackAnalytics
);

module.exports = router;