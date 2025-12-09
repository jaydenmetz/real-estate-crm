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

    // Query for paginated data with client name, stops count, attendees count, and first stop address
    // Note: a.display_name is included via a.* - if null, frontend will compute it
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT
        a.*,
        COALESCE(c.full_name, c.first_name || ' ' || c.last_name) AS client_name,
        COALESCE(stops_agg.stop_count, 0) AS stop_count,
        COALESCE(attendees_agg.attendee_count, 0) AS attendee_count,
        stops_agg.first_stop_address,
        stops_agg.first_stop_city,
        stops_agg.first_stop_state,
        stops_agg.first_stop_zip,
        stops_agg.first_stop_time
      FROM appointments a
      LEFT JOIN clients cl ON a.client_id = cl.id
      LEFT JOIN contacts c ON cl.contact_id = c.id
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS stop_count,
          MIN(CASE WHEN stop_order = 1 THEN location_address END) AS first_stop_address,
          MIN(CASE WHEN stop_order = 1 THEN city END) AS first_stop_city,
          MIN(CASE WHEN stop_order = 1 THEN state END) AS first_stop_state,
          MIN(CASE WHEN stop_order = 1 THEN zip_code END) AS first_stop_zip,
          MIN(CASE WHEN stop_order = 1 THEN scheduled_time END) AS first_stop_time
        FROM appointment_stops
        WHERE appointment_id = a.id
      ) stops_agg ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS attendee_count
        FROM appointment_attendees
        WHERE appointment_id = a.id
      ) attendees_agg ON true
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.start_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await pool.query(dataQuery, queryParams);

    // Fetch attendees for each appointment
    const appointmentIds = dataResult.rows.map(a => a.id);
    if (appointmentIds.length > 0) {
      const attendeesQuery = `
        SELECT
          aa.*,
          CASE
            WHEN aa.client_id IS NOT NULL THEN COALESCE(c_client.full_name, c_client.first_name || ' ' || c_client.last_name)
            WHEN aa.lead_id IS NOT NULL THEN COALESCE(l.first_name || ' ' || l.last_name, l.email)
            WHEN aa.contact_id IS NOT NULL THEN COALESCE(c_contact.full_name, c_contact.first_name || ' ' || c_contact.last_name)
            ELSE aa.display_name
          END AS resolved_name,
          CASE
            WHEN aa.client_id IS NOT NULL THEN c_client.email
            WHEN aa.lead_id IS NOT NULL THEN l.email
            WHEN aa.contact_id IS NOT NULL THEN c_contact.email
            ELSE aa.email
          END AS resolved_email
        FROM appointment_attendees aa
        LEFT JOIN clients cl_client ON aa.client_id = cl_client.id
        LEFT JOIN contacts c_client ON cl_client.contact_id = c_client.id
        LEFT JOIN leads l ON aa.lead_id = l.id
        LEFT JOIN contacts c_contact ON aa.contact_id = c_contact.id
        WHERE aa.appointment_id = ANY($1)
        ORDER BY aa.is_primary DESC, aa.created_at ASC
      `;
      const attendeesResult = await pool.query(attendeesQuery, [appointmentIds]);

      // Group attendees by appointment_id
      const attendeesByAppointment = {};
      attendeesResult.rows.forEach(attendee => {
        if (!attendeesByAppointment[attendee.appointment_id]) {
          attendeesByAppointment[attendee.appointment_id] = [];
        }
        attendeesByAppointment[attendee.appointment_id].push(attendee);
      });

      // Attach attendees to appointments
      dataResult.rows.forEach(appointment => {
        appointment.attendees = attendeesByAppointment[appointment.id] || [];
      });
    }

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
   * Get single appointment by ID with stops and attendees
   * @param {string} id - Appointment ID
   * @returns {Promise<Object|null>} Appointment data or null if not found
   */
  async getAppointmentById(id) {
    const query = `
      SELECT a.*,
        COALESCE(c.full_name, c.first_name || ' ' || c.last_name) AS client_name
      FROM appointments a
      LEFT JOIN clients cl ON a.client_id = cl.id
      LEFT JOIN contacts c ON cl.contact_id = c.id
      WHERE a.id = $1 AND a.deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const appointment = result.rows[0];

    // Fetch stops
    const stopsQuery = `
      SELECT * FROM appointment_stops
      WHERE appointment_id = $1
      ORDER BY stop_order ASC
    `;
    const stopsResult = await pool.query(stopsQuery, [id]);
    appointment.stops = stopsResult.rows;

    // Fetch attendees with contact info
    const attendeesQuery = `
      SELECT
        aa.*,
        CASE
          WHEN aa.client_id IS NOT NULL THEN COALESCE(c_client.full_name, c_client.first_name || ' ' || c_client.last_name)
          WHEN aa.lead_id IS NOT NULL THEN COALESCE(l.first_name || ' ' || l.last_name, l.email)
          WHEN aa.contact_id IS NOT NULL THEN COALESCE(c_contact.full_name, c_contact.first_name || ' ' || c_contact.last_name)
          ELSE aa.display_name
        END AS resolved_name,
        CASE
          WHEN aa.client_id IS NOT NULL THEN c_client.email
          WHEN aa.lead_id IS NOT NULL THEN l.email
          WHEN aa.contact_id IS NOT NULL THEN c_contact.email
          ELSE aa.email
        END AS resolved_email,
        CASE
          WHEN aa.client_id IS NOT NULL THEN c_client.phone
          WHEN aa.lead_id IS NOT NULL THEN l.phone
          WHEN aa.contact_id IS NOT NULL THEN c_contact.phone
          ELSE aa.phone
        END AS resolved_phone
      FROM appointment_attendees aa
      LEFT JOIN clients cl_client ON aa.client_id = cl_client.id
      LEFT JOIN contacts c_client ON cl_client.contact_id = c_client.id
      LEFT JOIN leads l ON aa.lead_id = l.id
      LEFT JOIN contacts c_contact ON aa.contact_id = c_contact.id
      WHERE aa.appointment_id = $1
      ORDER BY aa.is_primary DESC, aa.created_at ASC
    `;
    const attendeesResult = await pool.query(attendeesQuery, [id]);
    appointment.attendees = attendeesResult.rows;

    return appointment;
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

  // ============================================================================
  // STOPS MANAGEMENT
  // ============================================================================

  /**
   * Add a stop to an appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Object} stopData - Stop data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Created stop
   */
  async addStop(appointmentId, stopData, user) {
    const {
      locationAddress,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      scheduledTime,
      estimatedDuration = 30,
      notes,
    } = stopData;

    // Get current max stop_order
    const maxOrderQuery = `
      SELECT COALESCE(MAX(stop_order), 0) as max_order
      FROM appointment_stops
      WHERE appointment_id = $1
    `;
    const maxOrderResult = await pool.query(maxOrderQuery, [appointmentId]);
    const nextOrder = maxOrderResult.rows[0].max_order + 1;

    const query = `
      INSERT INTO appointment_stops (
        appointment_id, stop_order, location_address, city, state, zip_code,
        latitude, longitude, scheduled_time, estimated_duration, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      appointmentId,
      nextOrder,
      locationAddress || null,
      city || null,
      state || null,
      zipCode || null,
      latitude || null,
      longitude || null,
      scheduledTime || null,
      estimatedDuration,
      notes || null,
    ];

    const result = await pool.query(query, values);

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'updated', { id: appointmentId, title: 'Stop added' });

    return result.rows[0];
  }

  /**
   * Update a stop
   * @param {string} stopId - Stop ID
   * @param {Object} updates - Fields to update
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object|null>} Updated stop or null if not found
   */
  async updateStop(stopId, updates, user) {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'location_address', 'city', 'state', 'zip_code', 'latitude', 'longitude',
      'scheduled_time', 'estimated_duration', 'actual_arrival_time',
      'actual_departure_time', 'status', 'notes', 'stop_order',
    ];

    for (const field of allowedFields) {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (updates[field] !== undefined || updates[camelField] !== undefined) {
        setClause.push(`${field} = $${paramIndex}`);
        values.push(updates[field] ?? updates[camelField]);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(stopId);

    const query = `
      UPDATE appointment_stops
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'updated', { id: result.rows[0].appointment_id, title: 'Stop updated' });

    return result.rows[0];
  }

  /**
   * Delete a stop
   * @param {string} stopId - Stop ID
   * @param {Object} user - Authenticated user
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteStop(stopId, user) {
    // Get appointment ID before deletion
    const getQuery = 'SELECT appointment_id FROM appointment_stops WHERE id = $1';
    const getResult = await pool.query(getQuery, [stopId]);

    if (getResult.rows.length === 0) {
      return false;
    }

    const appointmentId = getResult.rows[0].appointment_id;

    const deleteQuery = 'DELETE FROM appointment_stops WHERE id = $1';
    await pool.query(deleteQuery, [stopId]);

    // Reorder remaining stops
    await this._reorderStops(appointmentId);

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'updated', { id: appointmentId, title: 'Stop deleted' });

    return true;
  }

  /**
   * Reorder stops after deletion
   * @private
   */
  async _reorderStops(appointmentId) {
    const query = `
      WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY stop_order) as new_order
        FROM appointment_stops
        WHERE appointment_id = $1
      )
      UPDATE appointment_stops
      SET stop_order = ordered.new_order
      FROM ordered
      WHERE appointment_stops.id = ordered.id
    `;
    await pool.query(query, [appointmentId]);
  }

  /**
   * Update stops for an appointment (replace all)
   * @param {string} appointmentId - Appointment ID
   * @param {Array} stops - Array of stop data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Array>} Updated stops
   */
  async updateStops(appointmentId, stops, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete existing stops
      await client.query('DELETE FROM appointment_stops WHERE appointment_id = $1', [appointmentId]);

      // Insert new stops
      const insertedStops = [];
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const query = `
          INSERT INTO appointment_stops (
            appointment_id, stop_order, location_address, city, state, zip_code,
            latitude, longitude, scheduled_time, estimated_duration, notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;

        const values = [
          appointmentId,
          i + 1,
          stop.location_address || stop.locationAddress || null,
          stop.city || null,
          stop.state || null,
          stop.zip_code || stop.zipCode || null,
          stop.latitude || null,
          stop.longitude || null,
          stop.scheduled_time || stop.scheduledTime || null,
          stop.estimated_duration || stop.estimatedDuration || 30,
          stop.notes || null,
        ];

        const result = await client.query(query, values);
        insertedStops.push(result.rows[0]);
      }

      await client.query('COMMIT');

      // Emit WebSocket event
      this._emitWebSocketEvent(user, 'updated', { id: appointmentId, title: 'Stops updated' });

      return insertedStops;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // ATTENDEES MANAGEMENT
  // ============================================================================

  /**
   * Add an attendee to an appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Object} attendeeData - Attendee data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Created attendee
   */
  async addAttendee(appointmentId, attendeeData, user) {
    const {
      clientId,
      leadId,
      contactId,
      attendeeType,
      displayName,
      email,
      phone,
      rsvpStatus = 'pending',
      isPrimary = false,
    } = attendeeData;

    // Determine attendee type
    let type = attendeeType;
    if (!type) {
      if (clientId) type = 'client';
      else if (leadId) type = 'lead';
      else if (contactId) type = 'contact';
      else type = 'agent';
    }

    const query = `
      INSERT INTO appointment_attendees (
        appointment_id, client_id, lead_id, contact_id, attendee_type,
        display_name, email, phone, rsvp_status, is_primary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      appointmentId,
      clientId || null,
      leadId || null,
      contactId || null,
      type,
      displayName || null,
      email || null,
      phone || null,
      rsvpStatus,
      isPrimary,
    ];

    const result = await pool.query(query, values);

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'updated', { id: appointmentId, title: 'Attendee added' });

    return result.rows[0];
  }

  /**
   * Remove an attendee from an appointment
   * @param {string} attendeeId - Attendee ID
   * @param {Object} user - Authenticated user
   * @returns {Promise<boolean>} True if deleted
   */
  async removeAttendee(attendeeId, user) {
    // Get appointment ID before deletion
    const getQuery = 'SELECT appointment_id FROM appointment_attendees WHERE id = $1';
    const getResult = await pool.query(getQuery, [attendeeId]);

    if (getResult.rows.length === 0) {
      return false;
    }

    const appointmentId = getResult.rows[0].appointment_id;

    const deleteQuery = 'DELETE FROM appointment_attendees WHERE id = $1';
    await pool.query(deleteQuery, [attendeeId]);

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'updated', { id: appointmentId, title: 'Attendee removed' });

    return true;
  }

  /**
   * Update attendees for an appointment (replace all)
   * @param {string} appointmentId - Appointment ID
   * @param {Array} attendees - Array of attendee data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Array>} Updated attendees
   */
  async updateAttendees(appointmentId, attendees, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete existing attendees
      await client.query('DELETE FROM appointment_attendees WHERE appointment_id = $1', [appointmentId]);

      // Insert new attendees
      const insertedAttendees = [];
      for (const attendee of attendees) {
        // Determine attendee type
        let type = attendee.attendee_type || attendee.attendeeType;
        if (!type) {
          if (attendee.client_id || attendee.clientId) type = 'client';
          else if (attendee.lead_id || attendee.leadId) type = 'lead';
          else if (attendee.contact_id || attendee.contactId) type = 'contact';
          else type = 'agent';
        }

        const query = `
          INSERT INTO appointment_attendees (
            appointment_id, client_id, lead_id, contact_id, attendee_type,
            display_name, email, phone, rsvp_status, is_primary
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;

        const values = [
          appointmentId,
          attendee.client_id || attendee.clientId || null,
          attendee.lead_id || attendee.leadId || null,
          attendee.contact_id || attendee.contactId || null,
          type,
          attendee.display_name || attendee.displayName || attendee.resolved_name || null,
          attendee.email || attendee.resolved_email || null,
          attendee.phone || attendee.resolved_phone || null,
          attendee.rsvp_status || attendee.rsvpStatus || 'pending',
          attendee.is_primary || attendee.isPrimary || false,
        ];

        const result = await client.query(query, values);
        insertedAttendees.push(result.rows[0]);
      }

      await client.query('COMMIT');

      // Emit WebSocket event
      this._emitWebSocketEvent(user, 'updated', { id: appointmentId, title: 'Attendees updated' });

      return insertedAttendees;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // SHOWINGS MANAGEMENT (for 'showing' type appointments)
  // ============================================================================

  /**
   * Add a showing to an appointment (links a listing to a stop)
   * @param {string} appointmentId - Appointment ID
   * @param {Object} showingData - Showing data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Created showing with listing info
   */
  async addShowing(appointmentId, showingData, user) {
    const {
      stopId,
      listingId,
      showingOrder,
      showingType = 'first_showing',
      accessType,
      lockboxCode,
      accessNotes,
    } = showingData;

    // Get current max showing_order if not provided
    let order = showingOrder;
    if (!order) {
      const maxOrderQuery = `
        SELECT COALESCE(MAX(showing_order), 0) as max_order
        FROM showings
        WHERE appointment_id = $1
      `;
      const maxOrderResult = await pool.query(maxOrderQuery, [appointmentId]);
      order = maxOrderResult.rows[0].max_order + 1;
    }

    const query = `
      INSERT INTO showings (
        appointment_id, stop_id, listing_id, showing_order, showing_type,
        access_type, lockbox_code, access_notes, showing_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *
    `;

    const values = [
      appointmentId,
      stopId || null,
      listingId,
      order,
      showingType,
      accessType || null,
      lockboxCode || null,
      accessNotes || null,
    ];

    const result = await pool.query(query, values);
    const showing = result.rows[0];

    // Fetch listing details
    const listingQuery = `
      SELECT l.*,
        (SELECT url FROM listing_photos WHERE listing_id = l.id ORDER BY photo_order LIMIT 1) as primary_photo
      FROM listings l
      WHERE l.id = $1
    `;
    const listingResult = await pool.query(listingQuery, [listingId]);
    if (listingResult.rows.length > 0) {
      showing.listing = listingResult.rows[0];
    }

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'updated', { id: appointmentId, title: 'Showing added' });

    return showing;
  }

  /**
   * Update a showing
   * @param {string} showingId - Showing ID
   * @param {Object} updates - Fields to update
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object|null>} Updated showing or null if not found
   */
  async updateShowing(showingId, updates, user) {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'stop_id', 'showing_order', 'showing_status', 'showing_type',
      'requested_at', 'confirmed_at', 'confirmation_number',
      'access_type', 'lockbox_code', 'access_notes',
      'client_interest_level', 'agent_notes', 'client_feedback',
    ];

    for (const field of allowedFields) {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (updates[field] !== undefined || updates[camelField] !== undefined) {
        setClause.push(`${field} = $${paramIndex}`);
        values.push(updates[field] ?? updates[camelField]);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(showingId);

    const query = `
      UPDATE showings
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'updated', { id: result.rows[0].appointment_id, title: 'Showing updated' });

    return result.rows[0];
  }

  /**
   * Delete a showing
   * @param {string} showingId - Showing ID
   * @param {Object} user - Authenticated user
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteShowing(showingId, user) {
    const getQuery = 'SELECT appointment_id FROM showings WHERE id = $1';
    const getResult = await pool.query(getQuery, [showingId]);

    if (getResult.rows.length === 0) {
      return false;
    }

    const appointmentId = getResult.rows[0].appointment_id;

    const deleteQuery = 'DELETE FROM showings WHERE id = $1';
    await pool.query(deleteQuery, [showingId]);

    // Reorder remaining showings
    await this._reorderShowings(appointmentId);

    // Emit WebSocket event
    this._emitWebSocketEvent(user, 'updated', { id: appointmentId, title: 'Showing deleted' });

    return true;
  }

  /**
   * Reorder showings after deletion
   * @private
   */
  async _reorderShowings(appointmentId) {
    const query = `
      WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY showing_order) as new_order
        FROM showings
        WHERE appointment_id = $1
      )
      UPDATE showings
      SET showing_order = ordered.new_order
      FROM ordered
      WHERE showings.id = ordered.id
    `;
    await pool.query(query, [appointmentId]);
  }

  /**
   * Get showings for an appointment with listing details
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Array>} Showings with listing info
   */
  async getShowings(appointmentId) {
    const query = `
      SELECT s.*,
        l.property_address, l.city, l.state, l.zip_code,
        l.list_price, l.bedrooms, l.bathrooms, l.square_feet,
        l.listing_status, l.mls_number,
        (SELECT url FROM listing_photos WHERE listing_id = l.id ORDER BY photo_order LIMIT 1) as primary_photo
      FROM showings s
      LEFT JOIN listings l ON s.listing_id = l.id
      WHERE s.appointment_id = $1
      ORDER BY s.showing_order ASC
    `;
    const result = await pool.query(query, [appointmentId]);
    return result.rows;
  }

  /**
   * Update showings for an appointment (replace all)
   * @param {string} appointmentId - Appointment ID
   * @param {Array} showings - Array of showing data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Array>} Updated showings
   */
  async updateShowings(appointmentId, showings, user) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete existing showings
      await client.query('DELETE FROM showings WHERE appointment_id = $1', [appointmentId]);

      // Insert new showings
      const insertedShowings = [];
      for (let i = 0; i < showings.length; i++) {
        const showing = showings[i];
        const query = `
          INSERT INTO showings (
            appointment_id, stop_id, listing_id, showing_order, showing_type,
            showing_status, access_type, lockbox_code, access_notes,
            client_interest_level, agent_notes, client_feedback
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `;

        const values = [
          appointmentId,
          showing.stop_id || showing.stopId || null,
          showing.listing_id || showing.listingId,
          i + 1,
          showing.showing_type || showing.showingType || 'first_showing',
          showing.showing_status || showing.showingStatus || 'pending',
          showing.access_type || showing.accessType || null,
          showing.lockbox_code || showing.lockboxCode || null,
          showing.access_notes || showing.accessNotes || null,
          showing.client_interest_level || showing.clientInterestLevel || null,
          showing.agent_notes || showing.agentNotes || null,
          showing.client_feedback || showing.clientFeedback || null,
        ];

        const result = await client.query(query, values);
        insertedShowings.push(result.rows[0]);
      }

      await client.query('COMMIT');

      // Emit WebSocket event
      this._emitWebSocketEvent(user, 'updated', { id: appointmentId, title: 'Showings updated' });

      return insertedShowings;
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
