

// backend/src/models/DeletionRequest.js

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Model for handling deletion requests of various entities.
 * Schema (deletion_requests):
 *   id            TEXT PRIMARY KEY,
 *   entity_type   TEXT NOT NULL,       -- e.g. 'client', 'lead', 'escrow'
 *   entity_id     TEXT NOT NULL,       -- the ID of the entity to delete
 *   requested_by  TEXT NOT NULL,       -- user or API key making the request
 *   reason        TEXT,                -- optional explanation
 *   status        TEXT NOT NULL,       -- 'pending', 'approved', 'rejected'
 *   created_at    TIMESTAMPTZ DEFAULT NOW(),
 *   processed_at  TIMESTAMPTZ
 */
class DeletionRequest {
  /**
   * Create a new deletion request.
   * @param {Object} data
   * @param {string} data.entityType
   * @param {string} data.entityId
   * @param {string} data.requestedBy
   * @param {string} [data.reason]
   * @returns {Promise<Object>}
   */
  static async create({ entityType, entityId, requestedBy, reason = null }) {
    const id = `del_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const sql = `
      INSERT INTO deletion_requests
        (id, entity_type, entity_id, requested_by, reason, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING
        id,
        entity_type   AS "entityType",
        entity_id     AS "entityId",
        requested_by  AS "requestedBy",
        reason,
        status,
        created_at    AS "createdAt"
    `;
    const params = [id, entityType, entityId, requestedBy, reason];
    const { rows } = await query(sql, params);
    return rows[0];
  }

  /**
   * Fetch all deletion requests, optionally filtered by status.
   * @param {Object} [filters]
   * @param {string} [filters.status]
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    let sql = `
      SELECT
        id,
        entity_type   AS "entityType",
        entity_id     AS "entityId",
        requested_by  AS "requestedBy",
        reason,
        status,
        created_at    AS "createdAt",
        processed_at  AS "processedAt"
      FROM deletion_requests
    `;
    const params = [];
    if (filters.status) {
      params.push(filters.status);
      sql += ` WHERE status = $${params.length}`;
    }
    sql += ` ORDER BY created_at DESC`;
    const { rows } = await query(sql, params);
    return rows;
  }

  /**
   * Fetch a single deletion request by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = `
      SELECT
        id,
        entity_type   AS "entityType",
        entity_id     AS "entityId",
        requested_by  AS "requestedBy",
        reason,
        status,
        created_at    AS "createdAt",
        processed_at  AS "processedAt"
      FROM deletion_requests
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Update the status of a deletion request and set processed_at.
   * @param {string} id
   * @param {string} status           -- 'approved' or 'rejected'
   * @returns {Promise<Object|null>}
   */
  static async updateStatus(id, status) {
    const sql = `
      UPDATE deletion_requests
         SET status = $2,
             processed_at = NOW()
       WHERE id = $1
       RETURNING
         id,
         status,
         processed_at AS "processedAt"
    `;
    const { rows } = await query(sql, [id, status]);
    return rows[0] || null;
  }

  /**
   * Permanently delete the request record by ID.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  static async remove(id) {
    const result = await query(
      'DELETE FROM deletion_requests WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = DeletionRequest;