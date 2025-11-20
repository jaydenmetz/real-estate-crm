/**
 * Listings Service Layer
 *
 * Business logic for listings management:
 * - Query building with filtering, pagination, and ownership
 * - Listing creation with MLS number generation
 * - Listing updates with optimistic locking and price tracking
 * - Status validation and transitions
 * - Archive and deletion operations
 * - Batch operations with transactions
 * - WebSocket event broadcasting
 *
 * @module services/listings
 */

const { pool, query, transaction } = require('../../../../config/infrastructure/database');
const logger = require('../../../../utils/logger');
const websocketService = require('../../../../lib/infrastructure/websocket.service');
const NotificationService = require('../../../../lib/communication/notification.service');
const { buildOwnershipWhereClauseWithAlias, validateScope, getDefaultScope } = require('../../../../utils/ownership.helper');

class ListingsService {
  /**
   * Valid status transitions for listings
   */
  static get validStatusTransitions() {
    return {
      'Coming Soon': ['Active', 'Cancelled'],
      Active: ['Pending', 'Sold', 'Expired', 'Cancelled', 'Withdrawn'],
      Pending: ['Active', 'Sold', 'Cancelled'],
      Sold: [], // Terminal state
      Expired: ['Active', 'Withdrawn'],
      Cancelled: ['Active'],
      Withdrawn: ['Active'],
    };
  }

