

// backend/src/models/Lead.js

const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Lead {
  /**
   * Create a new lead.
   * @param {Object} data
   * @param {string} data.firstName
   * @param {string} data.lastName
   * @param {string} data.email
   * @param {string} data.phone
   * @param {string} [data.status]
   * @returns {Promise<Object>} created lead
   */
  static async create({ firstName, lastName, email, phone, status = 'new' }) {
    const id = `led_${uuidv4().replace(/-/g, '').substring(0,12)}`;
    const sql = `
      INSERT INTO leads
        (id, first_name, last_name, email, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        first_name  AS "firstName",
        last_name   AS "lastName",
        email,
        phone,
        status,
        created_at  AS "createdAt"
    `;
    const params = [id, firstName, lastName, email, phone, status];
    const { rows } = await query(sql, params);
    return rows[0];
  }

  /**
   * Fetch paginated leads, with optional status filter.
   * @param {Object} filters
   * @param {string} [filters.status]
   * @param {number} [filters.page]
   * @param {number} [filters.limit]
   * @returns {Promise<Object>} { leads, pagination }
   */
  static async findAll({ status, page = 1, limit = 20 } = {}) {
    const maxLimit = Math.min(limit, 100);
    const offset = (page - 1) * maxLimit;
    const params = [];
    let whereClause = '';

    if (status) {
      params.push(status);
      whereClause = `WHERE status = $${params.length}`;
    }

    // Total count
    const countSql = `SELECT COUNT(*) FROM leads ${whereClause}`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // Data query
    params.push(maxLimit, offset);
    const dataSql = `
      SELECT
        id,
        first_name  AS "firstName",
        last_name   AS "lastName",
        email,
        phone,
        status,
        created_at  AS "createdAt"
      FROM leads
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const dataRes = await query(dataSql, params);

    return {
      leads: dataRes.rows,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / maxLimit),
        limit: maxLimit
      }
    };
  }

  /**
   * Fetch a single lead by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = `
      SELECT
        id,
        first_name  AS "firstName",
        last_name   AS "lastName",
        email,
        phone,
        status,
        created_at  AS "createdAt",
        updated_at  AS "updatedAt"
      FROM leads
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Update an existing lead.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  static async update(id, { firstName, lastName, email, phone, status }) {
    const fields = [];
    const params = [id];
    let idx = 2;

    if (firstName !== undefined) {
      fields.push(`first_name = $${idx++}`);
      params.push(firstName);
    }
    if (lastName !== undefined) {
      fields.push(`last_name = $${idx++}`);
      params.push(lastName);
    }
    if (email !== undefined) {
      fields.push(`email = $${idx++}`);
      params.push(email);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      params.push(phone);
    }
    if (status !== undefined) {
      fields.push(`status = $${idx++}`);
      params.push(status);
    }

    if (!fields.length) {
      return this.findById(id);
    }

    const sql = `
      UPDATE leads
        SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        first_name  AS "firstName",
        last_name   AS "lastName",
        email,
        phone,
        status,
        updated_at  AS "updatedAt"
    `;
    const { rows } = await query(sql, params);
    return rows[0] || null;
  }

  /**
   * Delete a lead.
   * @param {string} id
   * @returns {Promise<boolean>} true if deleted
   */
  static async delete(id) {
    const res = await query('DELETE FROM leads WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  /**
   * Log an activity for the lead.
   * @param {string} leadId
   * @param {string} activity
   * @returns {Promise<Object>} logged activity record
   */
  static async logActivity(leadId, activity) {
    const activityId = `act_${uuidv4().replace(/-/g, '').substring(0,12)}`;
    const sql = `
      INSERT INTO lead_activities
        (id, lead_id, activity, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING
        id               AS "activityId",
        lead_id          AS "leadId",
        activity,
        created_at       AS "createdAt"
    `;
    const { rows } = await query(sql, [activityId, leadId, activity]);
    return rows[0];
  }
}

module.exports = Lead;