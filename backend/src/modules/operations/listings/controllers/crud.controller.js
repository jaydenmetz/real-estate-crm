/**
 * Listings CRUD Controller
 *
 * HTTP layer for listings operations - delegates business logic to service layer.
 * Handles request/response and error mapping only.
 *
 * @module controllers/listings/crud
 */

const { validationResult } = require('express-validator');
const listingsService = require('../services/listing.service');
const logger = require('../../../../utils/logger');

// Get all listings with filtering and pagination
exports.getListings = async (req, res) => {
  try {
    const result = await listingsService.getAllListings(req.query, req.user);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch listings',
      },
    });
  }
};

// Get single listing with all details
exports.getListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await listingsService.getListingById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found',
        },
      });
    }

    res.json({
      success: true,
      data: listing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch listing',
      },
    });
  }
};

// Create new listing
exports.createListing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        },
      });
    }

    const newListing = await listingsService.createListing(req.body, req.user);

    res.status(201).json({
      success: true,
      data: newListing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create listing',
      },
    });
  }
};

// Update listing
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedListing = await listingsService.updateListing(id, req.body, req.user);

    res.json({
      success: true,
      data: updatedListing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'NO_UPDATES') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: error.message,
        },
      });
    }

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error.code === 'VERSION_CONFLICT') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'VERSION_CONFLICT',
          message: error.message,
          currentVersion: error.currentVersion,
          attemptedVersion: error.attemptedVersion,
        },
      });
    }

    logger.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update listing',
      },
    });
  }
};

// Update listing status with validation
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedListing = await listingsService.updateListingStatus(id, status, req.user);

    // Emit real-time update (legacy support for old WebSocket pattern)
    const io = req.app.get('io');
    if (io) {
      io.to('listings').emit('listing:statusChanged', { id, status });
    }

    res.json({
      success: true,
      data: updatedListing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error.code === 'INVALID_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: error.message,
          allowedTransitions: error.allowedTransitions,
        },
      });
    }

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

// Archive listing (soft delete)
exports.archiveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const archivedListing = await listingsService.archiveListing(id, req.user);

    res.json({
      success: true,
      data: archivedListing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    logger.error('Error archiving listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive listing',
      },
    });
  }
};

// Delete listing (hard delete - only after archiving)
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await listingsService.deleteListing(id, req.user);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error.code === 'NOT_ARCHIVED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: error.message,
        },
      });
    }

    if (error.code === 'DELETE_FAILED') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error.message,
        },
      });
    }

    logger.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete listing',
      },
    });
  }
};

// Batch delete listings (hard delete - only after archiving)
exports.batchDeleteListings = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await listingsService.batchDeleteListings(ids, req.user);

    res.json({
      success: true,
      data: {
        ...result,
        message: `Successfully deleted ${result.deletedCount} listings`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          notFoundIds: error.notFoundIds,
        },
      });
    }

    if (error.code === 'NOT_ARCHIVED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: error.message,
          notArchivedIds: error.notArchivedIds,
        },
      });
    }

    logger.error('Error in batch delete listings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_DELETE_ERROR',
        message: 'Failed to batch delete listings',
      },
    });
  }
};
