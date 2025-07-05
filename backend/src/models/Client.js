
// backend/src/models/Client.js

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Model for Client entities.
 * Provides methods to interact with the clients table.
 */
class Client {
  /**
   * Fetch all clients.
   * @returns {Promise<Array>} List of clients.
   */
  static async findAll() {
    const sql = `
      SELECT
        id,
        first_name    AS "firstName",
        last_name     AS "lastName"
      FROM clients
      ORDER BY last_name ASC, first_name ASC
    `;
    const { rows } = await query(sql);
    return rows;
  }

  /**
   * Fetch a single client by ID.
   * @param {string} id
   * @returns {Promise<Object|null>} Client or null if not found.
   */
  static async findById(id) {
    const sql = `
      SELECT
        id,
        first_name    AS "firstName",
        last_name     AS "lastName"
      FROM clients
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Create a new client.
   * @param {Object} data
   * @param {string} data.firstName
   * @param {string} data.lastName
   * @returns {Promise<Object>} Created client.
   */
  static async create({ firstName, lastName }) {
    const id = `cli_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const sql = `
      INSERT INTO clients (id, first_name, last_name)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        first_name    AS "firstName",
        last_name     AS "lastName"
    `;
    const { rows } = await query(sql, [id, firstName, lastName]);
    return rows[0];
  }

  /**
   * Update an existing client.
   * @param {string} id
   * @param {Object} data
   * @param {string} [data.firstName]
   * @param {string} [data.lastName]
   * @returns {Promise<Object|null>} Updated client or null.
   */
  static async update(id, { firstName, lastName }) {
    const sql = `
      UPDATE clients
         SET first_name = COALESCE($2, first_name),
             last_name  = COALESCE($3, last_name),
             updated_at = NOW()
       WHERE id = $1
       RETURNING
         id,
         first_name    AS "firstName",
         last_name     AS "lastName",
         updated_at    AS "updatedAt"
    `;
    const { rows } = await query(sql, [id, firstName, lastName]);
    return rows[0] || null;
  }

  /**
   * Delete a client by ID.
   * @param {string} id
   * @returns {Promise<boolean>} True if deleted, false otherwise.
   */
  static async delete(id) {
    const result = await query('DELETE FROM clients WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = Client;