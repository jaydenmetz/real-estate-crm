const { pool, query, transaction } = require('../config/database');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

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
  'Active': ['Pending', 'Sold', 'Expired', 'Cancelled', 'Withdrawn'],
  'Pending': ['Active', 'Sold', 'Cancelled'],
  'Sold': [], // Terminal state
  'Expired': ['Active', 'Withdrawn'],
  'Cancelled': ['Active'],
  'Withdrawn': ['Active']
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
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereConditions = ['l.deleted_at IS NULL'];

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

    // Get listings with pagination
    params.push(limit, offset);
    const listingsQuery = `
      SELECT l.*
      FROM listings l
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
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch listings'
      }
    });
  }
};

// Get single listing with all details
exports.getListing = async (req, res) => {
  try {
    const { id } = req.params;

    // Get listing with additional details
    const listingQuery = `
      SELECT 
        l.*,
        json_build_object(
          'listing', l.listing_commission,
          'buyer', l.buyer_commission,
          'total', l.total_commission
        ) as commission,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', ph.id,
            'old_price', ph.old_price,
            'new_price', ph.new_price,
            'reason', ph.reason,
            'effective_date', ph.effective_date,
            'created_at', ph.created_at
          )) FILTER (WHERE ph.id IS NOT NULL),
          '[]'
        ) as price_history,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', ls.id,
            'date', ls.showing_date,
            'time', ls.showing_time,
            'agent_name', ls.agent_name,
            'feedback', ls.feedback,
            'interested', ls.interested
          )) FILTER (WHERE ls.id IS NOT NULL),
          '[]'
        ) as showings,
        COUNT(DISTINCT ls.id) as showing_count
      FROM listings l
      LEFT JOIN listing_price_history ph ON l.id = ph.listing_id
      LEFT JOIN listing_showings ls ON l.id = ls.listing_id
      WHERE l.id = $1 AND l.deleted_at IS NULL
      GROUP BY l.id
    `;

    const listingResult = await query(listingQuery, [id]);

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }

    const listing = listingResult.rows[0];

    // Add placeholder analytics (can be implemented later if needed)
    listing.analytics = {
      views: 0,
      favorites: 0,
      shares: 0,
      inquiries: 0
    };

    res.json({
      success: true,
      data: listing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch listing'
      }
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
          details: errors.array()
        }
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
      videoWalkthrough = false
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
        req.user?.team_id || null
      ];

      const listingResult = await client.query(listingQuery, listingValues);
      const listing = listingResult.rows[0];

      // Add initial price history entry
      const priceHistoryQuery = `
        INSERT INTO listing_price_history (
          listing_id, old_price, new_price, reason, created_by
        ) VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(priceHistoryQuery, [
        listing.id,
        listPrice,
        listPrice,
        'Initial listing price',
        req.user?.id || null
      ]);

      // Initialize marketing checklist items
      const checklistItems = [
        'Professional photos scheduled',
        'Property description written',
        'MLS listing submitted',
        'Yard sign installed',
        'Lockbox installed',
        'Virtual tour created',
        'Social media posts created',
        'Email blast sent',
        'Open house scheduled',
        'Flyers printed'
      ];

      for (const item of checklistItems) {
        await client.query(
          `INSERT INTO listing_marketing_checklist (listing_id, checklist_item) VALUES ($1, $2)`,
          [listing.id, item]
        );
      }

      return listing;
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('listings').emit('listing:created', result);
    }

    logger.info('New listing created', {
      listingId: result.id,
      mlsNumber: result.mls_number,
      propertyAddress: result.property_address,
      listPrice: result.list_price
    });

    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create listing'
      }
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
    let oldPrice, newPrice;

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
        videoWalkthrough: 'video_walkthrough'
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
          message: 'No valid fields to update'
        }
      });
    }

    // Update days on market if status is changing to Active
    if (updates.listingStatus === 'Active') {
      updateFields.push(`days_on_market = 0`);
      updateFields.push(`listing_date = CURRENT_DATE`);
    }

    // Add updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add id as last parameter
    values.push(id);

    const updateQuery = `
      UPDATE listings 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }

    // If price changed, record it in price history
    if (priceChanged) {
      await query(
        `INSERT INTO listing_price_history (listing_id, old_price, new_price, reason, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, oldPrice, newPrice, updates.priceChangeReason || 'Price updated', req.user?.id || null]
      );

      // Recalculate commission amounts if needed
      const commissionQuery = `
        UPDATE listings 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      await query(commissionQuery, [id]);
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('listings').emit('listing:updated', result.rows[0]);
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update listing'
      }
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
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
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
          allowedTransitions
        }
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
      updatedBy: req.user?.email || 'unknown'
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('listings').emit('listing:statusChanged', { id, status });
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating listing status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: 'Failed to update listing status'
      }
    });
  }
};

// Record price change
exports.recordPriceChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPrice, reason } = req.body;

    if (!newPrice || newPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid new price is required'
        }
      });
    }

    const result = await transaction(async (client) => {
      // Get current price
      const currentResult = await client.query(
        'SELECT list_price FROM listings WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Listing not found');
      }

      const oldPrice = currentResult.rows[0].list_price;

      // Update listing price
      const updateResult = await client.query(
        `UPDATE listings 
         SET list_price = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [newPrice, id]
      );

      // Record price history
      await client.query(
        `INSERT INTO listing_price_history (listing_id, old_price, new_price, reason, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, oldPrice, newPrice, reason || 'Price adjustment', req.user?.id || null]
      );

      return updateResult.rows[0];
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('listings').emit('listing:priceChanged', { id, newPrice });
    }

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error recording price change:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRICE_ERROR',
        message: 'Failed to record price change'
      }
    });
  }
};

// Log showing
exports.logShowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, agentName, agentEmail, agentPhone, feedback, interested } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Date and time are required'
        }
      });
    }

    const showingQuery = `
      INSERT INTO listing_showings (
        listing_id, showing_date, showing_time, agent_name,
        agent_email, agent_phone, feedback, interested
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      id,
      date,
      time,
      agentName,
      agentEmail,
      agentPhone,
      feedback,
      interested || false
    ];

    const result = await query(showingQuery, values);

    // Update listing showing count
    await query(
      'UPDATE listings SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error logging showing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SHOWING_ERROR',
        message: 'Failed to log showing'
      }
    });
  }
};

