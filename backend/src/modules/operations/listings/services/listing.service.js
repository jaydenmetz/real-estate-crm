const { pool } = require('../config/infrastructure/database');

/**
 * Listing Service
 * Business logic for listing operations
 * Extracted from listings.controller.js for better separation of concerns
 */
class ListingService {
  /**
   * Generate MLS number
   * Format: MLS{YEAR}{4-digit random}
   */
  static generateMLSNumber() {
    const prefix = 'MLS';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${random}`;
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
   * Validate status transition
   * @param {string} currentStatus - Current listing status
   * @param {string} newStatus - Desired new status
   * @returns {boolean} - True if transition is valid
   */
  static isValidStatusTransition(currentStatus, newStatus) {
    const allowedTransitions = this.validStatusTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Calculate days on market
   * @param {Date} listingDate - Date listing became active
   * @returns {number} - Days on market
   */
  static calculateDaysOnMarket(listingDate) {
    if (!listingDate) return 0;
    const now = new Date();
    const listed = new Date(listingDate);
    const diffTime = Math.abs(now - listed);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Build query for listing filters
   * @param {Object} filters - Filter parameters
   * @returns {Object} - Query and params
   */
  static buildListingQuery(filters) {
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
    const whereConditions = ['l.deleted_at IS NULL'];

    // Add filters
    if (status) {
      params.push(status);
      whereConditions.push(`l.listing_status = $${params.length}`);
    }

    if (minPrice) {
      params.push(minPrice);
      whereConditions.push(`l.price >= $${params.length}`);
    }

    if (maxPrice) {
      params.push(maxPrice);
      whereConditions.push(`l.price <= $${params.length}`);
    }

    if (propertyType) {
      params.push(propertyType);
      whereConditions.push(`l.property_type = $${params.length}`);
    }

    if (minDaysOnMarket) {
      params.push(minDaysOnMarket);
      whereConditions.push(`(CURRENT_DATE - l.listing_date::date) >= $${params.length}`);
    }

    if (maxDaysOnMarket) {
      params.push(maxDaysOnMarket);
      whereConditions.push(`(CURRENT_DATE - l.listing_date::date) <= $${params.length}`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Validate sort fields
    const validSortFields = [
      'price',
      'created_at',
      'listing_date',
      'property_address',
      'listing_status',
      'days_on_market',
    ];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(parseInt(limit), offset);

    const query = `
      SELECT
        l.*,
        (CURRENT_DATE - l.listing_date::date) as days_on_market,
        u.username as created_by_name
      FROM listings l
      LEFT JOIN users u ON l.created_by = u.id
      WHERE ${whereClause}
      ORDER BY l.${safeSortBy} ${safeSortOrder}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM listings l
      WHERE ${whereClause}
    `;

    return { query, countQuery, params };
  }

  /**
   * Enrich listing data with calculated fields
   * @param {Object} listing - Raw listing data
   * @returns {Object} - Enriched listing
   */
  static enrichListingData(listing) {
    return {
      ...listing,
      days_on_market: listing.days_on_market || this.calculateDaysOnMarket(listing.listing_date),
      price_per_sqft: listing.square_feet
        ? Math.round(listing.price / listing.square_feet)
        : null,
    };
  }

  /**
   * Validate listing data
   * @param {Object} data - Listing data to validate
   * @returns {Object} - Validation result { valid: boolean, errors: [] }
   */
  static validateListingData(data) {
    const errors = [];

    if (!data.property_address || data.property_address.trim() === '') {
      errors.push('Property address is required');
    }

    if (!data.price || data.price <= 0) {
      errors.push('Valid price is required');
    }

    if (data.square_feet && data.square_feet <= 0) {
      errors.push('Square feet must be greater than 0');
    }

    if (data.bedrooms && data.bedrooms < 0) {
      errors.push('Bedrooms cannot be negative');
    }

    if (data.bathrooms && data.bathrooms < 0) {
      errors.push('Bathrooms cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = ListingService;
