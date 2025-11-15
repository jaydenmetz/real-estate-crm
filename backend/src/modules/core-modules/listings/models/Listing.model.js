const { v4: uuidv4 } = require('uuid');
const { query } = require('../../../../config/database');

class Listing {
  static async create(data) {
    const id = `list_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    const text = `
      INSERT INTO listings (
        id, property_address, mls_number, listing_status, list_price,
        original_list_price, price_per_sqft, property_type, bedrooms,
        bathrooms, square_footage, lot_size, year_built, garage, pool,
        listing_date, expiration_date, marketing_budget, virtual_tour_link,
        professional_photos, drone_photos, video_walkthrough,
        listing_commission, buyer_agent_commission, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `;

    const values = [
      id,
      data.propertyAddress,
      data.mlsNumber,
      data.listingStatus || 'Active',
      data.listPrice,
      data.originalListPrice || data.listPrice,
      data.listPrice && data.squareFootage ? (data.listPrice / data.squareFootage) : null,
      data.propertyType,
      data.bedrooms,
      data.bathrooms,
      data.squareFootage,
      data.lotSize,
      data.yearBuilt,
      data.garage,
      data.pool || false,
      data.listingDate,
      data.expirationDate,
      data.marketingBudget,
      data.virtualTourLink,
      data.professionalPhotos || false,
      data.dronePhotos || false,
      data.videoWalkthrough || false,
      data.listingCommission,
      data.buyerAgentCommission,
      data.tags || [],
    ];

    const result = await query(text, values);

    // Add sellers
    if (data.sellers && data.sellers.length > 0) {
      await this.addSellers(id, data.sellers);
    }

    // Record initial price
    await this.recordPriceHistory(id, data.listPrice, data.listingDate, 'Initial listing');

    return this.findById(id);
  }

  static async findAll(filters = {}) {
    let text = `
      SELECT l.*, 
        array_agg(DISTINCT jsonb_build_object('id', ls.client_id, 'name', c.first_name || ' ' || c.last_name)) FILTER (WHERE ls.client_id IS NOT NULL) as sellers,
        COUNT(*) OVER() as total_count
      FROM listings l
      LEFT JOIN listing_sellers ls ON l.id = ls.listing_id
      LEFT JOIN clients c ON ls.client_id = c.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      text += ` AND l.listing_status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.minPrice) {
      paramCount++;
      text += ` AND l.list_price >= $${paramCount}`;
      values.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      paramCount++;
      text += ` AND l.list_price <= $${paramCount}`;
      values.push(filters.maxPrice);
    }

    if (filters.propertyType) {
      paramCount++;
      text += ` AND l.property_type = $${paramCount}`;
      values.push(filters.propertyType);
    }

    text += ' GROUP BY l.id';

    // Add sorting
    const sortField = filters.sort || 'created_at';
    const sortOrder = filters.order === 'asc' ? 'ASC' : 'DESC';
    text += ` ORDER BY l.${sortField} ${sortOrder}`;

    // Add pagination
    const limit = Math.min(filters.limit || 20, 100);
    const offset = ((filters.page || 1) - 1) * limit;
    text += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await query(text, values);

    return {
      listings: result.rows,
      total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
      page: filters.page || 1,
      pages: result.rows.length > 0 ? Math.ceil(result.rows[0].total_count / limit) : 0,
    };
  }

  static async findById(id) {
    const text = `
      SELECT l.*, 
        array_agg(DISTINCT jsonb_build_object('id', ls.client_id, 'name', c.first_name || ' ' || c.last_name)) FILTER (WHERE ls.client_id IS NOT NULL) as sellers,
        array_agg(DISTINCT lph.*) FILTER (WHERE lph.id IS NOT NULL) as price_history,
        array_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL) as documents,
        array_agg(DISTINCT n.*) FILTER (WHERE n.id IS NOT NULL) as notes
      FROM listings l
      LEFT JOIN listing_sellers ls ON l.id = ls.listing_id
      LEFT JOIN clients c ON ls.client_id = c.id
      LEFT JOIN listing_price_history lph ON l.id = lph.listing_id
      LEFT JOIN documents d ON d.entity_id = l.id AND d.entity_type = 'listing'
      LEFT JOIN notes n ON n.entity_id = l.id AND n.entity_type = 'listing'
      WHERE l.id = $1
      GROUP BY l.id
    `;

    const result = await query(text, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async update(id, data) {
    const fields = [];
    const values = [id];
    let paramCount = 1;

    Object.keys(data).forEach((key) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'sellers') {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(data[key]);
      }
    });

    fields.push('updated_at = NOW()');

    const text = `
      UPDATE listings 
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    await query(text, values);
    return this.findById(id);
  }

  static async recordPriceReduction(id, data) {
    // Update listing price
    await query(
      'UPDATE listings SET list_price = $2, updated_at = NOW() WHERE id = $1',
      [id, data.newPrice],
    );

    // Record price history
    return this.recordPriceHistory(id, data.newPrice, data.effectiveDate, data.reason);
  }

  static async recordPriceHistory(listingId, price, date, reason) {
    const text = `
      INSERT INTO listing_price_history (listing_id, price, date, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await query(text, [listingId, price, date, reason]);
    return result.rows[0];
  }

  static async logShowing(id, showingData) {
    // Update showing counts
    await query(
      'UPDATE listings SET total_showings = total_showings + 1 WHERE id = $1',
      [id],
    );

    // Log communication
    const text = `
      INSERT INTO communications (
        entity_type, entity_id, type, direction, content, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const values = [
      'listing',
      id,
      'showing',
      'inbound',
      JSON.stringify(showingData),
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  static async addSellers(listingId, sellerIds) {
    const values = sellerIds.map((sellerId) => `('${listingId}', '${sellerId}')`).join(',');
    const text = `INSERT INTO listing_sellers (listing_id, client_id) VALUES ${values} ON CONFLICT DO NOTHING`;
    await query(text);
  }
}

module.exports = Listing;
