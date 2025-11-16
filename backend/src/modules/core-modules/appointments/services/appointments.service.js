/**
 * Appointments Service
 *
 * Business logic layer for appointments module.
 * Handles all appointment-related operations including:
 * - CRUD operations
 * - Query building with filters and pagination
 * - Ownership-based access control
 * - WebSocket event emissions
 * - Transaction management
 *
 * @module modules/appointments/services/appointments
 */

const { pool } = require('../../../../config/infrastructure/database');
const logger = require('../../../../utils/logger');
const websocketService = require('../../../../lib/infrastructure/websocket.service');
const { buildOwnershipWhereClauseWithAlias, validateScope, getDefaultScope } = require('../../../../utils/ownership.helper');

class AppointmentsService {
  /**
   * Get all appointments with filtering, pagination, and ownership controls
   * @param {Object} filters - Filter parameters
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Appointments list with pagination metadata
   */
  async getAllAppointments(filters, user) {
    const {
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20,
      scope: requestedScope,
    } = filters;

    const offset = (page - 1) * limit;
    const whereConditions = ['a.deleted_at IS NULL'];
    const queryParams = [];
    let paramIndex = 1;

    // Date range filter
    if (startDate) {
      whereConditions.push(`a.appointment_date >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`a.appointment_date <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    // Status filter
    if (status) {
      whereConditions.push(`a.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    // Handle ownership-based scope filtering with inherited privacy
    const userRole = Array.isArray(user?.role) ? user.role[0] : user?.role;
    const scope = validateScope(requestedScope || getDefaultScope(userRole), userRole);

    // Build ownership filter (appointments table alias is 'a')
    const ownershipFilter = buildOwnershipWhereClauseWithAlias(
      user,
      scope,
      'appointment',
      'a',
      paramIndex
    );

    if (ownershipFilter.whereClause && ownershipFilter.whereClause !== '1=1') {
      whereConditions.push(ownershipFilter.whereClause);
      queryParams.push(...ownershipFilter.params);
      paramIndex = ownershipFilter.nextParamIndex;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query for total count
    const countQuery = `SELECT COUNT(*) as count FROM appointments a ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Query for paginated data with client name
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT
        a.*,
        COALESCE(c.full_name, c.first_name || ' ' || c.last_name) AS client_name
      FROM appointments a
      LEFT JOIN clients cl ON a.client_id = cl.id
      LEFT JOIN contacts c ON cl.contact_id = c.id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.start_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await pool.query(dataQuery, queryParams);

    return {
      appointments: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit),
      },
    };
  }

  /**
   * Get single appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise<Object|null>} Appointment data or null if not found
   */
  async getAppointmentById(id) {
    const query = 'SELECT * FROM appointments WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Create new appointment
   * @param {Object} appointmentData - Appointment data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Created appointment
   */
  async createAppointment(appointmentData, user) {
    const {
      title,
      appointmentDate,
      startTime,
      endTime,
      location,
      appointmentType = 'Property Showing',
      description,
      status = 'Scheduled',
      clientId,
      listingId,
    } = appointmentData;

    // Validation
    if (!title || !appointmentDate || !startTime) {
      throw new Error('Title, date, and start time are required');
    }

    const query = `
      INSERT INTO appointments (
        title, appointment_date, start_time, end_time, location,
        appointment_type, description, status, client_id, listing_id,
        agent_id, team_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      title,
      appointmentDate,
      startTime,
      endTime || null,
      location || null,
      appointmentType,
      description || null,
      status,
      clientId || null,
      listingId || null,
      user?.id || null,
      user?.teamId || user?.team_id || null,
    ];

    const result = await pool.query(query, values);
    const newAppt = result.rows[0];

    // Emit WebSocket event for real-time updates
    this._emitWebSocketEvent(user, 'created', newAppt);

    return newAppt;
  }

  /**
   * Update existing appointment
   * @param {string} id - Appointment ID
   * @param {Object} updates - Fields to update
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object|null>} Updated appointment or null if not found/conflict
   */
  async updateAppointment(id, updates, user) {
    // Build dynamic update query
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'title', 'appointment_date', 'start_time', 'end_time', 'location',
      'appointment_type', 'description', 'status', 'client_id', 'listing_id',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
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
      UPDATE appointments
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL${versionClause}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    // Emit WebSocket event for updated appointment
    if (result.rows.length > 0) {
      const updatedAppt = result.rows[0];
      this._emitWebSocketEvent(user, 'updated', updatedAppt);
      return updatedAppt;
    }

    // Check for version conflict
    if (clientVersion !== undefined) {
      const checkQuery = 'SELECT version FROM appointments WHERE id = $1 AND deleted_at IS NULL';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return null; // Not found
      }

      // Version conflict
      throw new Error('VERSION_CONFLICT');
    }

    return null; // Not found
  }

  /**
   * Archive appointment (soft delete)
   * @param {string} id - Appointment ID
   * @returns {Promise<Object|null>} Archived appointment or null if not found
   */
  async archiveAppointment(id) {
    const query = `
      UPDATE appointments
      SET deleted_at = CURRENT_TIMESTAMP, status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Permanently delete appointment (must be archived first)
   * @param {string} id - Appointment ID
   * @param {Object} user - Authenticated user
   * @returns {Promise<boolean>} True if deleted, false if not found or not archived
   */
  async deleteAppointment(id, user) {
    // Check if appointment is archived
    const checkQuery = 'SELECT deleted_at FROM appointments WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return null; // Not found
    }

    if (!checkResult.rows[0].deleted_at) {
      throw new Error('Appointment must be archived before deletion');
    }

    const deleteQuery = 'DELETE FROM appointments WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    // Emit WebSocket event for deleted appointment
    this._emitWebSocketEvent(user, 'deleted', { id });

    return true;
  }

  /**
   * Batch delete multiple appointments (must be archived)
   * @param {Array<string>} ids - Appointment IDs
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Deletion results
   */
  async batchDeleteAppointments(ids, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check which appointments exist and are archived
      const existCheckQuery = `
        SELECT id, deleted_at FROM appointments
        WHERE id = ANY($1)
      `;
      const existResult = await client.query(existCheckQuery, [ids]);

      if (existResult.rows.length === 0) {
        await client.query('COMMIT');
        return {
          deletedCount: 0,
          deletedIds: [],
          message: 'No appointments found to delete',
        };
      }

      // Check if any are not archived
      const activeAppointments = existResult.rows.filter((r) => !r.deleted_at);
      if (activeAppointments.length > 0) {
        await client.query('ROLLBACK');
        const activeIds = activeAppointments.map((r) => r.id);
        throw new Error(`Some appointments are not archived: ${activeIds.join(', ')}`);
      }

      // Delete archived appointments
      const existingIds = existResult.rows.map((r) => r.id);
      const deleteQuery = 'DELETE FROM appointments WHERE id = ANY($1) RETURNING id';
      const result = await client.query(deleteQuery, [existingIds]);

      await client.query('COMMIT');

      logger.info('Batch deleted appointments', {
        count: result.rowCount,
        ids: result.rows.map((r) => r.id),
      });

      return {
        deletedCount: result.rowCount,
        deletedIds: result.rows.map((r) => r.id),
        message: `Successfully deleted ${result.rowCount} appointments`,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Emit WebSocket event for appointment changes
   * @private
   * @param {Object} user - Authenticated user
   * @param {string} action - Action type (created, updated, deleted)
   * @param {Object} appointment - Appointment data
   */
  _emitWebSocketEvent(user, action, appointment) {
    const teamId = user?.teamId || user?.team_id;
    const userId = user?.id;
    const eventData = {
      entityType: 'appointment',
      entityId: appointment.id,
      action,
      data: action === 'deleted'
        ? { id: appointment.id }
        : { id: appointment.id, title: appointment.title, appointmentDate: appointment.appointment_date }
    };

    if (teamId) websocketService.sendToTeam(teamId, 'data:update', eventData);
    if (userId) websocketService.sendToUser(userId, 'data:update', eventData);
  }
}

module.exports = new AppointmentsService();