// Update marketing checklist
exports.updateMarketingChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { checklistData } = req.body;

    if (!Array.isArray(checklistData)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Checklist data must be an array'
        }
      });
    }

    const results = [];

    for (const item of checklistData) {
      const { checklistItem, completed, notes } = item;

      const updateQuery = `
        UPDATE listing_marketing_checklist
        SET completed = $1,
            completed_date = CASE WHEN $1 = true THEN CURRENT_DATE ELSE NULL END,
            notes = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE listing_id = $3 AND checklist_item = $4
        RETURNING *
      `;

      const result = await query(updateQuery, [completed, notes, id, checklistItem]);
      
      if (result.rows.length > 0) {
        results.push(result.rows[0]);
      }
    }

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating marketing checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHECKLIST_ERROR',
        message: 'Failed to update marketing checklist'
      }
    });
  }
};

// Get listing analytics
exports.getListingAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Get listing basic info
    const listingResult = await query(
      'SELECT id, property_address, list_price, property_type, square_feet, listing_date FROM listings WHERE id = $1',
      [id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }

    const listing = listingResult.rows[0];

    // Get analytics data
    const analyticsQuery = `
      SELECT 
        event_type,
        SUM(event_count) as total,
        json_agg(json_build_object(
          'date', event_date,
          'count', event_count
        ) ORDER BY event_date DESC) as daily_data
      FROM listing_analytics
      WHERE listing_id = $1
        AND event_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY event_type
    `;

    const analyticsResult = await query(analyticsQuery, [id]);

    // Get showing feedback summary
    const showingQuery = `
      SELECT 
        COUNT(*) as total_showings,
        COUNT(CASE WHEN interested = true THEN 1 END) as interested_count,
        COUNT(CASE WHEN feedback IS NOT NULL THEN 1 END) as feedback_count,
        json_agg(json_build_object(
          'date', showing_date,
          'agent', agent_name,
          'interested', interested,
          'feedback', feedback
        ) ORDER BY showing_date DESC) as recent_showings
      FROM listing_showings
      WHERE listing_id = $1
    `;

    const showingResult = await query(showingQuery, [id]);

    // Get average days on market for similar properties
    const comparableQuery = `
      SELECT 
        AVG(days_on_market) as avg_days_on_market,
        AVG(list_price / NULLIF(square_feet, 0)) as avg_price_per_sqft,
        COUNT(*) as comparable_count
      FROM listings
      WHERE property_type = $1
        AND listing_status = 'Sold'
        AND ABS(square_feet - $2) <= $2 * 0.2  -- Within 20% of square footage
        AND ABS(list_price - $3) <= $3 * 0.2   -- Within 20% of price
        AND listing_date >= CURRENT_DATE - INTERVAL '6 months'
    `;

    const comparableResult = await query(comparableQuery, [
      listing.property_type,
      listing.square_feet || 0,
      listing.list_price
    ]);

    // Format response
    const analytics = {
      listing: {
        id: listing.id,
        address: listing.property_address,
        listPrice: listing.list_price,
        pricePerSqft: listing.square_feet ? (listing.list_price / listing.square_feet).toFixed(2) : null
      },
      metrics: {
        views: 0,
        favorites: 0,
        shares: 0,
        inquiries: 0
      },
      dailyBreakdown: {},
      showings: showingResult.rows[0],
      marketComparison: {
        avgDaysOnMarket: Math.round(comparableResult.rows[0].avg_days_on_market || 0),
        avgPricePerSqft: parseFloat(comparableResult.rows[0].avg_price_per_sqft || 0).toFixed(2),
        comparableProperties: parseInt(comparableResult.rows[0].comparable_count || 0)
      }
    };

    // Process analytics data
    analyticsResult.rows.forEach(row => {
      analytics.metrics[row.event_type + 's'] = parseInt(row.total);
      analytics.dailyBreakdown[row.event_type] = row.daily_data;
    });

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching listing analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to fetch listing analytics'
      }
    });
  }
};

// Track analytics event (views, favorites, etc.)
exports.trackAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventType } = req.body;

    const validEvents = ['view', 'favorite', 'share', 'inquiry'];
    if (!validEvents.includes(eventType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EVENT',
          message: 'Invalid event type'
        }
      });
    }

    // For now, just acknowledge the event without storing
    // This can be implemented with proper analytics later
    res.json({
      success: true,
      data: {
        listing_id: id,
        event_type: eventType,
        event_date: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error tracking analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to track analytics event'
      }
    });
  }
};