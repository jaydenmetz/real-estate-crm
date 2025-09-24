const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const listingsController = require('../controllers/listings.controller');
const { authenticate } = require('../middleware/apiKey.middleware');
const { requirePermission } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('propertyAddress').notEmpty().withMessage('Property address is required'),
  body('listPrice').isNumeric().withMessage('List price must be a number'),
  body('sellers').isArray().withMessage('Sellers must be an array'),
  body('listingDate').isISO8601().withMessage('Invalid listing date'),
  body('propertyType').isIn(['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial'])
];

const updateValidation = [
  body('listPrice').optional().isNumeric(),
  body('listingStatus').optional().isIn(['Coming Soon', 'Active', 'Pending', 'Sold', 'Expired', 'Withdrawn', 'Cancelled'])
];

// Routes
router.get('/', requirePermission('listings'), listingsController.getListings);
router.get('/:id', requirePermission('listings'), listingsController.getListing);
router.post('/', requirePermission('listings'), createValidation, validate, listingsController.createListing);
router.put('/:id', requirePermission('listings'), updateValidation, validate, listingsController.updateListing);
router.put('/:id/archive', requirePermission('listings'), listingsController.archiveListing);
router.delete('/:id', requirePermission('listings'), listingsController.deleteListing);
router.post('/:id/price-reduction', requirePermission('listings'), listingsController.recordPriceChange);
router.post('/:id/showings', requirePermission('listings'), listingsController.logShowing);

module.exports = router;