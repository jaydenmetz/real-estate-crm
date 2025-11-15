const { query } = require('../../../../../config/database');
const logger = require('../../../../../utils/logger');

// Get listing analytics
exports.getListingAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Get listing basic info
    const listingResult = await query(
      'SELECT id, property_address, list_price, property_type, square_feet, listing_date FROM listings WHERE id = $1',
      [id],
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
      listing.list_price,
    ]);

    // Format response
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
      dailyBreakdown: {},
      showings: showingResult.rows[0],
      marketComparison: {
        avgDaysOnMarket: Math.round(comparableResult.rows[0].avg_days_on_market || 0),
        avgPricePerSqft: parseFloat(comparableResult.rows[0].avg_price_per_sqft || 0).toFixed(2),
        comparableProperties: parseInt(comparableResult.rows[0].comparable_count || 0),
      },
    };

    // Process analytics data
    analyticsResult.rows.forEach((row) => {
      analytics.metrics[`${row.event_type}s`] = parseInt(row.total);
      analytics.dailyBreakdown[row.event_type] = row.daily_data;
    });

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
          message: 'Invalid event type',
        },
      });
    }

    // For now, just acknowledge the event without storing
    // This can be implemented with proper analytics later
    res.json({
      success: true,
      data: {
        listing_id: id,
        event_type: eventType,
        event_date: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error tracking analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to track analytics event',
      },
    });
  }
};
