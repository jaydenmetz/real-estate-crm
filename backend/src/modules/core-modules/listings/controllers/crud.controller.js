const { validationResult } = require('express-validator');
const { pool, query, transaction } = require('../../../../config/database');
const logger = require('../../../../utils/logger');
const { buildOwnershipWhereClauseWithAlias, validateScope, getDefaultScope } = require('../../../../utils/ownership.helper');
const websocketService = require('../../../../services/websocket.service');
const NotificationService = require('../../../../services/notification.service');

// Helper to generate MLS number
function generateMLSNumber() {
  const prefix = 'MLS';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${year}${random}`;
}

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

// Get all listings with filtering and pagination
exports.getListings = async (req, res) => {
  try {
    const {
      status,
      minPrice,
      maxPrice,
      propertyType,
      minDaysOnMarket,
      maxDaysOnMarket,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const whereConditions = ['l.deleted_at IS NULL'];

    // Add filters
    if (status) {
      params.push(status);
      whereConditions.push(`l.listing_status = $${params.length}`);
    }

    if (minPrice) {
      params.push(minPrice);
      whereConditions.push(`l.list_price >= $${params.length}`);
    }

    if (maxPrice) {
      params.push(maxPrice);
      whereConditions.push(`l.list_price <= $${params.length}`);
    }

    if (propertyType) {
      params.push(propertyType);
      whereConditions.push(`l.property_type = $${params.length}`);
    }

    if (minDaysOnMarket) {
      params.push(minDaysOnMarket);
      whereConditions.push(`l.days_on_market >= $${params.length}`);
    }

    if (maxDaysOnMarket) {
      params.push(maxDaysOnMarket);
      whereConditions.push(`l.days_on_market <= $${params.length}`);
    }

    // PHASE 2: Handle ownership-based scope filtering (multi-tenant)
    // Normalize role - it might be a string or an array
    const userRole = Array.isArray(req.user?.role) ? req.user.role[0] : req.user?.role;
    const requestedScope = req.query.scope || getDefaultScope(userRole);
    const scope = validateScope(requestedScope, userRole);
    let paramIndex = params.length + 1;

    // Build ownership filter using new helper (listings table alias is 'l')
    const ownershipFilter = buildOwnershipWhereClauseWithAlias(
      req.user,
      scope,
      'listing',
      'l',
      paramIndex
    );

    if (ownershipFilter.whereClause && ownershipFilter.whereClause !== '1=1') {
      whereConditions.push(ownershipFilter.whereClause);
      params.push(...ownershipFilter.params);
      paramIndex = ownershipFilter.nextParamIndex;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort column
    const allowedSortColumns = ['created_at', 'list_price', 'listing_date', 'days_on_market'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM listings l
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get listings with pagination (JOIN with users to get agent name)
    params.push(limit, offset);
    const listingsQuery = `
      SELECT
        l.*,
        u.first_name || ' ' || u.last_name AS agent_name,
        u.email AS agent_email
      FROM listings l
      LEFT JOIN users u ON l.listing_agent_id = u.id
      ${whereClause}
      ORDER BY l.${sortColumn} ${order}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await query(listingsQuery, params);

    res.json({
      success: true,
      data: {
        listings: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
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

    // Get listing details
    const listingQuery = `
      SELECT
        l.*,
        json_build_object(
          'listing', l.listing_commission,
          'buyer', l.buyer_commission,
          'total', l.total_commission
        ) as commission
      FROM listings l
      WHERE l.id = $1 AND l.deleted_at IS NULL
    `;

    const listingResult = await query(listingQuery, [id]);

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

    // Add placeholder analytics (can be implemented later if needed)
    listing.analytics = {
      views: 0,
      favorites: 0,
      shares: 0,
      inquiries: 0,
    };

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

    const {
      propertyAddress,
      listPrice,
      propertyType = 'Single Family',
      bedrooms,
      bathrooms,
      squareFootage,
      lotSize,
      yearBuilt,
      description,
      features = [],
      photos = [],
      listingStatus = 'Coming Soon',
      listingCommission = 3.0,
      buyerCommission = 2.5,
      virtualTourLink,
      professionalPhotos = false,
      dronePhotos = false,
      videoWalkthrough = false,
    } = req.body;

    const result = await transaction(async (client) => {
      // Generate MLS number
      const mlsNumber = generateMLSNumber();

      // Calculate days on market (0 for new listings)
      const daysOnMarket = listingStatus === 'Active' ? 0 : null;

      // Insert listing
      const listingQuery = `
        INSERT INTO listings (
          property_address, list_price, listing_status, mls_number,
          property_type, bedrooms, bathrooms, square_feet, lot_size,
          year_built, description, features, photos, listing_date,
          days_on_market, listing_commission, buyer_commission,
          virtual_tour_link, professional_photos, drone_photos,
          video_walkthrough, listing_agent_id, team_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          CURRENT_DATE, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING *
      `;

      const listingValues = [
        propertyAddress,
        listPrice,
        listingStatus,
        mlsNumber,
        propertyType,
        bedrooms,
        bathrooms,
        squareFootage,
        lotSize,
        yearBuilt,
        description,
        JSON.stringify(features),
        JSON.stringify(photos),
        daysOnMarket,
        listingCommission,
        buyerCommission,
        virtualTourLink,
        professionalPhotos,
        dronePhotos,
        videoWalkthrough,
        req.user?.id || null,
        req.user?.team_id || null,
      ];

      const listingResult = await client.query(listingQuery, listingValues);
      const listing = listingResult.rows[0];

      // Price history and marketing checklist can be implemented later if needed

      return listing;
    });

    logger.info('New listing created', {
      listingId: result.id,
      mlsNumber: result.mls_number,
      propertyAddress: result.property_address,
      listPrice: result.list_price,
    });

    // Get user/team/broker details for notifications
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const brokerId = req.user?.broker_id || req.user?.brokerId; // Get broker from user

    // Notify broker about new listing (fire-and-forget)
    if (brokerId && userId) {
      const agent = {
        id: userId,
        first_name: req.user?.first_name || req.user?.firstName || 'Unknown',
        last_name: req.user?.last_name || req.user?.lastName || 'Agent',
      };
      NotificationService.notifyListingCreated(result, agent).catch(err =>
        console.error('Broker notification error:', err)
      );
    }

    // Emit WebSocket event for real-time updates (3-tier: broker → team → user)
    const eventData = {
      entityType: 'listing',
      entityId: result.id,
      action: 'created',
      data: {
        id: result.id,
        mlsNumber: result.mls_number,
        propertyAddress: result.property_address,
        listPrice: result.list_price,
        listingStatus: result.listing_status
      }
    };

    // Send to broker room (all users under this broker)
    if (brokerId) {
      websocketService.sendToBroker(brokerId, 'data:update', eventData);
    }

    // Send to team room if user has a team
    if (teamId) {
      websocketService.sendToTeam(teamId, 'data:update', eventData);
    }

    // Always send to user's personal room as fallback
    if (userId) {
      websocketService.sendToUser(userId, 'data:update', eventData);
    }

    res.status(201).json({
      success: true,
      data: result,
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
    const updates = req.body;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Track if price is being changed
    let priceChanged = false;
    let oldPrice; let
      newPrice;

    // Get current listing first if price is being updated
    if (updates.listPrice) {
      const currentListing = await query('SELECT list_price FROM listings WHERE id = $1', [id]);
      if (currentListing.rows.length > 0) {
        oldPrice = currentListing.rows[0].list_price;
        newPrice = updates.listPrice;
        priceChanged = oldPrice !== newPrice;
      }
    }

    Object.entries(updates).forEach(([key, value]) => {
      // Map camelCase to snake_case
      const columnMap = {
        propertyAddress: 'property_address',
        listPrice: 'list_price',
        listingStatus: 'listing_status',
        propertyType: 'property_type',
        squareFootage: 'square_feet',
        lotSize: 'lot_size',
        yearBuilt: 'year_built',
        listingCommission: 'listing_commission',
        buyerCommission: 'buyer_commission',
        virtualTourLink: 'virtual_tour_link',
        professionalPhotos: 'professional_photos',
        dronePhotos: 'drone_photos',
        videoWalkthrough: 'video_walkthrough',
        showingInstructions: 'showing_instructions',
        priceReductionDate: 'price_reduction_date',
      };

      const column = columnMap[key] || key;
      if (column && key !== 'id') {
        updateFields.push(`${column} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No valid fields to update',
        },
      });
    }

    // Update days on market if status is changing to Active
    if (updates.listingStatus === 'Active') {
      updateFields.push('days_on_market = 0');
      updateFields.push('listing_date = CURRENT_DATE');
    }

    // Add updated_at, version, and last_modified_by
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateFields.push('version = version + 1');
    updateFields.push(`last_modified_by = $${paramCount}`);
    values.push(req.user?.id || null);
    paramCount++;

    // Optimistic locking: check version if provided
    const { version: clientVersion } = updates;
    let versionClause = '';
    if (clientVersion !== undefined) {
      versionClause = ` AND version = $${paramCount}`;
      values.push(clientVersion);
      paramCount++;
    }

    // Add id as last parameter
    values.push(id);

    const updateQuery = `
      UPDATE listings
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND deleted_at IS NULL${versionClause}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      // Check if record exists but version mismatch
      if (clientVersion !== undefined) {
        const checkQuery = 'SELECT version FROM listings WHERE id = $1 AND deleted_at IS NULL';
        const checkResult = await query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Listing not found',
            },
          });
        }
        return res.status(409).json({
          success: false,
          error: {
            code: 'VERSION_CONFLICT',
            message: 'This listing was modified by another user. Please refresh and try again.',
            currentVersion: checkResult.rows[0].version,
            attemptedVersion: clientVersion,
          },
        });
      }

      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found',
        },
      });
    }

    // If price changed, log it
    if (priceChanged) {
      logger.info('Listing price updated', {
        listingId: id,
        oldPrice,
        newPrice,
        reason: updates.priceChangeReason || 'Price updated',
        updatedBy: req.user?.email || 'unknown',
      });
    }

    // Emit WebSocket event for real-time updates (3-tier: broker → team → user)
    const updatedListing = result.rows[0];
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const brokerId = updatedListing.broker_id;
    const eventData = {
      entityType: 'listing',
      entityId: updatedListing.id,
      action: 'updated',
      data: {
        id: updatedListing.id,
        mlsNumber: updatedListing.mls_number,
        propertyAddress: updatedListing.property_address,
        listPrice: updatedListing.list_price,
        listingStatus: updatedListing.listing_status
      }
    };

    // Send to broker room (all users under this broker)
    if (brokerId) {
      websocketService.sendToBroker(brokerId, 'data:update', eventData);
    }

    // Send to team room if user has a team
    if (teamId) {
      websocketService.sendToTeam(teamId, 'data:update', eventData);
    }

    // Always send to user's personal room as fallback
    if (userId) {
      websocketService.sendToUser(userId, 'data:update', eventData);
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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

    // Get current status
    const currentResult = await query(
      'SELECT listing_status FROM listings WHERE id = $1 AND deleted_at IS NULL',
      [id],
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

    // Validate status transition
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

    const result = await query(updateQuery, [status, id]);

    // Log status change
    logger.info('Listing status updated', {
      listingId: id,
      oldStatus: currentStatus,
      newStatus: status,
      updatedBy: req.user?.email || 'unknown',
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('listings').emit('listing:statusChanged', { id, status });
    }

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

// Archive listing (soft delete)
// This endpoint is used by the health dashboard to test archive functionality
// Sets deleted_at timestamp and changes status to 'Cancelled'
// Only archives if not already archived (deleted_at IS NULL)
exports.archiveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { teamId } = req.user;

    // Archive the listing with permission check
    // Note: Uses listing_agent_id column for ownership check
    const archiveQuery = `
      UPDATE listings
      SET
        deleted_at = CURRENT_TIMESTAMP,
        listing_status = 'Cancelled'
      WHERE id = $1
      AND (listing_agent_id = $2 OR team_id = $3)
      AND deleted_at IS NULL
      RETURNING id, property_address, deleted_at, listing_status
    `;

    const result = await query(archiveQuery, [id, userId, teamId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found or already archived',
        },
      });
    }

    logger.info('Listing archived', {
      listingId: id,
      archivedBy: req.user?.email || 'unknown',
    });

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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
// This endpoint is used by the health dashboard to test delete functionality
// Enforces archive-before-delete workflow for data safety
// Will only delete if listing has been archived (deleted_at IS NOT NULL)
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { teamId } = req.user;

    // First check if the listing exists and is archived
    // Note: Uses listing_agent_id column for ownership check
    const checkQuery = `
      SELECT id, property_address, deleted_at
      FROM listings
      WHERE id = $1
      AND (listing_agent_id = $2 OR team_id = $3)
    `;

    const checkResult = await query(checkQuery, [id, userId, teamId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found',
        },
      });
    }

    if (!checkResult.rows[0].deleted_at) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: 'Listing must be archived before deletion',
        },
      });
    }

    // Permanently delete the listing
    const deleteQuery = `
      DELETE FROM listings
      WHERE id = $1
      AND (listing_agent_id = $2 OR team_id = $3)
      AND deleted_at IS NOT NULL
      RETURNING id, property_address
    `;

    const result = await query(deleteQuery, [id, userId, teamId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete listing',
        },
      });
    }

    logger.info('Listing permanently deleted', {
      listingId: id,
      deletedBy: req.user?.email || 'unknown',
    });

    // Emit WebSocket event for real-time updates (3-tier: broker → team → user)
    const deletedListing = result.rows[0];
    // teamId and userId already declared at top of function
    const brokerId = checkResult.rows[0].broker_id; // from earlier check query
    const eventData = {
      entityType: 'listing',
      entityId: deletedListing.id,
      action: 'deleted',
      data: {
        id: deletedListing.id,
        propertyAddress: deletedListing.property_address
      }
    };

    // Send to broker room (all users under this broker)
    if (brokerId) {
      websocketService.sendToBroker(brokerId, 'data:update', eventData);
    }

    // Send to team room if user has a team
    if (teamId) {
      websocketService.sendToTeam(teamId, 'data:update', eventData);
    }

    // Always send to user's personal room as fallback
    if (userId) {
      websocketService.sendToUser(userId, 'data:update', eventData);
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        message: `Listing ${result.rows[0].property_address} permanently deleted`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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
// This endpoint is used by the health dashboard to test batch delete functionality
// Enforces archive-before-delete workflow for data safety
// Will only delete if all listings have been archived (deleted_at IS NOT NULL)
exports.batchDeleteListings = async (req, res) => {
  const client = await pool.connect();
  try {
    const { ids } = req.body;
    const userId = req.user.id;
    const { teamId } = req.user;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'IDs must be a non-empty array',
        },
      });
    }

    await client.query('BEGIN');

    // First verify all listings exist and are archived
    const verifyQuery = `
      SELECT id, property_address, deleted_at
      FROM listings
      WHERE id = ANY($1)
      AND (listing_agent_id = $2 OR team_id = $3)
    `;

    const verifyResult = await client.query(verifyQuery, [ids, userId, teamId]);

    if (verifyResult.rows.length !== ids.length) {
      await client.query('ROLLBACK');
      const foundIds = verifyResult.rows.map((row) => row.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Some listings not found: ${notFoundIds.join(', ')}`,
          notFoundIds,
        },
      });
    }

    // Check if all are archived
    const notArchivedListings = verifyResult.rows.filter((row) => !row.deleted_at);
    if (notArchivedListings.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: 'All listings must be archived before deletion',
          notArchivedIds: notArchivedListings.map((l) => l.id),
        },
      });
    }

    // Delete all listings
    const deleteQuery = `
      DELETE FROM listings
      WHERE id = ANY($1)
      AND (listing_agent_id = $2 OR team_id = $3)
      AND deleted_at IS NOT NULL
      RETURNING id, property_address
    `;

    const deleteResult = await client.query(deleteQuery, [ids, userId, teamId]);

    await client.query('COMMIT');

    logger.info('Batch delete listings completed', {
      deletedCount: deleteResult.rows.length,
      deletedBy: req.user?.email || 'unknown',
      listingIds: deleteResult.rows.map((row) => row.id),
    });

    res.json({
      success: true,
      data: {
        deletedCount: deleteResult.rows.length,
        deletedListings: deleteResult.rows,
        message: `Successfully deleted ${deleteResult.rows.length} listings`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error in batch delete listings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_DELETE_ERROR',
        message: 'Failed to batch delete listings',
      },
    });
  } finally {
    client.release();
  }
};
