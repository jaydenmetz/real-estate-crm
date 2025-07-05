

// backend/src/models/Listing.js

const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Listing {
  /**
   * Create a new listing.
   * @param {Object} data
   * @param {string} data.address
   * @param {number} data.price
   * @param {string} [data.status]
   * @param {string} [data.agentId]
   * @returns {Promise<Object>} Created listing
   */
  static async create({ address, price, status = 'Active', agentId = null }) {
    const id = `lst_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const sql = `
      INSERT INTO listings
        (id, address, price, status, agent_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        address,
        price,
        status,
        agent_id    AS "agentId",
        created_at  AS "createdAt"
    `;
    const params = [id, address, price, status, agentId];
    const { rows } = await query(sql, params);
    return rows[0];
  }

  /**
   * Fetch all listings with pagination.
   * @param {Object} filters
   * @param {number} [filters.page]
   * @param {number} [filters.limit]
   * @returns {Promise<Object>} { listings, pagination }
   */
  static async findAll({ page = 1, limit = 20 } = {}) {
    const maxLimit = Math.min(limit, 100);
    const offset = (page - 1) * maxLimit;

    // total count
    const countRes = await query('SELECT COUNT(*) FROM listings');
    const total = parseInt(countRes.rows[0].count, 10);

    // page data
    const sql = `
      SELECT
        id,
        address,
        price,
        status,
        agent_id    AS "agentId",
        created_at  AS "createdAt"
      FROM listings
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const dataRes = await query(sql, [maxLimit, offset]);

    return {
      listings: dataRes.rows,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / maxLimit),
        limit: maxLimit
      }
    };
  }

  /**
   * Fetch a single listing by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = `
      SELECT
        id,
        address,
        price,
        status,
        agent_id    AS "agentId",
        created_at  AS "createdAt",
        updated_at  AS "updatedAt"
      FROM listings
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Update an existing listing.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  static async update(id, { address, price, status, agentId }) {
    const fields = [];
    const params = [id];
    let idx = 2;

    if (address !== undefined) {
      fields.push(`address = $${idx++}`);
      params.push(address);
    }
    if (price !== undefined) {
      fields.push(`price = $${idx++}`);
      params.push(price);
    }
    if (status !== undefined) {
      fields.push(`status = $${idx++}`);
      params.push(status);
    }
    if (agentId !== undefined) {
      fields.push(`agent_id = $${idx++}`);
      params.push(agentId);
    }

    if (!fields.length) {
      return this.findById(id);
    }

    const sql = `
      UPDATE listings
        SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        address,
        price,
        status,
        agent_id    AS "agentId",
        updated_at  AS "updatedAt"
    `;
    const { rows } = await query(sql, params);
    return rows[0] || null;
  }

  /**
   * Delete a listing.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const res = await query('DELETE FROM listings WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  /**
   * Reduce the price of a listing.
   * @param {string} id
   * @param {number} amount
   * @returns {Promise<Object|null>}
   */
  static async priceReduction(id, amount) {
    const sql = `
      UPDATE listings
        SET price = price - $2, updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        address,
        price,
        status,
        agent_id    AS "agentId",
        updated_at  AS "updatedAt"
    `;
    const { rows } = await query(sql, [id, amount]);
    return rows[0] || null;
  }

  /**
   * Log a showing event for a listing.
   * @param {string} id
   * @param {Object} data
   * @param {string} data.showingDate
   * @param {string} data.agentId
   * @param {string} [data.notes]
   * @returns {Promise<Object>}
   */
  static async logShowing(id, { showingDate, agentId, notes = null }) {
    const showId = `shw_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    return await transaction(async (client) => {
      const insertSql = `
        INSERT INTO showings (id, listing_id, showing_date, agent_id, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id            AS "showingId",
          listing_id    AS "listingId",
          showing_date  AS "showingDate",
          agent_id      AS "agentId",
          notes
      `;
      const params = [showId, id, showingDate, agentId, notes];
      const { rows } = await client.query(insertSql, params);

      // Optionally update listings.updated_at
      await client.query(
        'UPDATE listings SET updated_at = NOW() WHERE id = $1',
        [id]
      );

      return rows[0];
    });
  }
}

module.exports = Listing;