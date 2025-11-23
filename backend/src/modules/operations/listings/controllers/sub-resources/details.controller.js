/**
 * Listings Details Controller
 *
 * Handles listing detail operations for detail page:
 * - getListingDetails() - Get core listing information
 * - updateListingDetails() - Update core listing information
 * - getListingPropertyDetails() - Get property-specific details
 * - updateListingPropertyDetails() - Update property-specific details
 */

const { pool } = require('../../../../../config/infrastructure/database');

/**
 * Get listing details (core information only)
 */
async function getListingDetails(req, res) {
  try {
    const { id } = req.params;

    // Detect if ID is UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Get the full listing record
    const query = `
      SELECT
        l.id,
        l.property_address,
        l.display_address,
        l.city,
        l.state,
        l.zip_code,
        l.list_price,
        l.listing_status,
        l.listing_date,
        l.expiration_date,
        l.listing_commission,
        l.buyer_commission,
        l.total_commission,
        l.commission_type,
        l.mls_number,
        l.property_type,
        l.listing_agent_id,
        l.created_at,
        l.updated_at,
        u.first_name || ' ' || u.last_name AS agent_name,
        u.email AS agent_email
      FROM listings l
      LEFT JOIN users u ON l.listing_agent_id = u.id
      WHERE l.${isUUID ? 'id' : 'mls_number'} = $1
        AND l.is_archived = false
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found',
        },
      });
    }

    const listing = result.rows[0];

    // Format details response
    const details = {
      id: listing.id,
      mlsNumber: listing.mls_number,
      propertyAddress: listing.display_address || listing.property_address,
      city: listing.city,
      state: listing.state,
      zipCode: listing.zip_code,
      listingStatus: listing.listing_status,
      listPrice: parseFloat(listing.list_price) || 0,
      listingDate: listing.listing_date,
      expirationDate: listing.expiration_date,
      listingCommission: listing.listing_commission,
      buyerCommission: listing.buyer_commission,
      totalCommission: listing.total_commission,
      commissionType: listing.commission_type,
      propertyType: listing.property_type,
      listingAgentId: listing.listing_agent_id,
      agentName: listing.agent_name,
      agentEmail: listing.agent_email,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
    };

    res.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('Error fetching listing details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch listing details',
      },
    });
  }
}

/**
 * Update listing details
 */
async function updateListingDetails(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Map details fields to database columns
    const fieldMapping = {
      mlsNumber: 'mls_number',
      propertyAddress: 'property_address',
      displayAddress: 'display_address',
      city: 'city',
      state: 'state',
      zipCode: 'zip_code',
      listingStatus: 'listing_status',
      listPrice: 'list_price',
      listingDate: 'listing_date',
      expirationDate: 'expiration_date',
      listingCommission: 'listing_commission',
      buyerCommission: 'buyer_commission',
      totalCommission: 'total_commission',
      commissionType: 'commission_type',
      propertyType: 'property_type',
    };

    // Build update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach((key) => {
      if (fieldMapping[key] && key !== 'id' && key !== 'mlsNumber') {
        updateFields.push(`${fieldMapping[key]} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
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

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    values.push(id);

    const updateQuery = `
      UPDATE listings
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE ${isUUID ? `id = $${paramIndex}` : `mls_number = $${paramIndex}`}
        AND is_archived = false
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
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
      data: result.rows[0],
      message: 'Listing details updated successfully',
    });
  } catch (error) {
    console.error('Error updating listing details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update listing details',
      },
    });
  }
}

/**
 * Get listing property details
 */
async function getListingPropertyDetails(req, res) {
  try {
    const { id } = req.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = `
      SELECT
        property_address, display_address, city, state, zip_code,
        property_type, list_price, listing_date, expiration_date,
        bedrooms, bathrooms, square_feet, lot_size, year_built,
        garage_spaces, pool, spa, property_features, property_images,
        days_on_market, created_at, updated_at
      FROM listings
      WHERE ${isUUID ? 'id = $1' : 'mls_number = $1'}
        AND is_archived = false
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found',
        },
      });
    }

    const listing = result.rows[0];
    const storedFeatures = listing.property_features || {};
    const storedImages = listing.property_images || [];

    const propertyDetails = {
      // Basic property info
      address: listing.display_address || listing.property_address,
      city: listing.city,
      state: listing.state || 'CA',
      zipCode: listing.zip_code,

      // Property characteristics
      propertyType: listing.property_type || 'Single Family',
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      squareFeet: listing.square_feet,
      lotSize: listing.lot_size,
      yearBuilt: listing.year_built,
      garageSpaces: listing.garage_spaces,

      // Property features
      pool: listing.pool || false,
      spa: listing.spa || false,

      // Listing information
      listPrice: parseFloat(listing.list_price) || 0,
      listingDate: listing.listing_date,
      expirationDate: listing.expiration_date,
      daysOnMarket: listing.days_on_market,

      // Additional features from JSONB
      features: storedFeatures,
      images: storedImages,

      // Pricing
      pricePerSqft: listing.square_feet && listing.list_price
        ? Math.round(parseFloat(listing.list_price) / listing.square_feet)
        : null,
    };

    res.json({
      success: true,
      data: propertyDetails,
    });
  } catch (error) {
    console.error('Error fetching listing property details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch property details',
      },
    });
  }
}

/**
 * Update listing property details
 */
async function updateListingPropertyDetails(req, res) {
  try {
    const { id } = req.params;
    const propertyDetails = req.body;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Map frontend property field names to database column names
    const propertyFieldMapping = {
      pool: 'pool',
      spa: 'spa',
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      squareFeet: 'square_feet',
      square_feet: 'square_feet',
      yearBuilt: 'year_built',
      year_built: 'year_built',
      garageSpaces: 'garage_spaces',
      garage_spaces: 'garage_spaces',
      lotSize: 'lot_size',
      lot_size: 'lot_size',
      propertyType: 'property_type',
      property_type: 'property_type',
    };

    // Build dynamic update query for individual columns
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(propertyDetails).forEach((key) => {
      const dbColumn = propertyFieldMapping[key] || key;
      if (dbColumn) {
        updateFields.push(`${dbColumn} = $${paramIndex}`);
        values.push(propertyDetails[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No valid property fields to update',
        },
      });
    }

    values.push(id);

    // Update individual property columns
    const updateQuery = `
      UPDATE listings
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE ${isUUID ? `id = $${paramIndex}` : `mls_number = $${paramIndex}`}
        AND is_archived = false
      RETURNING id, bedrooms, bathrooms, square_feet, pool, spa,
                year_built, garage_spaces, lot_size
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
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
      data: result.rows[0],
      message: 'Property details updated successfully',
    });
  } catch (error) {
    console.error('Error updating property details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update property details',
        details: error.message,
      },
    });
  }
}

module.exports = {
  getListingDetails,
  updateListingDetails,
  getListingPropertyDetails,
  updateListingPropertyDetails,
};
