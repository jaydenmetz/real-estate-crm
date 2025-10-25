const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listings.controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Listings Domain Routes
 * Consolidated routing for all listing operations
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Statistics endpoint (must be before /:id to avoid route collision)
 * GET /v1/listings/stats
 */
router.get('/stats', listingsController.getStats);

/**
 * Batch operations (must be before /:id)
 * DELETE /v1/listings/batch
 */
router.delete('/batch', listingsController.batchDeleteListings);

/**
 * Main CRUD operations
 */
router.get('/', listingsController.getListings);
router.get('/:id', listingsController.getListing);
router.post('/', listingsController.createListing);
router.put('/:id', listingsController.updateListing);
router.delete('/:id', listingsController.deleteListing);

/**
 * Status update endpoint (must be before archive/restore to avoid collision)
 * PATCH /v1/listings/:id/status
 */
router.patch('/:id/status', listingsController.updateStatus);

/**
 * Archive operations
 */
router.patch('/:id/archive', listingsController.archiveListing);
router.patch('/:id/restore', listingsController.restoreListing);

module.exports = router;