  /**
   * Generate MLS number
   * Format: MLS{YEAR}{4-digit random}
   * @returns {string} MLS number
   */
  _generateMLSNumber() {
    const prefix = 'MLS';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${random}`;
  }

  /**
   * Get all listings with filtering, pagination, and ownership scoping
   * @param {Object} filters - Query filters
   * @param {Object} user - Current user (for ownership filtering)
   * @returns {Promise<Object>} { listings: [], pagination: {} }
   */
  async getAllListings(filters, user) {
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
    } = filters;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const whereConditions = ['l.is_archived = false'];

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

    // Handle ownership-based scope filtering (multi-tenant)
    const userRole = Array.isArray(user?.role) ? user.role[0] : user?.role;
    const requestedScope = filters.scope || getDefaultScope(userRole);
    const scope = validateScope(requestedScope, userRole);
    let paramIndex = params.length + 1;

    // Build ownership filter using helper (listings table alias is 'l')
    const ownershipFilter = buildOwnershipWhereClauseWithAlias(
      user,
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
        l.id,
        l.property_address,
        l.display_address,
        l.city,
        l.state,
        l.zip_code,
        l.list_price,
        l.listing_status,
        l.listing_commission,
        l.buyer_commission,
        l.total_commission,
        l.mls_number,
        l.property_type,
        l.bedrooms,
        l.bathrooms,
        l.square_feet,
        l.listing_date,
        l.expiration_date,
        l.days_on_market,
        l.created_at,
        l.updated_at,
        u.first_name || ' ' || u.last_name AS agent_name,
        u.email AS agent_email
      FROM listings l
      LEFT JOIN users u ON l.listing_agent_id = u.id
      ${whereClause}
      ORDER BY l.${sortColumn} ${order}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await query(listingsQuery, params);

    return {
      listings: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Get single listing by ID with full details
   * @param {string} id - Listing ID
   * @returns {Promise<Object|null>} Listing object or null if not found
   */
  async getListingById(id) {
    const listingQuery = `
      SELECT
        l.*,
        json_build_object(
          'listing', l.listing_commission,
          'buyer', l.buyer_commission,
          'total', l.total_commission
        ) as commission
      FROM listings l
      WHERE l.id = $1 AND l.is_archived = false
    `;

    const listingResult = await query(listingQuery, [id]);

    if (listingResult.rows.length === 0) {
      return null;
    }

    const listing = listingResult.rows[0];

    // Add placeholder analytics (can be implemented later if needed)
    listing.analytics = {
      views: 0,
      favorites: 0,
      shares: 0,
      inquiries: 0,
    };

    return listing;
  }

  /**
   * Create a new listing
   * @param {Object} listingData - Listing data
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Created listing
   * @throws {Error} If validation fails
   */
  async createListing(listingData, user) {
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
    } = listingData;

    const result = await transaction(async (client) => {
      // Generate MLS number
      const mlsNumber = this._generateMLSNumber();

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
        user?.id || null,
        user?.team_id || null,
      ];

      const listingResult = await client.query(listingQuery, listingValues);
      const listing = listingResult.rows[0];

      return listing;
    });

    logger.info('New listing created', {
      listingId: result.id,
      mlsNumber: result.mls_number,
      propertyAddress: result.property_address,
      listPrice: result.list_price,
    });

    // Get user/team/broker details for notifications
    const brokerId = user?.broker_id || user?.brokerId;

    // Notify broker about new listing (fire-and-forget)
    if (brokerId && user?.id) {
      const agent = {
        id: user.id,
        first_name: user?.first_name || user?.firstName || 'Unknown',
        last_name: user?.last_name || user?.lastName || 'Agent',
      };
      NotificationService.notifyListingCreated(result, agent).catch(err =>
        console.error('Broker notification error:', err)
      );
    }

    // Emit WebSocket event for real-time updates (3-tier: broker → team → user)
    this._emitWebSocketEvent(user, 'created', result);

    return result;
  }

  /**
   * Update an existing listing
   * @param {string} id - Listing ID
   * @param {Object} updates - Fields to update
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Updated listing
   * @throws {Error} If listing not found or version conflict
   */
  async updateListing(id, updates, user) {
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Track if price is being changed
    let priceChanged = false;
    let oldPrice;
    let newPrice;

    // Get current listing first if price is being updated
    if (updates.listPrice) {
      const currentListing = await query('SELECT list_price FROM listings WHERE id = $1', [id]);
      if (currentListing.rows.length > 0) {
        oldPrice = currentListing.rows[0].list_price;
        newPrice = updates.listPrice;
        priceChanged = oldPrice !== newPrice;
      }
    }

    // Map camelCase to snake_case and build update fields
    const columnMap = {
      propertyAddress: 'property_address',
      displayAddress: 'display_address',
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

    Object.entries(updates).forEach(([key, value]) => {
      const column = columnMap[key] || key;
      if (column && key !== 'id' && key !== 'version') {
        updateFields.push(`${column} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      const error = new Error('No valid fields to update');
      error.code = 'NO_UPDATES';
      throw error;
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
    values.push(user?.id || null);
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
      WHERE id = $${paramCount} AND is_archived = false${versionClause}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      // Check if record exists but version mismatch
      if (clientVersion !== undefined) {
        const checkQuery = 'SELECT version FROM listings WHERE id = $1 AND is_archived = false';
        const checkResult = await query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
          const error = new Error('Listing not found');
          error.code = 'NOT_FOUND';
          throw error;
        }

        const error = new Error('This listing was modified by another user. Please refresh and try again.');
        error.code = 'VERSION_CONFLICT';
        error.currentVersion = checkResult.rows[0].version;
        error.attemptedVersion = clientVersion;
        throw error;
      }

      const error = new Error('Listing not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    // If price changed, log it
    if (priceChanged) {
      logger.info('Listing price updated', {
        listingId: id,
        oldPrice,
        newPrice,
        reason: updates.priceChangeReason || 'Price updated',
        updatedBy: user?.email || 'unknown',
      });
    }

    const updatedListing = result.rows[0];

    // Emit WebSocket event for real-time updates
    this._emitWebSocketEvent(user, 'updated', updatedListing);

    return updatedListing;
  }

