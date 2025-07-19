const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const listingsController = require('../controllers/listings.controller');

// Apply authentication to all routes
router.use(authenticate);

// GET /v1/listings - List all listings with pagination and filters
router.get('/', listingsController.getListings);

// GET /v1/listings/:id - Get single listing details
router.get('/:id', listingsController.getListing);

// POST /v1/listings - Create new listing
router.post('/', listingsController.createListing);

// PUT /v1/listings/:id - Update listing
router.put('/:id', listingsController.updateListing);

// PATCH /v1/listings/:id/status - Update listing status
router.patch('/:id/status', listingsController.updateStatus);

// DELETE /v1/listings/:id - Delete listing
// router.delete('/:id', listingsController.deleteListing); // Not implemented in controller

// GET /v1/listings/:id/price-history - Get price history
// router.get('/:id/price-history', listingsController.getPriceHistory); // Not implemented in controller

// POST /v1/listings/:id/price-reduction - Record price reduction
router.post('/:id/price-reduction', listingsController.recordPriceChange);

// GET /v1/listings/:id/analytics - Get listing analytics
router.get('/:id/analytics', listingsController.getListingAnalytics);

// POST /v1/listings/:id/showings - Log a showing
router.post('/:id/showings', listingsController.logShowing);

// PUT /v1/listings/:id/marketing-checklist - Update marketing checklist
router.put('/:id/marketing-checklist', listingsController.updateMarketingChecklist);

// POST /v1/listings/:id/analytics - Track analytics event
router.post('/:id/analytics', listingsController.trackAnalytics);

module.exports = router;