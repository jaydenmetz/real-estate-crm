const { pool } = require('../../../config/database');
const logger = require('../../../utils/logger');
const websocketService = require('../../../services/websocket.service');
const { buildOwnershipWhereClauseWithAlias, validateScope, getDefaultScope } = require('../../../utils/ownership.helper');

// GET /api/v1/appointments
exports.getAppointments = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20,
    } = req.query;

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

    // PHASE 2: Handle ownership-based scope filtering with INHERITED PRIVACY (multi-tenant)
    // CRITICAL: Appointments inherit privacy from linked leads
    // If appointment.lead_id → lead.is_private = TRUE, then appointment is private
    const userRole = req.user?.role;
    const requestedScope = req.query.scope || getDefaultScope(userRole);
    const scope = validateScope(requestedScope, userRole);

    // Build ownership filter with inherited privacy support (appointments table alias is 'a')
    const ownershipFilter = buildOwnershipWhereClauseWithAlias(
      req.user,
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

    // Query for paginated data (JOIN with clients and contacts to get client_name)
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

    res.json({
      success: true,
      data: {
        appointments: dataResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit: parseInt(limit),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch appointments',
        details: error.message,
      },
    });
  }
};

// GET /api/v1/appointments/:id
exports.getAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM appointments WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch appointment',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/appointments
exports.createAppointment = async (req, res) => {
  try {
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
    } = req.body;

    // Validation
    if (!title || !appointmentDate || !startTime) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Title, date, and start time are required',
        },
      });
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
      req.user?.id || null,
      req.user?.teamId || req.user?.team_id || null,
    ];

    const result = await pool.query(query, values);
    const newAppt = result.rows[0];

    // Emit WebSocket event for real-time updates
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const eventData = {
      entityType: 'appointment',
      entityId: newAppt.id,
      action: 'created',
      data: { id: newAppt.id, title: newAppt.title, appointmentDate: newAppt.appointment_date }
    };
    if (teamId) websocketService.sendToTeam(teamId, 'data:update', eventData);
    if (userId) websocketService.sendToUser(userId, 'data:update', eventData);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Appointment created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create appointment',
        details: error.message,
      },
    });
  }
};

// PUT /api/v1/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

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
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No valid fields to update',
        },
      });
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    setClause.push('version = version + 1');
    setClause.push(`last_modified_by = $${paramIndex}`);
    values.push(req.user?.id || null);
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
      const teamId = req.user?.teamId || req.user?.team_id;
      const userId = req.user?.id;
      const eventData = {
        entityType: 'appointment',
        entityId: updatedAppt.id,
        action: 'updated',
        data: { id: updatedAppt.id, title: updatedAppt.title }
      };
      if (teamId) websocketService.sendToTeam(teamId, 'data:update', eventData);
      if (userId) websocketService.sendToUser(userId, 'data:update', eventData);
    }

    if (result.rows.length === 0) {
      // Check if record exists but version mismatch
      if (clientVersion !== undefined) {
        const checkQuery = 'SELECT version FROM appointments WHERE id = $1 AND deleted_at IS NULL';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Appointment not found',
            },
          });
        }
        return res.status(409).json({
          success: false,
          error: {
            code: 'VERSION_CONFLICT',
            message: 'This appointment was modified by another user. Please refresh and try again.',
            currentVersion: checkResult.rows[0].version,
            attemptedVersion: clientVersion,
          },
        });
      }

      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update appointment',
        details: error.message,
      },
    });
  }
};

// PUT /api/v1/appointments/:id/archive
exports.archiveAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE appointments
      SET deleted_at = CURRENT_TIMESTAMP, status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment archived successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error archiving appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive appointment',
        details: error.message,
      },
    });
  }
};

// DELETE /api/v1/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment is archived
    const checkQuery = 'SELECT deleted_at FROM appointments WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    if (!checkResult.rows[0].deleted_at) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: 'Appointment must be archived before deletion',
        },
      });
    }

    const deleteQuery = 'DELETE FROM appointments WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    // Emit WebSocket event for deleted appointment
    const teamId = req.user?.teamId || req.user?.team_id;
    const userId = req.user?.id;
    const eventData = {
      entityType: 'appointment',
      entityId: id,
      action: 'deleted',
      data: { id: id }
    };
    if (teamId) websocketService.sendToTeam(teamId, 'data:update', eventData);
    if (userId) websocketService.sendToUser(userId, 'data:update', eventData);

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete appointment',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE appointments
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment cancelled successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_ERROR',
        message: 'Failed to cancel appointment',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/appointments/:id/complete
exports.markComplete = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE appointments
      SET status = 'Completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment marked as completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error marking appointment complete:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPLETE_ERROR',
        message: 'Failed to mark appointment as complete',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/appointments/batch-delete
exports.batchDeleteAppointments = async (req, res) => {
  const client = await pool.connect();

  try {
    const { ids } = req.body;

    await client.query('BEGIN');

    // Check which appointments exist and are archived
    const existCheckQuery = `
      SELECT id, deleted_at FROM appointments
      WHERE id = ANY($1)
    `;
    const existResult = await client.query(existCheckQuery, [ids]);

    if (existResult.rows.length === 0) {
      await client.query('COMMIT');
      return res.json({
        success: true,
        message: 'No appointments found to delete',
        deletedCount: 0,
        deletedIds: [],
      });
    }

    // Check if any are not archived
    const activeAppointments = existResult.rows.filter((r) => !r.deleted_at);
    if (activeAppointments.length > 0) {
      await client.query('ROLLBACK');
      const activeIds = activeAppointments.map((r) => r.id);
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: `Some appointments are not archived: ${activeIds.join(', ')}`,
        },
      });
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

    res.json({
      success: true,
      message: `Successfully deleted ${result.rowCount} appointments`,
      deletedCount: result.rowCount,
      deletedIds: result.rows.map((r) => r.id),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error batch deleting appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to batch delete appointments',
        details: error.message,
      },
    });
  } finally {
    client.release();
  }
};