  /**
   * Update listing status with validation
   * @param {string} id - Listing ID
   * @param {string} newStatus - New status
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Updated listing
   * @throws {Error} If validation fails
   */
  async updateListingStatus(id, newStatus, user) {
    // Get current status
    const currentResult = await query(
      'SELECT listing_status FROM listings WHERE id = $1 AND is_archived = false',
      [id]
    );

    if (currentResult.rows.length === 0) {
      const error = new Error('Listing not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    const currentStatus = currentResult.rows[0].listing_status;

    // Validate status transition
    const allowedTransitions = ListingsService.validStatusTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      const error = new Error(`Cannot change status from ${currentStatus} to ${newStatus}`);
      error.code = 'INVALID_TRANSITION';
      error.allowedTransitions = allowedTransitions;
      throw error;
    }

    // Update status
    const updateQuery = `
      UPDATE listings
      SET listing_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [newStatus, id]);

    // Log status change
    logger.info('Listing status updated', {
      listingId: id,
      oldStatus: currentStatus,
      newStatus,
      updatedBy: user?.email || 'unknown',
    });

    return result.rows[0];
  }

  /**
   * Archive a listing (soft delete)
   * @param {string} id - Listing ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Archived listing
   * @throws {Error} If listing not found
   */
  async archiveListing(id, user) {
    const userId = user.id;
    const teamId = user.teamId || user.team_id;

    // Archive the listing with permission check
    const archiveQuery = `
      UPDATE listings
      SET
        is_archived = true,
        archived_at = CURRENT_TIMESTAMP,
        listing_status = 'Cancelled'
      WHERE id = $1
      AND (listing_agent_id = $2 OR team_id = $3)
      AND is_archived = false
      RETURNING id, property_address, is_archived, archived_at, listing_status
    `;

    const result = await query(archiveQuery, [id, userId, teamId]);

    if (result.rows.length === 0) {
      const error = new Error('Listing not found or already archived');
      error.code = 'NOT_FOUND';
      throw error;
    }

    logger.info('Listing archived', {
      listingId: id,
      archivedBy: user?.email || 'unknown',
    });

    return result.rows[0];
  }

  /**
   * Restore an archived listing
   * @param {string} id - Listing ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Restored listing
   * @throws {Error} If listing not found or not archived
   */
  async restoreListing(id, user) {
    const userId = user.id;
    const teamId = user.teamId || user.team_id;

    // Restore the listing with permission check
    const restoreQuery = `
      UPDATE listings
      SET
        is_archived = false,
        archived_at = NULL,
        listing_status = 'Active'
      WHERE id = $1
      AND (listing_agent_id = $2 OR team_id = $3)
      AND is_archived = true
      RETURNING id, property_address, is_archived, archived_at, listing_status
    `;

    const result = await query(restoreQuery, [id, userId, teamId]);

    if (result.rows.length === 0) {
      const error = new Error('Listing not found or not archived');
      error.code = 'NOT_FOUND';
      throw error;
    }

    logger.info('Listing restored', {
      listingId: id,
      restoredBy: user?.email || 'unknown',
    });

    return result.rows[0];
  }

  /**
   * Permanently delete a listing (must be archived first)
   * @param {string} id - Listing ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Deleted listing info
   * @throws {Error} If listing not found or not archived
   */
  async deleteListing(id, user) {
    const userId = user.id;
    const teamId = user.teamId || user.team_id;

    // First check if the listing exists and is archived
    const checkQuery = `
      SELECT id, property_address, is_archived, broker_id
      FROM listings
      WHERE id = $1
      AND (listing_agent_id = $2 OR team_id = $3)
    `;

    const checkResult = await query(checkQuery, [id, userId, teamId]);

    if (checkResult.rows.length === 0) {
      const error = new Error('Listing not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (!checkResult.rows[0].is_archived) {
      const error = new Error('Listing must be archived before deletion');
      error.code = 'NOT_ARCHIVED';
      throw error;
    }

    // Permanently delete the listing
    const deleteQuery = `
      DELETE FROM listings
      WHERE id = $1
      AND (listing_agent_id = $2 OR team_id = $3)
      AND is_archived = true
      RETURNING id, property_address
    `;

    const result = await query(deleteQuery, [id, userId, teamId]);

    if (result.rows.length === 0) {
      const error = new Error('Failed to delete listing');
      error.code = 'DELETE_FAILED';
      throw error;
    }

    logger.info('Listing permanently deleted', {
      listingId: id,
      deletedBy: user?.email || 'unknown',
    });

    // Emit WebSocket event for real-time updates
    const deletedListing = result.rows[0];
    const brokerId = checkResult.rows[0].broker_id;

    const eventData = {
      entityType: 'listing',
      entityId: deletedListing.id,
      action: 'deleted',
      data: {
        id: deletedListing.id,
        propertyAddress: deletedListing.property_address
      }
    };

    // Send to broker room
    if (brokerId) {
      websocketService.sendToBroker(brokerId, 'data:update', eventData);
    }

    // Send to team room
    if (teamId) {
      websocketService.sendToTeam(teamId, 'data:update', eventData);
    }

    // Send to user room
    if (userId) {
      websocketService.sendToUser(userId, 'data:update', eventData);
    }

    return {
      id: deletedListing.id,
      message: `Listing ${deletedListing.property_address} permanently deleted`,
    };
  }

  /**
   * Batch delete multiple listings (must be archived first)
   * @param {string[]} ids - Array of listing IDs
   * @param {Object} user - Current user
   * @returns {Promise<Object>} { deletedCount, deletedListings }
   * @throws {Error} If any listing is not archived or validation fails
   */
  async batchDeleteListings(ids, user) {
    const userId = user.id;
    const teamId = user.teamId || user.team_id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      const error = new Error('IDs must be a non-empty array');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // First verify all listings exist and are archived
      const verifyQuery = `
        SELECT id, property_address, is_archived
        FROM listings
        WHERE id = ANY($1)
        AND (listing_agent_id = $2 OR team_id = $3)
      `;

      const verifyResult = await client.query(verifyQuery, [ids, userId, teamId]);

      if (verifyResult.rows.length !== ids.length) {
        await client.query('ROLLBACK');
        const foundIds = verifyResult.rows.map((row) => row.id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));

        const error = new Error(`Some listings not found: ${notFoundIds.join(', ')}`);
        error.code = 'NOT_FOUND';
        error.notFoundIds = notFoundIds;
        throw error;
      }

      // Check if all are archived
      const notArchivedListings = verifyResult.rows.filter((row) => !row.is_archived);
      if (notArchivedListings.length > 0) {
        await client.query('ROLLBACK');
        const error = new Error('All listings must be archived before deletion');
        error.code = 'NOT_ARCHIVED';
        error.notArchivedIds = notArchivedListings.map((l) => l.id);
        throw error;
      }

      // Delete all listings
      const deleteQuery = `
        DELETE FROM listings
        WHERE id = ANY($1)
        AND (listing_agent_id = $2 OR team_id = $3)
        AND is_archived = true
        RETURNING id, property_address
      `;

      const deleteResult = await client.query(deleteQuery, [ids, userId, teamId]);

      await client.query('COMMIT');

      logger.info('Batch delete listings completed', {
        deletedCount: deleteResult.rows.length,
        deletedBy: user?.email || 'unknown',
        listingIds: deleteResult.rows.map((row) => row.id),
      });

      return {
        deletedCount: deleteResult.rows.length,
        deletedListings: deleteResult.rows,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Emit WebSocket event for listing changes
   * @private
   * @param {Object} user - Current user
   * @param {string} action - Action type (created, updated, deleted)
   * @param {Object} listing - Listing data
   */
  _emitWebSocketEvent(user, action, listing) {
    const teamId = user?.teamId || user?.team_id;
    const userId = user?.id;
    const brokerId = user?.broker_id || user?.brokerId || listing?.broker_id;

    const eventData = {
      entityType: 'listing',
      entityId: listing.id,
      action,
      data: {
        id: listing.id,
        mlsNumber: listing.mls_number,
        propertyAddress: listing.property_address,
        listPrice: listing.list_price,
        listingStatus: listing.listing_status
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
  }
}

module.exports = new ListingsService();
