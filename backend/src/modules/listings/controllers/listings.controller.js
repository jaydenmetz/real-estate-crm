/**
 * Listings Controller (Factory-Based)
 *
 * Generated from CRUD controller factory with listings-specific configuration.
 * Replaces 1,240 lines of duplicate code with standardized factory pattern.
 *
 * Migration: November 2025
 * Factory: /utils/controllers/crud.controller.factory.js
 * Config: /config/entities/listings.entity.config.js
 */

const { createCRUDController } = require('../../../utils/controllers/crud.controller.factory');
const listingsConfig = require('../../../config/entities/listings.entity.config');

// Generate standard CRUD operations from factory
const crudController = createCRUDController(listingsConfig);

// Export standard operations
exports.getListings = crudController.getAll;
exports.getListing = crudController.getById;
exports.createListing = crudController.create;
exports.updateListing = crudController.update;
exports.archiveListing = crudController.archive;
exports.deleteListing = crudController.delete;
exports.batchDeleteListings = crudController.batchDelete;

// Additional custom endpoints (not covered by factory)
// These can be added here if needed:
// - updateStatus (status transition validation)
// - recordPriceChange (price history tracking)
// - logShowing (showing appointments)
// - updateMarketingChecklist (marketing tasks)
// - getListingAnalytics (analytics data)
// - trackAnalytics (event tracking)

// For now, we'll implement the most critical custom endpoints

const { pool } = require('../../../config/database');
const logger = require('../../../utils/logger');

/**
 * Update listing status with validation
 * Custom endpoint: Validates status transitions
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Valid status transitions
    const validStatusTransitions = {
      'Coming Soon': ['Active', 'Cancelled'],
      Active: ['Pending', 'Sold', 'Expired', 'Cancelled', 'Withdrawn'],
      Pending: ['Active', 'Sold', 'Cancelled'],
      Sold: [], // Terminal state
      Expired: ['Active', 'Withdrawn'],
      Cancelled: ['Active'],
      Withdrawn: ['Active'],
    };

    // Get current status
    const currentResult = await pool.query(
      'SELECT listing_status FROM listings WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found',
        },
      });
    }

    const currentStatus = currentResult.rows[0].listing_status;

    // Validate transition
    const allowedTransitions = validStatusTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot change status from ${currentStatus} to ${status}`,
          allowedTransitions,
        },
      });
    }

    // Update status
    const updateQuery = `
      UPDATE listings
      SET listing_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [status, id]);

    logger.info('Listing status updated', {
      listingId: id,
      oldStatus: currentStatus,
      newStatus: status,
    });

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating listing status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: 'Failed to update listing status',
      },
    });
  }
};

/**
 * Get listing analytics
 * Custom endpoint: Returns analytics data for a listing
 */
exports.getListingAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Get listing basic info
    const listingResult = await pool.query(
      'SELECT id, property_address, list_price, property_type, square_feet, listing_date FROM listings WHERE id = $1',
      [id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found',
        },
      });
    }

    const listing = listingResult.rows[0];

    // Placeholder analytics (can be enhanced later)
    const analytics = {
      listing: {
        id: listing.id,
        address: listing.property_address,
        listPrice: listing.list_price,
        pricePerSqft: listing.square_feet ? (listing.list_price / listing.square_feet).toFixed(2) : null,
      },
      metrics: {
        views: 0,
        favorites: 0,
        shares: 0,
        inquiries: 0,
      },
    };

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching listing analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to fetch listing analytics',
      },
    });
  }
};
