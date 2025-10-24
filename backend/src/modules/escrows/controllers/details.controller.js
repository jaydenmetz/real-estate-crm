/**
 * Escrows Details Controller
 *
 * Handles escrow detail operations:
 * - getEscrowDetails() - Get core escrow information
 * - updateEscrowDetails() - Update core escrow information
 * - getEscrowPropertyDetails() - Get property-specific details
 * - updateEscrowPropertyDetails() - Update property-specific details
 * - getEscrowDocuments() - Get documents list
 * - updateEscrowDocuments() - Update documents list
 */

const { pool } = require('../../../config/database');
const { buildRestructuredEscrowResponse } = require('../utils/escrows.helper');

/**
 * Get escrow details (core information only)
 */
async function getEscrowDetails(req, res) {
  try {
    const { id } = req.params;

    // Detect if ID is UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Get the full escrow record
    const query = `
      SELECT * FROM escrows
      WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const escrow = result.rows[0];

    // Use the same response builder as getEscrowById
    const fullResponse = buildRestructuredEscrowResponse(escrow);

    // Return just the details section
    res.json({
      success: true,
      data: fullResponse.details,
    });
  } catch (error) {
    console.error('Error fetching escrow details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch escrow details',
      },
    });
  }
}

/**
 * Update escrow details
 */
async function updateEscrowDetails(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Map details fields to database columns
    const fieldMapping = {
      escrowNumber: 'display_id',
      propertyAddress: 'property_address',
      propertyImage: 'property_image_url',
      zillowUrl: 'zillow_url',
      escrowStatus: 'escrow_status',
      purchasePrice: 'purchase_price',
      earnestMoneyDeposit: 'earnest_money_deposit',
      downPayment: 'down_payment',
      loanAmount: 'loan_amount',
      myCommission: 'my_commission',
      scheduledCoeDate: 'closing_date',
      escrowCompany: 'escrow_company',
      escrowOfficerName: 'escrow_officer_name',
      escrowOfficerEmail: 'escrow_officer_email',
      escrowOfficerPhone: 'escrow_officer_phone',
      titleCompany: 'title_company',
      transactionType: 'transaction_type',
      leadSource: 'lead_source',
    };

    // Build update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach((key) => {
      if (fieldMapping[key] && key !== 'id' && key !== 'escrowNumber') {
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
      UPDATE escrows
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE ${isUUID ? `id = $${paramIndex}` : `display_id = $${paramIndex}`}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    // Return updated details using the response builder
    const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);

    res.json({
      success: true,
      data: fullResponse.details,
      message: 'Escrow details updated successfully',
    });
  } catch (error) {
    console.error('Error updating escrow details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update escrow details',
      },
    });
  }
}

/**
 * Get escrow property details
 */
async function getEscrowPropertyDetails(req, res) {
  try {
    const { id } = req.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = `
      SELECT
        property_address, property_type, purchase_price,
        bedrooms, bathrooms, square_feet, lot_size_sqft, year_built, garage_spaces, stories,
        pool, spa, view_type, architectural_style, property_condition, zoning,
        apn, mls_number, county, city, state, zip_code, subdivision, cross_streets,
        latitude, longitude, hoa_fee, hoa_frequency, hoa_name, gated_community, senior_community,
        property_features, property_images, list_price, list_date, days_on_market,
        previous_list_price, original_list_price
      FROM escrows
      WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const escrow = result.rows[0];
    const storedFeatures = escrow.property_features || {};
    const storedImages = escrow.property_images || [];

    const propertyDetails = {
      // Basic property info
      address: escrow.property_address || null,
      city: escrow.city || null,
      state: escrow.state || 'CA',
      zipCode: escrow.zip_code || null,
      county: escrow.county || null,

      // Property characteristics
      propertyType: escrow.property_type || 'Single Family',
      bedrooms: escrow.bedrooms || null,
      bathrooms: escrow.bathrooms || null,
      squareFeet: escrow.square_feet || null,
      lotSizeSqft: escrow.lot_size_sqft || null,
      yearBuilt: escrow.year_built || null,
      stories: escrow.stories || null,
      garageSpaces: escrow.garage_spaces || null,

      // Property features
      pool: escrow.pool || false,
      spa: escrow.spa || false,
      viewType: escrow.view_type || null,
      architecturalStyle: escrow.architectural_style || null,
      propertyCondition: escrow.property_condition || null,
      zoning: escrow.zoning || null,

      // Location details
      subdivision: escrow.subdivision || null,
      crossStreets: escrow.cross_streets || null,
      latitude: escrow.latitude || null,
      longitude: escrow.longitude || null,

      // Identifiers
      apn: escrow.apn || null,
      mlsNumber: escrow.mls_number || null,

      // HOA information
      hoaFee: escrow.hoa_fee || null,
      hoaFrequency: escrow.hoa_frequency || null,
      hoaName: escrow.hoa_name || null,
      gatedCommunity: escrow.gated_community || false,
      seniorCommunity: escrow.senior_community || false,

      // Listing information
      listPrice: escrow.list_price || null,
      listDate: escrow.list_date || null,
      daysOnMarket: escrow.days_on_market || null,
      previousListPrice: escrow.previous_list_price || null,
      originalListPrice: escrow.original_list_price || null,

      // Additional features from JSONB
      features: storedFeatures,
      images: storedImages,

      // Pricing
      purchasePrice: parseFloat(escrow.purchase_price) || 0,
      pricePerSqft: escrow.square_feet && escrow.purchase_price
        ? Math.round(parseFloat(escrow.purchase_price) / escrow.square_feet) : null,
    };

    res.json({
      success: true,
      data: propertyDetails,
    });
  } catch (error) {
    console.error('Error fetching escrow property details:', error);
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
 * Update escrow property details
 */
async function updateEscrowPropertyDetails(req, res) {
  try {
    const { id } = req.params;
    const propertyDetails = req.body;

    // Clean the ID
    let cleanId = id;
    if (id.startsWith('escrow-')) {
      cleanId = id.substring(7);
    }

    const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

    // Map frontend property field names to database column names
    const propertyFieldMapping = {
      pool: 'pool',
      spa: 'spa',
      gatedCommunity: 'gated_community',
      gated_community: 'gated_community',
      seniorCommunity: 'senior_community',
      senior_community: 'senior_community',
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      squareFeet: 'square_feet',
      square_feet: 'square_feet',
      yearBuilt: 'year_built',
      year_built: 'year_built',
      garageSpaces: 'garage_spaces',
      garage_spaces: 'garage_spaces',
      stories: 'stories',
      lotSize: 'lot_size_sqft',
      lotSizeSqft: 'lot_size_sqft',
      lot_size_sqft: 'lot_size_sqft',
      propertyType: 'property_type',
      property_type: 'property_type',
    };

    // Build dynamic update query for individual columns
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(propertyDetails).forEach((key) => {
      const dbColumn = propertyFieldMapping[key] || key;
      // Only update fields that are actual database columns
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

    values.push(cleanId);

    // Update individual property columns
    const updateQuery = `
      UPDATE escrows
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE ${isUUIDFormat ? `id = $${paramIndex}` : `display_id = $${paramIndex}`}
      RETURNING id, bedrooms, bathrooms, square_feet, pool, spa,
                gated_community, senior_community, year_built,
                garage_spaces, stories, lot_size_sqft
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
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

/**
 * Get escrow documents
 */
async function getEscrowDocuments(req, res) {
  try {
    const { id } = req.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = `
      SELECT documents
      FROM escrows
      WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const documents = result.rows[0].documents || [];

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Error fetching escrow documents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch escrow documents',
      },
    });
  }
}

/**
 * Update escrow documents
 */
async function updateEscrowDocuments(req, res) {
  try {
    const { id } = req.params;
    const documents = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Documents must be an array',
        },
      });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const updateQuery = `
      UPDATE escrows
      SET documents = $1, updated_at = NOW()
      WHERE ${isUUID ? 'id = $2' : 'display_id = $2'}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [JSON.stringify(documents), id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);

    res.json({
      success: true,
      data: fullResponse.documents,
      message: 'Documents updated successfully',
    });
  } catch (error) {
    console.error('Error updating documents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update documents',
      },
    });
  }
}

module.exports = {
  getEscrowDetails,
  updateEscrowDetails,
  getEscrowPropertyDetails,
  updateEscrowPropertyDetails,
  getEscrowDocuments,
  updateEscrowDocuments,
};
