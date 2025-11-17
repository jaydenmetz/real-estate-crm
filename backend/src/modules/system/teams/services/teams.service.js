/**
 * Teams Service
 *
 * Business logic for team management:
 * - Team CRUD operations
 * - Team member management
 * - Access control and permissions
 *
 * Extracted from teams.controller.js for DDD compliance.
 */

const { pool } = require('../../../../config/infrastructure/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all teams (admin only)
 * @param {Object} filters - Query filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Array>} List of teams
 */
exports.getAllTeams = async (filters, user) => {
  const { status, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      t.*,
      (
        SELECT COUNT(*)
        FROM users u
        WHERE u.team_id = t.id AND u.deleted_at IS NULL
      ) as member_count
    FROM teams t
    WHERE t.deleted_at IS NULL
  `;
  const params = [];
  let paramCount = 0;

  if (status) {
    paramCount++;
    query += ` AND t.status = $${paramCount}`;
    params.push(status);
  }

  query += ` ORDER BY t.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Get team by ID
 * @param {string} id - Team ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Team details
 */
exports.getTeamById = async (id, user) => {
  const query = `
    SELECT
      t.*,
      (
        SELECT json_agg(
          json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'role', u.role,
            'created_at', u.created_at
          ) ORDER BY u.created_at
        )
        FROM users u
        WHERE u.team_id = t.id AND u.deleted_at IS NULL
      ) as members
    FROM teams t
    WHERE t.id = $1 AND t.deleted_at IS NULL
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    const error = new Error('Team not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

/**
 * Create team
 * @param {Object} data - Team data
 * @param {Object} user - Authenticated user (must be admin)
 * @returns {Promise<Object>} Created team
 */
exports.createTeam = async (data, user) => {
  const {
    name,
    broker_name,
    broker_license,
    address,
    city,
    state,
    zip_code,
    phone,
    email,
    metadata
  } = data;

  const id = uuidv4();

  const query = `
    INSERT INTO teams (
      id,
      name,
      broker_name,
      broker_license,
      address,
      city,
      state,
      zip_code,
      phone,
      email,
      metadata,
      status,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', NOW(), NOW())
    RETURNING *
  `;

  const result = await pool.query(query, [
    id,
    name,
    broker_name,
    broker_license,
    address,
    city,
    state,
    zip_code,
    phone,
    email,
    metadata ? JSON.stringify(metadata) : null
  ]);

  return result.rows[0];
};

/**
 * Update team
 * @param {string} id - Team ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated team
 */
exports.updateTeam = async (id, data, user) => {
  // Check access
  await exports.getTeamById(id, user);

  const {
    name,
    broker_name,
    broker_license,
    address,
    city,
    state,
    zip_code,
    phone,
    email,
    status,
    metadata
  } = data;

  const updates = [];
  const params = [id];
  let paramCount = 1;

  if (name !== undefined) {
    paramCount++;
    updates.push(`name = $${paramCount}`);
    params.push(name);
  }

  if (broker_name !== undefined) {
    paramCount++;
    updates.push(`broker_name = $${paramCount}`);
    params.push(broker_name);
  }

  if (broker_license !== undefined) {
    paramCount++;
    updates.push(`broker_license = $${paramCount}`);
    params.push(broker_license);
  }

  if (address !== undefined) {
    paramCount++;
    updates.push(`address = $${paramCount}`);
    params.push(address);
  }

  if (city !== undefined) {
    paramCount++;
    updates.push(`city = $${paramCount}`);
    params.push(city);
  }

  if (state !== undefined) {
    paramCount++;
    updates.push(`state = $${paramCount}`);
    params.push(state);
  }

  if (zip_code !== undefined) {
    paramCount++;
    updates.push(`zip_code = $${paramCount}`);
    params.push(zip_code);
  }

  if (phone !== undefined) {
    paramCount++;
    updates.push(`phone = $${paramCount}`);
    params.push(phone);
  }

  if (email !== undefined) {
    paramCount++;
    updates.push(`email = $${paramCount}`);
    params.push(email);
  }

  if (status !== undefined) {
    paramCount++;
    updates.push(`status = $${paramCount}`);
    params.push(status);
  }

  if (metadata !== undefined) {
    paramCount++;
    updates.push(`metadata = $${paramCount}`);
    params.push(metadata ? JSON.stringify(metadata) : null);
  }

  if (updates.length === 0) {
    const error = new Error('No fields to update');
    error.code = 'NO_UPDATES';
    throw error;
  }

  updates.push('updated_at = NOW()');

  const query = `
    UPDATE teams
    SET ${updates.join(', ')}
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return result.rows[0];
};

/**
 * Delete team (soft delete)
 * @param {string} id - Team ID
 * @param {Object} user - Authenticated user (must be admin)
 * @returns {Promise<Object>} Deleted team
 */
exports.deleteTeam = async (id, user) => {
  // Check access
  await exports.getTeamById(id, user);

  const query = `
    UPDATE teams
    SET deleted_at = NOW(), updated_at = NOW(), status = 'inactive'
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/**
 * Get team statistics
 * @param {string} id - Team ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Team statistics
 */
exports.getTeamStats = async (id, user) => {
  const stats = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE team_id = $1 AND deleted_at IS NULL) as total_users,
      (SELECT COUNT(*) FROM clients WHERE team_id = $1 AND deleted_at IS NULL) as total_clients,
      (SELECT COUNT(*) FROM escrows WHERE team_id = $1 AND deleted_at IS NULL) as total_escrows,
      (SELECT COUNT(*) FROM listings WHERE team_id = $1 AND deleted_at IS NULL) as total_listings,
      (SELECT COUNT(*) FROM leads WHERE team_id = $1 AND deleted_at IS NULL) as total_leads
  `, [id]);

  return stats.rows[0];
};
