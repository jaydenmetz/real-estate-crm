const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listings.controller');
const { authenticate } = require('../../../middleware/auth.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const {
  createListingRules,
  updateListingRules,
  updateStatusRules,
  listingIdRules,
  batchDeleteRules,
} = require('../validators/listings.validators');

/**
 * Listings Domain Routes
 * Consolidated routing for all listing operations
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * Statistics endpoint (must be before /:id to avoid route collision)
 * GET /v1/listings/stats
 */
router.get('/stats', listingsController.getStats);

/**
 * Batch operations (must be before /:id)
 * DELETE /v1/listings/batch
 */
router.delete('/batch', batchDeleteRules(), validate, listingsController.batchDeleteListings);

/**
 * Main CRUD operations
 */
router.get('/', listingsController.getListings);
router.get('/:id', listingIdRules(), validate, listingsController.getListing);
router.post('/', createListingRules(), validate, listingsController.createListing);
router.put('/:id', [...listingIdRules(), ...updateListingRules()], validate, listingsController.updateListing);
router.delete('/:id', listingIdRules(), validate, listingsController.deleteListing);

/**
 * Status update endpoint (must be before archive/restore to avoid collision)
 * PATCH /v1/listings/:id/status
 */
router.patch('/:id/status', [...listingIdRules(), ...updateStatusRules()], validate, listingsController.updateStatus);

/**
 * Archive operations
 */
router.patch('/:id/archive', listingIdRules(), validate, listingsController.archiveListing);
router.patch('/:id/restore', listingIdRules(), validate, listingsController.restoreListing);

module.exports = router;
