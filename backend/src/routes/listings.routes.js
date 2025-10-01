const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const listingsController = require('../controllers/listings.controller');
const { authenticate } = require('../middleware/apiKey.middleware');
const { validate } = require('../middleware/validation.middleware');
const { validateListingRules } = require('../middleware/businessRules.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('propertyAddress').notEmpty().withMessage('Property address is required'),
  body('listPrice').optional().isNumeric().withMessage('List price must be a number'),
  body('sellers').optional().isArray().withMessage('Sellers must be an array'),
  body('listingDate').optional().isISO8601().withMessage('Invalid listing date'),
  body('propertyType').optional().isIn(['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial'])
];

const updateValidation = [
  body('listPrice').optional().isNumeric(),
  body('listingStatus').optional().isIn(['Coming Soon', 'Active', 'Pending', 'Sold', 'Expired', 'Withdrawn', 'Cancelled'])
];

// Routes
router.get('/', listingsController.getListings);
router.get('/:id', listingsController.getListing);
router.post('/', createValidation, validate, validateListingRules, listingsController.createListing);
router.put('/:id', updateValidation, validate, validateListingRules, listingsController.updateListing);

// Archive and Delete endpoints - Added for health dashboard testing
// Archive endpoint: Soft deletes by setting deleted_at timestamp
router.put('/:id/archive', listingsController.archiveListing);
// Delete endpoint: Hard delete - only works if listing is already archived
router.delete('/:id', listingsController.deleteListing);
// Batch delete endpoint: Delete multiple archived listings
router.post('/batch-delete',
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
  body('ids.*').isString().withMessage('Each ID must be a string'),
  validate,
  listingsController.batchDeleteListings
);

router.post('/:id/price-reduction', listingsController.recordPriceChange);
router.post('/:id/showings', listingsController.logShowing);

module.exports = router;