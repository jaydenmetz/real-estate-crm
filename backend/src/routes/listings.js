const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const listingsController = require('../controllers/listings.controller');

// Apply authentication to all routes
router.use(authenticateToken);

// GET /v1/listings - List all listings with pagination and filters
router.get('/', listingsController.getListings);

// GET /v1/listings/:id - Get single listing details
router.get('/:id', listingsController.getListingById);

// POST /v1/listings - Create new listing
router.post('/', listingsController.createListing);

// PUT /v1/listings/:id - Update listing
router.put('/:id', listingsController.updateListing);

// PATCH /v1/listings/:id/status - Update listing status
router.patch('/:id/status', listingsController.updateListingStatus);

// DELETE /v1/listings/:id - Delete listing
router.delete('/:id', listingsController.deleteListing);

// GET /v1/listings/:id/price-history - Get price history
router.get('/:id/price-history', listingsController.getPriceHistory);

// POST /v1/listings/:id/price-reduction - Record price reduction
router.post('/:id/price-reduction', listingsController.recordPriceReduction);

// GET /v1/listings/:id/activity - Get listing activity
router.get('/:id/activity', listingsController.getListingActivity);

module.exports = router;