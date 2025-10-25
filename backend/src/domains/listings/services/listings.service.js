const BaseDomainService = require('../../../shared/services/BaseDomainService');
const { pool } = require('../../../config/database');
const { buildOwnershipWhereClauseWithAlias } = require('../../../helpers/ownership.helper');
const websocketService = require('../../../services/websocket.service');
const NotificationService = require('../../../services/notification.service');

/**
 * ListingsService
 * Enhanced listings service extending BaseDomainService
 * Wraps existing listings business logic with domain service architecture
 */
class ListingsService extends BaseDomainService {
  constructor() {
    super('listings', 'ListingsService');
  }

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
   */
  generateMLSNumber() {
    const prefix = 'MLS';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${random}`;
  }

  /**
   * Validate status transition
   */
  isValidStatusTransition(currentStatus, newStatus) {
    const allowedTransitions = ListingsService.validStatusTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Calculate days on market
   */
  calculateDaysOnMarket(listingDate) {
    if (!listingDate) return 0;
    const now = new Date();
    const listed = new Date(listingDate);
    const diffTime = Math.abs(now - listed);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Override buildQuery to add listing-specific filters
   */
  buildQuery(filters) {
    const query = super.buildQuery(filters);

    // Add listing-specific filters
    if (filters.status) {
      query.listing_status = filters.status;
      delete query.status; // Remove base class status, use listing_status instead
    }

    if (filters.propertyType) {
      query.property_type = filters.propertyType;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.priceRange = {
        min: filters.minPrice,
        max: filters.maxPrice
      };
    }

    if (filters.minDaysOnMarket || filters.maxDaysOnMarket) {
      query.daysOnMarketRange = {
        min: filters.minDaysOnMarket,
        max: filters.maxDaysOnMarket
      };
    }

    return query;
  }

  /**
   * Override buildWhereClause to handle listing-specific fields
   */
  buildWhereClause(query) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Soft delete filter
    conditions.push('deleted_at IS NULL');

    // Process each query parameter
    Object.keys(query).forEach(key => {
      if (key === 'dateRange' && query[key]) {
        if (query[key].start) {
          conditions.push(`created_at >= $${paramIndex++}`);
          values.push(query[key].start);
        }
        if (query[key].end) {
          conditions.push(`created_at <= $${paramIndex++}`);
          values.push(query[key].end);
        }
      } else if (key === 'priceRange' && query[key]) {
        if (query[key].min) {
          conditions.push(`list_price >= $${paramIndex++}`);
          values.push(query[key].min);
        }
        if (query[key].max) {
          conditions.push(`list_price <= $${paramIndex++}`);
          values.push(query[key].max);
        }
      } else if (key === 'daysOnMarketRange' && query[key]) {
        if (query[key].min) {
          conditions.push(`days_on_market >= $${paramIndex++}`);
          values.push(query[key].min);
        }
        if (query[key].max) {
          conditions.push(`days_on_market <= $${paramIndex++}`);
          values.push(query[key].max);
        }
      } else if (key === 'search' && query[key]) {
        // Search across property address, city, and MLS number
        conditions.push(`(
          property_address ILIKE $${paramIndex}
          OR city ILIKE $${paramIndex}
          OR mls_number ILIKE $${paramIndex}
        )`);
        values.push(`%${query[key]}%`);
        paramIndex++;
      } else if (query[key] !== undefined && key !== 'priceRange' && key !== 'daysOnMarketRange') {
        conditions.push(`${key} = $${paramIndex++}`);
        values.push(query[key]);
      }
    });

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    return { whereClause, values };
  }

  /**
   * Enhanced statistics calculation for listings
   */
  async calculateStats(filters) {
    try {
      const query = this.buildQuery(filters);
      const { whereClause, values } = this.buildWhereClause(query);

      const statsQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN listing_status = 'Coming Soon' THEN 1 END) as coming_soon,
          COUNT(CASE WHEN listing_status = 'Active' THEN 1 END) as active,
          COUNT(CASE WHEN listing_status = 'Pending' THEN 1 END) as pending,
          COUNT(CASE WHEN listing_status = 'Sold' THEN 1 END) as sold,
          COUNT(CASE WHEN listing_status = 'Expired' THEN 1 END) as expired,
          COUNT(CASE WHEN listing_status = 'Cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN listing_status = 'Withdrawn' THEN 1 END) as withdrawn,
          COALESCE(AVG(CASE WHEN listing_status IN ('Active', 'Coming Soon') THEN list_price END), 0) as avg_list_price,
          COALESCE(AVG(CASE WHEN listing_status = 'Sold' THEN list_price END), 0) as avg_sold_price,
          COALESCE(SUM(CASE WHEN listing_status IN ('Active', 'Coming Soon') THEN list_price ELSE 0 END), 0) as total_active_inventory,
          COALESCE(SUM(CASE WHEN listing_status = 'Sold' THEN list_price ELSE 0 END), 0) as total_sold_volume,
          COALESCE(AVG(CASE WHEN listing_status IN ('Active', 'Coming Soon') THEN days_on_market END), 0) as avg_days_on_market
        FROM ${this.tableName}
        ${whereClause}
      `;

      const result = await this.db.query(statsQuery, values);
      const stats = result.rows[0];

      return {
        total: parseInt(stats.total) || 0,
        comingSoon: parseInt(stats.coming_soon) || 0,
        active: parseInt(stats.active) || 0,
        pending: parseInt(stats.pending) || 0,
        sold: parseInt(stats.sold) || 0,
        expired: parseInt(stats.expired) || 0,
        cancelled: parseInt(stats.cancelled) || 0,
        withdrawn: parseInt(stats.withdrawn) || 0,
        avgListPrice: parseFloat(stats.avg_list_price) || 0,
        avgSoldPrice: parseFloat(stats.avg_sold_price) || 0,
        totalActiveInventory: parseFloat(stats.total_active_inventory) || 0,
        totalSoldVolume: parseFloat(stats.total_sold_volume) || 0,
        avgDaysOnMarket: parseFloat(stats.avg_days_on_market) || 0,
        activePercentage: stats.total > 0
          ? Math.round((stats.active / stats.total) * 100)
          : 0
      };
    } catch (error) {
      this.logger.error('Error calculating listing stats:', error);
      return {
        total: 0,
        comingSoon: 0,
        active: 0,
        pending: 0,
        sold: 0,
        expired: 0,
        cancelled: 0,
        withdrawn: 0,
        avgListPrice: 0,
        avgSoldPrice: 0,
        totalActiveInventory: 0,
        totalSoldVolume: 0,
        avgDaysOnMarket: 0,
        activePercentage: 0
      };
    }
  }

  /**
   * Create new listing with auto-generated MLS number
   */
  async create(data, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate required fields
      if (!data.propertyAddress && !data.property_address) {
        throw new Error('property_address is required');
      }

      if (!data.listPrice && !data.list_price) {
        throw new Error('list_price is required');
      }

      const propertyAddress = data.propertyAddress || data.property_address;
      const listPrice = data.listPrice || data.list_price;

      // Generate MLS number
      const mlsNumber = this.generateMLSNumber();

      // Build dynamic insert query
      const fields = ['property_address', 'mls_number', 'list_price', 'listing_status', 'listing_date'];
      const values = [
        propertyAddress,
        mlsNumber,
        listPrice,
        data.listingStatus || data.listing_status || 'Coming Soon',
        data.listingDate || data.listing_date || new Date()
      ];
      const placeholders = ['$1', '$2', '$3', '$4', '$5'];
      let paramIndex = 6;

      // Add optional fields
      const optionalFields = {
        city: data.city,
        state: data.state,
        zip_code: data.zipCode || data.zip_code,
        property_type: data.propertyType || data.property_type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        square_feet: data.squareFeet || data.square_feet,
        lot_size: data.lotSize || data.lot_size,
        year_built: data.yearBuilt || data.year_built,
        description: data.description,
        listing_commission: data.listingCommission || data.listing_commission,
        buyer_commission: data.buyerCommission || data.buyer_commission,
        total_commission: data.totalCommission || data.total_commission,
        listing_agent_id: data.listingAgentId || data.listing_agent_id || user.id,
        team_id: user.team_id,
        broker_id: user.broker_id,
        created_by: user.id
      };

      for (const [field, value] of Object.entries(optionalFields)) {
        if (value !== undefined && value !== null) {
          fields.push(field);
          values.push(value);
          placeholders.push(`$${paramIndex++}`);
        }
      }

      const insertQuery = `
        INSERT INTO listings (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      const result = await client.query(insertQuery, values);
      const newListing = result.rows[0];

      await client.query('COMMIT');

      // Emit WebSocket event (3-tier hierarchy)
      const eventData = {
        entityType: 'listing',
        entityId: newListing.id,
        action: 'created',
        data: this.transform(newListing)
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }
      if (user.id) {
        websocketService.sendToUser(user.id, 'data:update', eventData);
      }

      // Send broker notification
      if (user.broker_id) {
        await NotificationService.createNotification({
          userId: user.broker_id,
          type: 'listing_created',
          message: `New listing created: ${propertyAddress}`,
          entityType: 'listing',
          entityId: newListing.id
        });
      }

      return this.transform(newListing);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error creating listing:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update listing with status transition validation
   */
  async update(id, data, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get existing listing
      const existing = await this.findById(id);

      // Validate status transition if status is being changed
      if (data.listingStatus || data.listing_status) {
        const newStatus = data.listingStatus || data.listing_status;
        if (newStatus !== existing.listing_status) {
          if (!this.isValidStatusTransition(existing.listing_status, newStatus)) {
            throw new Error(`Invalid status transition from ${existing.listing_status} to ${newStatus}`);
          }
        }
      }

      // Build update query dynamically
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Map of allowed fields
      const allowedFields = {
        property_address: data.propertyAddress || data.property_address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode || data.zip_code,
        list_price: data.listPrice || data.list_price,
        property_type: data.propertyType || data.property_type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        square_feet: data.squareFeet || data.square_feet,
        lot_size: data.lotSize || data.lot_size,
        year_built: data.yearBuilt || data.year_built,
        description: data.description,
        listing_status: data.listingStatus || data.listing_status,
        listing_date: data.listingDate || data.listing_date,
        listing_commission: data.listingCommission || data.listing_commission,
        buyer_commission: data.buyerCommission || data.buyer_commission,
        total_commission: data.totalCommission || data.total_commission,
        listing_agent_id: data.listingAgentId || data.listing_agent_id
      };

      for (const [field, value] of Object.entries(allowedFields)) {
        if (value !== undefined && value !== null) {
          updateFields.push(`${field} = $${paramIndex++}`);
          values.push(value);
        }
      }

      // Add updated_by
      updateFields.push(`updated_by = $${paramIndex++}`);
      values.push(user.id);
      updateFields.push(`updated_at = NOW()`);

      // Add ID as last parameter
      values.push(id);

      const updateQuery = `
        UPDATE listings
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error('Listing not found or has been deleted');
      }

      const updated = result.rows[0];

      await client.query('COMMIT');

      // Emit WebSocket event
      const eventData = {
        entityType: 'listing',
        entityId: updated.id,
        action: 'updated',
        data: this.transform(updated)
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }
      if (user.id) {
        websocketService.sendToUser(user.id, 'data:update', eventData);
      }

      return this.transform(updated);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error updating listing:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Archive listing (soft delete)
   */
  async archive(id, user) {
    try {
      const query = `
        UPDATE listings
        SET deleted_at = NOW(), deleted_by = $1
        WHERE id = $2
        AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await this.db.query(query, [user.id, id]);

      if (result.rows.length === 0) {
        throw new Error('Listing not found or already archived');
      }

      // Emit WebSocket event
      const eventData = {
        entityType: 'listing',
        entityId: id,
        action: 'archived',
        data: { id }
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }

      return { success: true, id };
    } catch (error) {
      this.logger.error('Error archiving listing:', error);
      throw error;
    }
  }

  /**
   * Restore archived listing
   */
  async restore(id, user) {
    try {
      const query = `
        UPDATE listings
        SET deleted_at = NULL, deleted_by = NULL
        WHERE id = $1
        AND deleted_at IS NOT NULL
        RETURNING *
      `;

      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Listing not found or not archived');
      }

      const restored = this.transform(result.rows[0]);

      // Emit WebSocket event
      const eventData = {
        entityType: 'listing',
        entityId: id,
        action: 'restored',
        data: restored
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }

      return restored;
    } catch (error) {
      this.logger.error('Error restoring listing:', error);
      throw error;
    }
  }

  /**
   * Enrich listing data with calculated fields
   */
  transform(listing) {
    if (!listing) return null;

    return {
      ...listing,
      days_on_market: listing.days_on_market || this.calculateDaysOnMarket(listing.listing_date),
      price_per_sqft: listing.square_feet
        ? Math.round(listing.list_price / listing.square_feet)
        : null
    };
  }
}

module.exports = new ListingsService();
