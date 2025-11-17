/**
 * Waitlist Service
 *
 * Business logic for waitlist management.
 * Simple CRUD service for DDD compliance.
 */

const { pool } = require('../../../../config/infrastructure/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Add to waitlist
 * @param {Object} data - Waitlist entry data
 * @returns {Promise<Object>} Created entry
 */
exports.addToWaitlist = async (data) => {
  const { email, name, company, notes } = data;

  const id = uuidv4();

  const result = await pool.query(
    `INSERT INTO waitlist (id, email, name, company, notes, status, created_at)
     VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
     RETURNING *`,
    [id, email, name, company, notes]
  );

  return result.rows[0];
};

/**
 * Get all waitlist entries
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Waitlist entries
 */
exports.getAllEntries = async (filters) => {
  const { status } = filters;

  let query = 'SELECT * FROM waitlist WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Update waitlist entry status
 * @param {string} id - Entry ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated entry
 */
exports.updateStatus = async (id, status) => {
  const result = await pool.query(
    'UPDATE waitlist SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Waitlist entry not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};
