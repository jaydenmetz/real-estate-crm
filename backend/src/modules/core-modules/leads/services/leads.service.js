/**
 * Leads Service Layer
 *
 * Business logic for leads management:
 * - Query building with filtering, pagination, and ownership
 * - Lead creation with validation
 * - Lead updates with optimistic locking
 * - Archive and deletion operations
 * - Batch operations with transactions
 * - WebSocket event broadcasting
 *
 * @module services/leads
 */

const { pool } = require('../../../../config/infrastructure/database');
const logger = require('../../../../utils/logger');
const websocketService = require('../../../../lib/infrastructure/websocket.service');
const { buildOwnershipWhereClause, validateScope, getDefaultScope } = require('../../../../utils/ownership.helper');

class LeadsService {
  /**
   * Get all leads with filtering, pagination, and ownership scoping
   * @param {Object} filters - Query filters (leadStatus, search, page, limit)
   * @param {Object} user - Current user (for ownership filtering)
   * @returns {Promise<Object>} { leads: [], pagination: {} }
   */
  async getAllLeads(filters, user) {
    const {
      leadStatus,
      leadType,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const offset = (page - 1) * limit;
    const whereConditions = ['deleted_at IS NULL'];
    const queryParams = [];
    let paramIndex = 1;

    // Status filter
    if (leadStatus) {
      whereConditions.push(`lead_status = $${paramIndex}`);
      queryParams.push(leadStatus);
      paramIndex++;
    }

    // Type filter - column doesn't exist yet, skipping
    // TODO: Add lead_type column to leads table
    // if (leadType) {
    //   whereConditions.push(`lead_type = $${paramIndex}`);
    //   queryParams.push(leadType);
    //   paramIndex++;
    // }

    // Search filter
    if (search) {
      whereConditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Handle ownership-based scope filtering with PRIVACY (multi-tenant)
    // IMPORTANT: Leads support is_private flag - brokers cannot see private leads
    const userRole = Array.isArray(user?.role) ? user.role[0] : user?.role;
    const requestedScope = filters.scope || getDefaultScope(userRole);
    const scope = validateScope(requestedScope, userRole);

    // Build ownership filter with privacy support (no table alias)
    const ownershipFilter = buildOwnershipWhereClause(
      user.id,
      userRole,
      user.broker_id,
      user.team_id || user.teamId,
      'lead',
      scope,
      paramIndex
    );

    if (ownershipFilter.whereClause && ownershipFilter.whereClause !== '1=1') {
      whereConditions.push(ownershipFilter.whereClause);
      queryParams.push(...ownershipFilter.params);
      paramIndex = ownershipFilter.nextParamIndex;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM leads ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get paginated data
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT * FROM leads
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await pool.query(dataQuery, queryParams);

    return {
      leads: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit),
      },
    };
  }

  /**
   * Get single lead by ID
   * @param {string} id - Lead ID
   * @returns {Promise<Object|null>} Lead object or null if not found
   */
  async getLeadById(id) {
    const query = 'SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Create a new lead
   * @param {Object} leadData - Lead data
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Created lead
   * @throws {Error} If validation fails
   */
  async createLead(leadData, user) {
    const {
      firstName,
      lastName,
      email,
      phone,
      source,
      notes,
      budget,
      leadStatus = 'New',
      leadScore = 0,
      leadTemperature = 'Cold',
    } = leadData;

    // Validation
    if (!firstName || !lastName) {
      const error = new Error('First name and last name are required');
      error.code = 'MISSING_FIELDS';
      throw error;
    }

    const query = `
      INSERT INTO leads (
        first_name, last_name, email, phone, lead_source,
        notes, budget, lead_status, lead_score, lead_temperature,
        assigned_agent_id, team_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      firstName,
      lastName,
      email || null,
      phone || null,
      source || null,
      notes || null,
      budget || null,
      leadStatus,
      leadScore,
      leadTemperature,
      user?.id || null,
      user?.teamId || user?.team_id || null,
    ];

    const result = await pool.query(query, values);
    const newLead = result.rows[0];

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'created', newLead);

    return newLead;
  }

  /**
   * Update an existing lead
   * @param {string} id - Lead ID
   * @param {Object} updates - Fields to update
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Updated lead
   * @throws {Error} If lead not found or version conflict
   */
  async updateLead(id, updates, user) {
    // Build dynamic update query
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'lead_source',
      'lead_status', 'lead_score', 'lead_temperature', 'notes',
      'property_interest', 'budget', 'budget_range', 'timeline', 'next_follow_up',
      'display_name',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      const error = new Error('No valid fields to update');
      error.code = 'NO_UPDATES';
      throw error;
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    setClause.push('last_contact_date = CURRENT_DATE');
    setClause.push('version = version + 1');
    setClause.push(`last_modified_by = $${paramIndex}`);
    values.push(user?.id || null);
    paramIndex++;

    // Optimistic locking: check version if provided
    const { version: clientVersion } = updates;
    let versionClause = '';
    if (clientVersion !== undefined) {
      versionClause = ` AND version = $${paramIndex}`;
      values.push(clientVersion);
      paramIndex++;
    }

    values.push(id);

    const query = `
      UPDATE leads
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL${versionClause}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      // Check if record exists but version mismatch
      if (clientVersion !== undefined) {
        const checkQuery = 'SELECT version FROM leads WHERE id = $1 AND deleted_at IS NULL';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
          const error = new Error('Lead not found');
          error.code = 'NOT_FOUND';
          throw error;
        }

        const error = new Error('This lead was modified by another user. Please refresh and try again.');
        error.code = 'VERSION_CONFLICT';
        error.currentVersion = checkResult.rows[0].version;
        error.attemptedVersion = clientVersion;
        throw error;
      }

      const error = new Error('Lead not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    const updatedLead = result.rows[0];

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'updated', updatedLead);

    return updatedLead;
  }

  /**
   * Archive a lead (soft delete)
   * @param {string} id - Lead ID
   * @returns {Promise<Object>} Archived lead
   * @throws {Error} If lead not found
   */
  async archiveLead(id) {
    const query = `
      UPDATE leads
      SET deleted_at = CURRENT_TIMESTAMP, lead_status = 'archived', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      const error = new Error('Lead not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    return result.rows[0];
  }

  /**
   * Permanently delete a lead (must be archived first)
   * @param {string} id - Lead ID
   * @param {Object} user - Current user
   * @returns {Promise<void>}
   * @throws {Error} If lead not found or not archived
   */
  async deleteLead(id, user) {
    // Check if lead is archived
    const checkQuery = 'SELECT deleted_at FROM leads WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      const error = new Error('Lead not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (!checkResult.rows[0].deleted_at) {
      const error = new Error('Lead must be archived before deletion');
      error.code = 'NOT_ARCHIVED';
      throw error;
    }

    const deleteQuery = 'DELETE FROM leads WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'deleted', { id });
  }

  /**
   * Batch delete multiple leads (must be archived first)
   * @param {string[]} ids - Array of lead IDs
   * @param {Object} user - Current user
   * @returns {Promise<Object>} { deletedCount, deletedIds }
   * @throws {Error} If any lead is not archived
   */
  async batchDeleteLeads(ids, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check which leads exist and are archived
      const existCheckQuery = `
        SELECT id, deleted_at FROM leads
        WHERE id = ANY($1)
      `;
      const existResult = await client.query(existCheckQuery, [ids]);

      if (existResult.rows.length === 0) {
        await client.query('COMMIT');
        return {
          deletedCount: 0,
          deletedIds: [],
        };
      }

      // Check if any are not archived
      const activeLeads = existResult.rows.filter((r) => !r.deleted_at);
      if (activeLeads.length > 0) {
        await client.query('ROLLBACK');
        const activeIds = activeLeads.map((r) => r.id);
        const error = new Error(`Some leads are not archived: ${activeIds.join(', ')}`);
        error.code = 'NOT_ARCHIVED';
        throw error;
      }

      // Delete archived leads
      const existingIds = existResult.rows.map((r) => r.id);
      const deleteQuery = 'DELETE FROM leads WHERE id = ANY($1) RETURNING id';
      const result = await client.query(deleteQuery, [existingIds]);

      await client.query('COMMIT');

      logger.info('Batch deleted leads', {
        count: result.rowCount,
        ids: result.rows.map((r) => r.id),
      });

      return {
        deletedCount: result.rowCount,
        deletedIds: result.rows.map((r) => r.id),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Emit WebSocket event for lead changes
   * @private
   * @param {Object} user - Current user
   * @param {string} action - Action type (created, updated, deleted)
   * @param {Object} lead - Lead data
   */
  _emitWebSocketEvent(user, action, lead) {
    const teamId = user?.teamId || user?.team_id;
    const userId = user?.id;
    const eventData = {
      entityType: 'lead',
      entityId: lead.id,
      action,
      data: { id: lead.id },
    };

    if (teamId) {
      websocketService.sendToTeam(teamId, 'data:update', eventData);
    }
    if (userId) {
      websocketService.sendToUser(userId, 'data:update', eventData);
    }
  }
}

module.exports = new LeadsService();
